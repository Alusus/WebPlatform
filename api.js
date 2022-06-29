const STACK_SIZE = 8192;
const wasmApi = {};
const eventsQueue = [];
const resources = {};
let resourceCounter = 0;
let program;
let wasmMemory = null;
let asyncifyDataPtr; // Where the unwind/rewind data structure will live.
let sleeping = false;
let eventWaiting = false;
let wasmStrPtr = null;

// Element Management APIs

wasmApi.createElement = (elementType, elementName, parentName) => {
  const parent = document.getElementById(toJsString(parentName));
  const element = document.createElement(toJsString(elementType));
  parent.appendChild(element);
  element.setAttribute('id', toJsString(elementName));
}

wasmApi.deleteElement = (elementName) => {
  const element = document.getElementById(toJsString(elementName));
  if (element) element.remove();
}

wasmApi.setElementAttribute = (elementName, propName, value) => {
  const prop = toJsString(propName);
  if (prop === 'innerHTML') {
    document.getElementById(toJsString(elementName)).innerHTML = toJsString(value);
  } else if (prop === 'value') {
    document.getElementById(toJsString(elementName)).value = toJsString(value);
  } else {
    document.getElementById(toJsString(elementName)).setAttribute(prop, toJsString(value));
  }
}

wasmApi.getElementAttribute = (elementName, propName) => {
  const prop = toJsString(propName);
  let result;
  if (prop === 'innerHTML') result = document.getElementById(toJsString(elementName)).innerHTML;
  else if (prop === 'value') result = document.getElementById(toJsString(elementName)).value;
  else result = document.getElementById(toJsString(elementName)).getAttribute(prop);
  return toWasmString(result);
}

// Event Loop APIs

wasmApi.fetchNextEvent = () => {
    if (eventsQueue.length === 0) return 0;
    const result = stringifyEvent(eventsQueue[0]);
    eventsQueue.splice(0, 1);
    return toWasmString(result);
}

wasmApi.registerElementEventHandler = (elementName, eventName, cbId) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    document.getElementById(jsElementName)[`on${jsEventName}`] = (event) => {
      onEvent(cbId, true, jsEventName, event);
    };
}

wasmApi.unregisterElementEventHandler = (elementName, eventName) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    document.getElementById(jsElementName)[`on${jsEventName}`] = null;
}

wasmApi.waitForEvent = () => {
  const view = new Int32Array(wasmMemory.buffer, asyncifyDataPtr);
  if (!eventWaiting) {
    // We are called in order to start a sleep/unwind.
    // Fill in the data structure with the start pos and end pos of the stack.
    view[0] = asyncifyDataPtr + 8;
    view[1] = asyncifyDataPtr + 8 + STACK_SIZE;

    program.instance.exports.asyncify_start_unwind(asyncifyDataPtr);
    eventWaiting = true;
  } else {
    // We are called as part of a resume/rewind. Stop waiting.
    program.instance.exports.asyncify_stop_rewind();
    eventWaiting = false;
  }
}

wasmApi.usleep = (ms) => {
  const view = new Int32Array(wasmMemory.buffer, asyncifyDataPtr);
  if (!sleeping) {
    // We are called in order to start a sleep/unwind.
    // Fill in the data structure with the start pos and end pos of the stack.
    view[0] = asyncifyDataPtr + 8;
    view[1] = asyncifyDataPtr + 8 + STACK_SIZE;

    program.instance.exports.asyncify_start_unwind(asyncifyDataPtr);
    sleeping = true;

    setTimeout(function() {
      program.instance.exports.asyncify_start_rewind(asyncifyDataPtr);
      // The code is now ready to rewind; re-enter the program from the
      // same entry point to start the rewind process.
      program.instance.exports.wasmStart();
    }, ms/1000);
  } else {
    // We are called as part of a resume/rewind. Stop sleeping.
    program.instance.exports.asyncify_stop_rewind();
    sleeping = false;
  }
}

