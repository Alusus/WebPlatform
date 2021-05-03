const STACK_SIZE = 8192;
const wasmApi = {};
const eventsQueue = [];
let program;
let wasmMemory = null;
let asyncifyDataPtr; // Where the unwind/rewind data structure will live.
let sleeping = false;
let eventWaiting = false;
let wasmStrPtr = null;

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

wasmApi.fetchNextEvent = () => {
    if (eventsQueue.length === 0) return 0;
    const result = stringifyEvent(eventsQueue[0]);
    eventsQueue.splice(0, 1);
    return toWasmString(result);
}

wasmApi.registerEventHandler = (elementName, eventName, slotPtr) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    document.getElementById(jsElementName)[`on${jsEventName}`] = (event) => {
      onEvent(slotPtr, jsEventName, event);
    };
}

wasmApi.unregisterEventHandler = (elementName, eventName) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    document.getElementById(jsElementName)[`on${jsEventName}`] = null;
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

wasmApi.drawLine = (name, x1, y1, x2, y2) => {
  var c = document.getElementById(toJsString(name));
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke(); 
}

wasmApi.drawPolygon = (name, pointCount, points) => {
  var canvas = document.getElementById(toJsString(name));
  var ctx = canvas.getContext("2d");
  const pointsArray = new Int32Array(wasmMemory.buffer, points, pointCount * 2);
  ctx.moveTo(pointsArray[0], pointsArray[1]);
  for  (var i = 1; i < pointCount; i++){
    ctx.lineTo(pointsArray[i*2], pointsArray[i*2+1]);
  }
  ctx.closePath();
  ctx.fill();
}
  
wasmApi.drawText = (name, text, font, x, y) => {
  var canvas = document.getElementById(toJsString(name));
  var ctx = canvas.getContext("2d");
  ctx.font = toJsString(font);
  ctx.fillText(toJsString(text), x, y);
} 

wasmApi.drawCircle = (name, x1, y1, x2, y2) => {
  var circle = document.getElementById(toJsString(name));
  var ctx = circle.getContext("2d");
  ctx.beginPath(); 
  ctx.arc(x1, y1, x2, 0, 2 * Math.PI);
  ctx.stroke();
}

wasmApi.setFillStyle = (name, c1, c2, x1, y1, x2, y2) => {
  var canvas = document.getElementById(toJsString(name));
  var ctx = canvas.getContext("2d");
  var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, toJsString(c1));
  gradient.addColorStop(1, toJsString(c2));
  ctx.fillStyle = gradient;
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

wasmApi.sendRequest = (method, uri, headers, body, slotPtr) => {
  const controller = new AbortController();
  const signal = controller.signal;
  // 10 seconds timeout.
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      onEvent(slotPtr, 'sendRequest', {
        status: response.staus,
        headers: Object.fromEntries(response.headers.entries()),
        body: bodyText
      });
    });
  });
}

wasmApi.startTimer = (duration, slotPtr) => {
  return setInterval(() => {
    onEvent(slotPtr, 'timer', {});
  }, duration/1000);
}

wasmApi.stopTimer = (id) => {
  clearInterval(id);
}

wasmApi.setTimeout = (duration, slotPtr) => {
  setTimeout(() => {
    onEvent(slotPtr, 'timer', {});
  }, duration/1000);
}



function stringifyEvent(event) {
  const obj = { slotPtr: event.slotPtr, eventName: event.eventName, eventData: {} };
  for (let k in event.eventData) {
    obj.eventData[k] = event.eventData[k];
  }
  return JSON.stringify(obj, (k, v) => {
    if (v instanceof Node) return 'Node';
    if (v instanceof Window) return 'Window';
    return v;
  }, ' ');
}

function onEvent (slotPtr, eventName, event) {
  eventsQueue.push({ slotPtr, eventName, eventData: event });

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