// Async Operations APIs

wasmApi.sendRequest = (method, uri, headers, body, timeoutInMs, cbId) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => {
    controller.abort();
    onEvent(cbId, false, 'sendRequest', {
      status: 0,
      body: "Connection timeout"
    });
  }, timeoutInMs)

  fetch(toJsString(uri), {
    method: toJsString(method),
    headers: (toJsString(headers) || "").split('\n').reduce((result, header) => {
      header = header.trim();
      if (header == '') return result;
      const pair = header.split(':');
      if (pair.length != 2) return result;
      return { ...result, [pair[0].trim()]: pair[1].trim() };
    }, {}),
    body: toJsString(body),
    signal
  }).then(response => {
    return response.text().then(bodyText => {
      clearTimeout(timeoutId);
      onEvent(cbId, false, 'sendRequest', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: bodyText
      });
    });
  }).catch(err => {
    clearTimeout(timeoutId);
    onEvent(cbId, false, 'sendRequest', {
      status: 0,
      body: err.message
    });
  });
}

wasmApi.startTimer = (duration, cbId) => {
  return setInterval(() => {
    onEvent(cbId, true, 'timer', {});
  }, duration/1000);
}

wasmApi.stopTimer = (id) => {
  clearInterval(id);
}

wasmApi.setTimeout = (duration, cbId) => {
  return setTimeout(() => {
    onEvent(cbId, false, 'timer', {});
  }, duration/1000);
}

wasmApi.cancelTimeout = (id) => {
  clearTimeout(id);
}

// Resource Management

wasmApi.loadImage = (url, cbId) => {
  const image = new Image();
  const resourceId = ++resourceCounter;
  image.onload = () => {
    onEvent(cbId, false, 'loadImage', { resourceId });
  };
  image.src = toJsString(url);
  resources[resourceId] = image;
  return resourceId;
}

wasmApi.createCanvasResource = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const resourceId = ++resourceCounter;
  resources[resourceId] = canvas;
  return resourceId;
}

wasmApi.createImageResourceFromCanvasResource = (canvasId) => {
  const canvas = resources[canvasId];
  const image = new Image();
  const resourceId = ++resourceCounter;
  image.src = canvas.toDataURL('image/png');
  resources[resourceId] = image;
  return resourceId;
}

wasmApi.registerElementAsResource = (elementName) => {
  const element = document.getElementById(toJsString(elementName));
  const resourceId = ++resourceCounter;
  resources[resourceId] = element;
  return resourceId;
}

wasmApi.loadAudio = (url, cbId) => {
  const audio = document.createElement('audio');
  const resourceId = ++resourceCounter;
  audio.onloadeddata = () => {
    onEvent(cbId, false, 'loadAudio', { resourceId });
  };
  audio.src = toJsString(url);
  resources[resourceId] = audio;
  return resourceId;
}

wasmApi.releaseResource = (resourceId) => {
  delete resources[resourceId];
}

wasmApi.loadFont = (fontName, url, cbId) => {
  const font = new FontFace(toJsString(fontName), `url(${toJsString(url)})`);
  font.load().then(() => {
    document.fonts.add(font);
    onEvent(cbId, false, 'loadFont', {});
  });
}

// Canvas APIs

wasmApi.drawLine = (canvasId, x1, y1, x2, y2) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

wasmApi.drawPolygon = (canvasId, pointCount, points, filled) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  const pointsArray = new Int32Array(wasmMemory.buffer, points, pointCount * 2);
  ctx.moveTo(pointsArray[0], pointsArray[1]);
  for  (var i = 1; i < pointCount; i++){
    ctx.lineTo(pointsArray[i*2], pointsArray[i*2+1]);
  }
  ctx.closePath();
  if (filled) ctx.fill();
  else ctx.stroke();
}

wasmApi.drawCircle = (canvasId, x1, y1, x2, y2) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(x1, y1, x2, 0, 2 * Math.PI);
  ctx.stroke();
}

wasmApi.drawText = (canvasId, text, font, x, y) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.font = toJsString(font);
  ctx.fillText(toJsString(text), x, y);
}

wasmApi.setFillStyle = (canvasId, c1, c2, x1, y1, x2, y2) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, toJsString(c1));
  gradient.addColorStop(1, toJsString(c2));
  ctx.fillStyle = gradient;
}

wasmApi.setStrokeStyle = (canvasId, ss) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.strokeStyle = toJsString(ss);
}

wasmApi.setLineWidth = (canvasId, lw) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = lw;
}

wasmApi.drawImage = (canvasId, imgId, x, y, w, h, a) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalAlpha = a;
  if (w === -1) ctx.drawImage(resources[imgId], x, y);
  else ctx.drawImage(resources[imgId], x, y, w, h);
  ctx.restore();
}

wasmApi.clearCanvas = (canvasId) => {
  var canvas = resources[canvasId];
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Audio APIs

wasmApi.playAudio = (audioId, loop) => {
  var audio = resources[audioId];
  if (!audio.paused) {
    audio = audio.cloneNode();
  }
  audio.loop = loop;
  audio.play();
}

wasmApi.stopAudio = (audioId) => {
  var audio = resources[audioId];
  audio.pause();
  audio.currentTime = 0;
}

// Misc APIs

wasmApi.logToConsole = (msg) => {
  console.log(toJsString(msg));
}

// Helper Functions

function stringifyEvent(event) {
  const obj = { cbId: event.cbId, recurring: event.recurring, eventName: event.eventName, eventData: {} };
  for (let k in event.eventData) {
    obj.eventData[k] = event.eventData[k];
  }
  return JSON.stringify(obj, (k, v) => {
    if (v instanceof Node) return 'Node';
    if (v instanceof Window) return 'Window';
    return v;
  }, ' ');
}

function onEvent (cbId, recurring, eventName, event) {
  eventsQueue.push({ cbId, recurring, eventName, eventData: event });

  // Unblock wasm if it's waiting for events.
  if (eventWaiting) {
    program.instance.exports.asyncify_start_rewind(asyncifyDataPtr);
    // The code is now ready to rewind; re-enter the program from the
    // same entry point to start the rewind process.
    program.instance.exports.wasmStart();
  }
}

function toJsString(strPtr) {
  if (strPtr == 0) return null;
  let view = new Uint8Array(wasmMemory.buffer, strPtr);
  const nul = view.indexOf(0);
  if (nul !== -1) view = view.subarray(0, nul);
  return (new TextDecoder()).decode(view);
}

function toWasmString(str) {
  if (str === null || str === undefined) return 0;
  const encoder = new TextEncoder();
  const buffer = encoder.encode(str);
  wasmStrPtr = program.instance.exports.realloc(wasmStrPtr, buffer.length + 1);
  let view = new Uint8Array(wasmMemory.buffer, wasmStrPtr, buffer.length + 1);
  view.set(buffer);
  view[buffer.length] = 0;
  return wasmStrPtr;
}

// Main Functions

async function loadWasm(filename, importTable) {
  let request = await fetch(filename);
  let binary = await request.arrayBuffer();
  return WebAssembly.instantiate( binary, { "env": importTable } );
}

async function start(moduleName) {
  program = await loadWasm(moduleName, wasmApi);
  wasmMemory = program.instance.exports.memory;

  asyncifyDataPtr = program.instance.exports.malloc(STACK_SIZE + 8);

  // Call global constructors.
  const programConstructors=Object.keys(program.instance.exports).filter(name => name.match(/^__constructor__/));
  programConstructors.forEach(name => {
    program.instance.exports[name]()
  });

  program.instance.exports.wasmStart();
  program.instance.exports.asyncify_stop_unwind();
}

