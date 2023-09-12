const STACK_SIZE = 8192;
const wasmApi = {};
const eventsQueue = [];
const resources = {};
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
audioContext.resume();

let resourceCounter = 0;
let program;
let wasmMemory = null;
let asyncifyDataPtr; // Where the unwind/rewind data structure will live.
let sleeping = false;
let eventWaiting = false;
let wasmStrPtr = null;
let wakeLock = null;
let appInstallPrompt = null;
let newServiceWorker = null;
let serviceWorkerRefreshing = false;

const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target.dataset.resizeObserverCbId) {
            onEvent(parseInt(entry.target.dataset.resizeObserverCbId, 10), true, 'resizeObserver', {});
        }
    }
});

// Element Management APIs

wasmApi.createElement = (elementType, elementName, parentName) => {
    const parent = document.getElementById(toJsString(parentName));
    const element = document.createElement(toJsString(elementType));
    parent.appendChild(element);
    element.setAttribute('id', toJsString(elementName));
}

wasmApi.deleteElement = (elementName) => {
    const element = document.getElementById(toJsString(elementName));
    if (!element) return;
    if (element.dataset.resizeObserverCbId) resizeObserver.unobserve(element);
    if (element) element.remove();
}

wasmApi.setStyleRule = (elementName, styleSelector, styleCss) => {
    const element = document.getElementById(toJsString(elementName));
    if (!element || !element.sheet) return;
    const selectorText = toJsString(styleSelector);
    const cssText = toJsString(styleCss);
    for (var i = 0; i < element.sheet.rules.length; ++i) {
        if (element.sheet.rules[i].selectorText == selectorText) {
            element.sheet.removeRule(i);
            break;
        }
    }
    element.sheet.insertRule(`${selectorText} { ${cssText} }`);
}

wasmApi.removeStyleRule = (elementName, styleSelector) => {
    const element = document.getElementById(toJsString(elementName));
    if (!element || !element.sheet) return;
    const selectorText = toJsString(styleSelector);
    for (var i = 0; i < element.sheet.rules.length; ++i) {
        if (element.sheet.rules[i].selectorText == selectorText) {
            element.sheet.removeRule(i);
            break;
        }
    }
}

const nonAttributeProps = ['innerHTML', 'value', 'innerText', 'textContent'];

wasmApi.setElementAttribute = (elementName, propName, value) => {
    const prop = toJsString(propName);
    if (nonAttributeProps.includes(prop)) {
        document.getElementById(toJsString(elementName))[prop] = toJsString(value);
    } else {
        document.getElementById(toJsString(elementName)).setAttribute(prop, toJsString(value));
    }
}

wasmApi.getElementAttribute = (elementName, propName) => {
    const prop = toJsString(propName);
    let result;
    if (nonAttributeProps.includes(prop)) result = document.getElementById(toJsString(elementName))[prop];
    else result = document.getElementById(toJsString(elementName)).getAttribute(prop);
    return toWasmString(result);
}

wasmApi.getElementDimensions = (elementName, pResult) => {
    const element = document.getElementById(toJsString(elementName));
    const resultArray = new Int32Array(wasmMemory.buffer, pResult, 2);
    resultArray[0] = element.clientWidth;
    resultArray[1] = element.clientHeight;
}

wasmApi.getElementBoundingRect = (elementName, pResult) => {
    const element = document.getElementById(toJsString(elementName));
    const resultArray = new Int32Array(wasmMemory.buffer, pResult, 4);
    const rect = element.getBoundingClientRect();
    resultArray[0] = rect.x;
    resultArray[1] = rect.y;
    resultArray[2] = rect.width;
    resultArray[3] = rect.height;
}

// Element Interaction

wasmApi.selectItem = (elementName, value) => {
    document.getElementById(toJsString(elementName)).value = toJsString(value);
}

wasmApi.getSelectedItemValue = (selectId) => {
    var select = document.getElementById(toJsString(selectId));
    var value = select.options[select.selectedIndex].value;
    return toWasmString(value);
}

wasmApi.scrollElementIntoView = (elementName) => {
    const element = document.getElementById(toJsString(elementName));
    if (element) element.scrollIntoView();
}

// Event Loop APIs

wasmApi.fetchNextEvent = () => {
    if (eventsQueue.length === 0) return 0;
    const result = eventsQueue[0];
    eventsQueue.splice(0, 1);
    return toWasmString(JSON.stringify(result));
}

wasmApi.registerElementEventHandler = (elementName, eventName, preventDefault, cbId) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    if (jsElementName === 'window') {
        window[`on${jsEventName}`] = (event) => {
            if (preventDefault) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    } else if (jsElementName === 'document') {
        document[`on${jsEventName}`] = (event) => {
            if (preventDefault) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    } else {
        document.getElementById(jsElementName)[`on${jsEventName}`] = (event) => {
            if (preventDefault) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    }
}

wasmApi.registerElementKeyEventHandler = (elementName, eventName, keysToSwallow, cbId) => {
    const toSwallow = toJsString(keysToSwallow).split(',');
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    if (jsElementName === 'window') {
        window[`on${jsEventName}`] = (event) => {
            if (toSwallow.includes(event.code)) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    } else if (jsElementName === 'document') {
        document[`on${jsEventName}`] = (event) => {
            if (toSwallow.includes(event.code)) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    } else {
        document.getElementById(jsElementName)[`on${jsEventName}`] = (event) => {
            if (toSwallow.includes(event.code)) event.preventDefault();
            onEvent(cbId, true, jsEventName, event);
        };
    }
}

wasmApi.unregisterElementEventHandler = (elementName, eventName) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    if (jsElementName === 'window') {
        window[`on${jsEventName}`] = null;
    } else if (jsElementName === 'document') {
        document[`on${jsEventName}`] = null;
    } else {
        const element=document.getElementById(jsElementName)
        if (!element) return;
        element[`on${jsEventName}`] = null;
    }
}

wasmApi.observeResize = (elementName, cbId) => {
    const element = document.getElementById(toJsString(elementName))
    element.dataset.resizeObserverCbId = cbId;
    resizeObserver.observe(element);
}

wasmApi.unobserveResize = (elementName) => {
    const element = document.getElementById(toJsString(elementName))
    element.dataset.resizeObserverCbId = null;
    resizeObserver.unobserve(element);
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
      resources[resourceId] = image;
      onEvent(cbId, false, 'loadImage', { resourceId, success: true });
    };
    image.onerror = () => {
      onEvent(cbId, false, 'loadImage', { success: false });
    };
    image.src = toJsString(url);
}

wasmApi.getImageDimensions = (imgId, pResult) => {
    var image = resources[imgId];
    const resultArray = new Int32Array(wasmMemory.buffer, pResult, 2);
    resultArray[0] = image.width;
    resultArray[1] = image.height;
}

wasmApi.createCanvasResource = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const resourceId = ++resourceCounter;
    resources[resourceId] = canvas;
    return resourceId;
}

wasmApi.resizeCanvasResource = (canvasId, width, height) => {
    const canvas = resources[canvasId];
    canvas.width = width;
    canvas.height = height;
}

wasmApi.createImageResourceFromCanvasResource = (canvasId, cbId) => {
    const canvas = resources[canvasId];
    const resourceId = ++resourceCounter;
    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    image.decode().then(() => {
        resources[resourceId] = image;
        onEvent(cbId, false, 'createImageResourceFromCanvasResource', { resourceId, success: true });
    }).catch((err) => {
        console.error('Failed to create image from canvas:', err);
        onEvent(cbId, false, 'createImageResourceFromCanvasResource', { success: false });
    });
}

wasmApi.registerElementAsResource = (elementName) => {
    const element = document.getElementById(toJsString(elementName));
    const resourceId = ++resourceCounter;
    resources[resourceId] = element;
    return resourceId;
}

wasmApi.loadAudio = (url, cbId) => {
    const jsUrl = toJsString(url);
    fetch(jsUrl).then((res) => {
        if (!res.ok) {
            throw new Error(`Request for ${toJsString(url)} failed with status ${res.status}`);
        }
        return res.arrayBuffer().then((arrayBuf) => {
            audioContext.decodeAudioData(
                arrayBuf,
                (buffer) => {
                    audio = { volume: 1, playing: false, buffer, source: null };
                    const resourceId = ++resourceCounter;
                    resources[resourceId] = audio;
                    onEvent(cbId, false, 'loadAudio', { resourceId, success: true });
                },
                (error) => {
                    console.error('Failed to load audio:', error);
                    onEvent(cbId, false, 'loadAudio', { success: false });
                }
            );
        });
    }).catch((err) => {
        console.error('Failed to load audio:', err);
        onEvent(cbId, false, 'loadAudio', { success: false });
    });
}

wasmApi.releaseResource = (resourceId) => {
    delete resources[resourceId];
}

wasmApi.loadFont = (fontName, url, cbId) => {
    const font = new FontFace(toJsString(fontName), `url(${toJsString(url)})`);
    font.load().then(() => {
        document.fonts.add(font);
        onEvent(cbId, false, 'loadFont', { success: true });
    }).catch((err) => {
        onEvent(cbId, false, 'loadFont', { success: false });
    });
}

wasmApi.loadJsScript = (url, cbId) => {
    const script = document.createElement('script');
    document.head.appendChild(script);
    script.onload = function() {
        onEvent(cbId, false, 'loadJsScript', { success: true });
    };
    script.onerror = () => {
      onEvent(cbId, false, 'loadJsScript', { success: false });
      document.head.removeChild(script);
    };
    script.src = toJsString(url);
}

wasmApi.setResourceAttribute = (resourceId, name, value) => {
    resources[resourceId].setAttribute(toJsString(name), toJsString(value))
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

wasmApi.drawFilledRect = (canvasId, x, y, w, h) => {
    var canvas = resources[canvasId];
    var ctx = canvas.getContext("2d");
    ctx.fillRect(x, y, w, h);
}

wasmApi.clearRect = (canvasId, x, y, w, h) => {
    var canvas = resources[canvasId];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(x, y, w, h);
}

wasmApi.drawCircle = (canvasId, x, y, r) => {
    var canvas = resources[canvasId];
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

wasmApi.drawText = (canvasId, text, font, x, y, rtl) => {
    var canvas = resources[canvasId];
    var ctx = canvas.getContext("2d");
    ctx.font = toJsString(font);
    ctx.textBaseline = "top";
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.fillText(toJsString(text), x, y);
}

wasmApi.measureText = (canvasId, text, font, pResult) => {
    var canvas = resources[canvasId];
    var ctx = canvas.getContext("2d");
    ctx.font = toJsString(font);
    var dims = ctx.measureText(toJsString(text));
    const resultArray = new Int32Array(wasmMemory.buffer, pResult, 2);
    resultArray[0] = dims.width;
    resultArray[1] = dims.fontBoundingBoxAscent + dims.fontBoundingBoxDescent;
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

wasmApi.suspendAudioContext = () => {
    audioContext.suspend();
}

wasmApi.resumeAudioContext = () => {
    audioContext.resume();
}

wasmApi.playAudio = (audioId, loop, stopPrevious) => {
    try {
      var audio = resources[audioId];
      if (!audio) return;
      if (audio.playing) {
          if (stopPrevious) {
              wasmApi.stopAudio(audioId);
          } else {
              // Clone the audio object so that the old instance's event doesn't
              // end up overriding the properties of the new instance.
              audio = {
                  volume: audio.volume,
                  buffer: audio.buffer,
                  playing: false,
                  source: null,
              };
              resources[audioId] = audio;
          }
      }
      // Create the buffer source.
      audio.source = audioContext.createBufferSource();
      audio.source.buffer = audio.buffer;
      // Connect the source to the destination through a volume node in the middle.
      audio.gainNode = audioContext.createGain();
      audio.gainNode.gain.value = audio.volume;
      audio.source.connect(audio.gainNode);
      audio.gainNode.connect(audioContext.destination);
      // Reset the audio object when the playback is over.
      audio.source.addEventListener('ended', () => {
          audio.playing = false;
          audio.source = null;
          audio.gainNode = null;
      });
      // Start the playback.
      audio.source.loop = loop;
      audio.source.start();
      audio.playing = true;
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
}

wasmApi.stopAudio = (audioId) => {
    var audio = resources[audioId];
    if (!audio || !audio.source) return;
    audio.source.stop();
    audio.source = null;
    audio.gainNode = null;
    audio.playing = false;
}

wasmApi.pauseAudio = (audioId) => {
    var audio = resources[audioId];
    if (!audio || !audio.source) return;
    audio.source.playbackRate.value = 0.0001; // Work around Firefox treating 0 as 1!
}

wasmApi.resumeAudio = (audioId) => {
    var audio = resources[audioId];
    if (!audio || !audio.source) return;
    audio.source.playbackRate.value = 1;
}

wasmApi.setAudioVolume = (audioId, volume) => {
    const audio = resources[audioId];
    audio.volume = volume;
    if (!audio.gainNode) return;
    audio.gainNode.gain.value = volume;
}

wasmApi.getAudioVolume = (audioId) => {
    if (!resources[audioId]) return 0;
    return resources[audioId].volume;
}

wasmApi.isAudioPlaying = (audioId) => {
    if (!resources[audioId]) return false;
    return resources[audioId].playing;
}

// Gamepad APIs

wasmApi.getGamepadsCount = () => {
    return navigator.getGamepads().length;
}

wasmApi.getGamepadId = (gamepadIndex) => {
    return toWasmString(navigator.getGamepads().id);
}

wasmApi.getGamepadAxesCount = (gamepadIndex) => {
    return navigator.getGamepads()[gamepadIndex].axes.length;
}

wasmApi.getGamepadButtonsCount = (gamepadIndex) => {
    return navigator.getGamepads()[gamepadIndex].buttons.length;
}

wasmApi.getGamepadAxis = (gamepadIndex, axisIndex) => {
    return navigator.getGamepads()[gamepadIndex].axes[axisIndex];
}

wasmApi.getGamepadButton = (gamepadIndex, buttonIndex) => {
    return navigator.getGamepads()[gamepadIndex].buttons[buttonIndex].value;
}

// Misc APIs

wasmApi.getTimestamp = () => {
    return BigInt(Date.now());
}

wasmApi.getDate = (type, timestamp) => {
    const date = Number(timestamp) === -1 ? new Date() : new Date(Number(timestamp));
    switch (toJsString(type)) {
        case 'iso': return toWasmString(date.toISOString());
        case 'locale': return toWasmString(date.toLocaleString());
        default: return toWasmString(date.toString());
    }
}

wasmApi.requestPointerLock = (elementName) => {
    const jsElementName = toJsString(elementName);
    document.getElementById(jsElementName).requestPointerLock();
    if (!document.onpointerlockchange) {
        document.onpointerlockchange = () => {
            if (window.onpointerlockchange) {
                window.onpointerlockchange({ enabled: !!document.pointerLockElement });
            }
        }
    }
}

wasmApi.exitPointerLock = () => {
    document.exitPointerLock();
}

wasmApi.requestFullScreen = (elementName) => {
    const element = document.getElementById(toJsString(elementName));
    if (element.requestFullscreen) element.requestFullscreen();
    if (!document.onfullscreenchange) {
        document.onfullscreenchange = () => {
            if (window.onfullscreenchange) {
                window.onfullscreenchange({ enabled: !!document.fullscreenElement });
            }
        }
    }
}

wasmApi.exitFullScreen = () => {
    document.exitFullscreen();
}

wasmApi.requestWakeLock = (cbId) => {
    if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen").then((result) => {
            onEvent(cbId, false, 'requestWakeLock', { result: true });
        });
    } else {
        onEvent(cbId, false, 'requestWakeLock', { result: false });
    }
}

wasmApi.exitWakeLock = (cbId) => {
    if (wakeLock) {
        wakeLock.release().then((result) => {
            onEvent(cbId, false, 'exitWakeLock', { result: true });
        });
    } else {
        onEvent(cbId, false, 'exitWakeLock', { result: false });
    }
}

wasmApi.httpRedirect = (page) => {
    window.location.replace(toJsString(page));
}

wasmApi.pushState = (url, state) => {
  window.history.pushState(JSON.parse(toJsString(state)), null, toJsString(url));
}

wasmApi.getLocationHref = () => {
    return toWasmString(window.location.href);
}

wasmApi.getLocationProtocol = () => {
    return toWasmString(window.location.protocol);
}

wasmApi.getLocationHost = () => {
    return toWasmString(window.location.host);
}

wasmApi.getLocationPath = () => {
    return toWasmString(window.location.pathname);
}

wasmApi.getLocationSearch = () => {
    return toWasmString(window.location.search);
}

wasmApi.getLocationHash = () => {
    return toWasmString(window.location.hash);
}

wasmApi.getQueryParam = (paramName) => {
    return toWasmString(new URLSearchParams(window.location.search).get(toJsString(paramName)));
}

wasmApi.setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + (parseInt(toJsString(exdays)) * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = toJsString(cname) + "=" + toJsString(cvalue) + ";" + expires + ";path=/";
}

wasmApi.getCookie = (cname) => {
  let name = toJsString(cname) + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return toWasmString(c.substring(name.length, c.length));
    }
  }
  return toWasmString("");
}

wasmApi.addVarToSession = (varName, varValue) => {
    sessionStorage.setItem(toJsString(varName),toJsString(varValue));
}

wasmApi.getVarFromSession = (varName) => {
    return sessionStorage.getItem(toJsString(varName));
}

wasmApi.getVisibilityState = () => {
    return toWasmString(document.visibilityState);
}

wasmApi.logToConsole = (msg) => {
  console.log(toJsString(msg));
}

wasmApi.showAlert = (message) => {
    let isExecuted = confirm(toJsString(message));
    return isExecuted;
}

wasmApi.postMessage = (wasmTarget, wasmMessageType, wasmMessageBody) => {
    const target = toJsString(wasmTarget);
    const messageType = toJsString(wasmMessageType);
    const messageBody = toJsString(wasmMessageBody);
    if (target === "window") {
        window.postMessage({ type: messageType, body: messageBody }, '*');
    } else if (target === "parent") {
        window.parent.postMessage({ type: messageType, body: messageBody }, '*');
    } else {
        const element = document.getElementById(target);
        if (element) element.contentWindow.postMessage({ type: messageType, body: messageBody }, '*');
    }
}

wasmApi.callCustomJsFn = (fnName, arg) => {
    return toWasmString(window[toJsString(fnName)](toJsString(arg)));
}

wasmApi.callCustomAsyncJsFn = (fnName, arg, cbId) => {
    window[toJsString(fnName)](toJsString(arg)).then((result) => {
        onEvent(cbId, false, 'callCustomAsyncJsFn', { result });
    });
}

wasmApi.getUserLanguages = () => {
    return toWasmStringArray(navigator.languages);
}

wasmApi.isDarkColorSchemePreferred = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

wasmApi.resizeWindow = (width, height) => {
    window.resizeTo
}

// PWA APIs

wasmApi.isAppUpdateAvailable = () => {
    return !!newServiceWorker;
}

wasmApi.updateApp = () => {
    if (!newServiceWorker) return;
    newServiceWorker.postMessage({ action: 'skipWaiting' });
}

wasmApi.getAppDisplayMode = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
        return toWasmString('twa');
    } else if (navigator.standalone || isStandalone) {
        return toWasmString('standalone');
    }
    return toWasmString('browser');
}

wasmApi.isAppInstallPromptAvailable = () => {
    return !!appInstallPrompt;
}

wasmApi.showAppInstallPrompt = () => {
    if (appInstallPrompt) {
        appInstallPrompt.prompt();
        return true;
    } else {
        return false;
    }
}

// String APIs

wasmApi.createRegex = (regexStr) => {
    const regex = new RegExp(toJsString(regexStr), 'g');
    const resourceId = ++resourceCounter;
    resources[resourceId] = regex;
    return resourceId;
}

wasmApi.matchRegex = (str, regexStr, regexId, pLastIndex) => {
    const reg = regexStr ? new RegExp(toJsString(regexStr)) : resources[regexId];
    reg.lastIndex = 0;
    const result = toWasmStringArray(reg.exec(toJsString(str)));
    const pLastIndexBuf = new Int32Array(wasmMemory.buffer, pLastIndex, 1);
    pLastIndexBuf[0] = reg.lastIndex;
    return result;
}

// Storage APIs

wasmApi.getStorageLength = (storageType) => {
    return (storageType == 1 ? window.localStorage : window.sessionStorage).length;
}

wasmApi.getStorageKey = (storageType, index) => {
    return toWasmString((storageType == 1 ? window.localStorage : window.sessionStorage).key(index));
}

wasmApi.getStorageItem = (storageType, key) => {
    return toWasmString((storageType == 1 ? window.localStorage : window.sessionStorage).getItem(toJsString(key)));
}

wasmApi.setStorageItem = (storageType, key, value) => {
    (storageType == 1 ? window.localStorage : window.sessionStorage).setItem(toJsString(key), toJsString(value));
}

wasmApi.removeStorageItem = (storageType, key) => {
    (storageType == 1 ? window.localStorage : window.sessionStorage).removeItem(toJsString(key));
}

wasmApi.clearStorage = (storageType) => {
    (storageType == 1 ? window.localStorage : window.sessionStorage).clear();
}

// Libc Functions

wasmApi.rand = () => {
  return Math.floor(Math.random() * 1073741823);
}

wasmApi.printf = ()=>{}
wasmApi.exit = ()=>{}

// Helper Functions

const eventPropMap = {
    message: ['data'],
    mouseenter: [],
    mouseout: [],
    mousedown: ['button', 'offsetX', 'offsetY'],
    mouseup: ['button', 'offsetX', 'offsetY'],
    mousemove: ['offsetX', 'offsetY', 'movementX', 'movementY'],
    keydown: ['code', 'shiftKey', 'ctrlKey', 'altKey'],
    keyup: ['code', 'shiftKey', 'ctrlKey', 'altKey'],
    keypress: ['code', 'shiftKey', 'ctrlKey', 'altKey'],
    change: [],
    click: [],
    createImageResourceFromCanvasResource: ['resourceId', 'success'],
    loadImage: ['resourceId', 'success'],
    loadFont: ['success'],
    loadAudio: ['resourceId', 'success'],
    loadJsScript: ['success'],
    sendRequest: ['status', 'headers', 'body'],
    timer: [],
    touchstart: pickNeededTouchEventData,
    touchend: pickNeededTouchEventData,
    touchmove: pickNeededTouchEventData,
    touchcancel: pickNeededTouchEventData,
    resizeObserver: [],
    pointerlockchange: ['enabled'],
    fullscreenchange: ['enabled'],
    gamepadconnected: ['gamepad'],
    gamepaddisconnected: ['gamepad'],
    popstate: ['state'],
    callCustomAsyncJsFn: ['result'],
    visibilitychange: [],
    requestWakeLock: ['result'],
    exitWakeLock: ['result'],
};

function pickNeededEventData(eventName, event) {
    if (typeof eventPropMap[eventName] === 'function') {
        return eventPropMap[eventName](event);
    } else {
        const eventData = {};
        for (let k of eventPropMap[eventName]) {
            eventData[k] = event[k];
        }
        return eventData;
    }
}

function pickNeededTouchEventData(event) {
    const touches = [];
    for (let i = 0; i < event.touches.length; ++i) {
        const touch = event.touches.item(i);
        let changed = false;
        for (let j = 0; j < event.changedTouches.length; ++j) {
            if (event.changedTouches.item(j).identifier === touch.identifier) {
                changed = true;
                break;
            }
        }
        touches.push({
            identifier: touch.identifier,
            screenX: touch.screenX,
            screenY: touch.screenY,
            clientX: touch.clientX,
            clientY: touch.clientY,
            pageX: touch.pageX,
            pageY: touch.pageY,
            radiusX: touch.radiusX,
            radiusY: touch.radiusY,
            rotationAngle: touch.rotationAngle,
            force: touch.force,
            changed: Boolean(changed),
        });
    }
    return touches;
}

function onEvent (cbId, recurring, eventName, event) {
    eventsQueue.push({ cbId, recurring, eventName, eventData: pickNeededEventData(eventName, event) });

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

function toWasmStringArray(strs) {
    if (strs === null || strs === undefined || strs.length === 0) return 0;
    const encoder = new TextEncoder();
    const buffers = strs.map(s => encoder.encode(s));
    const totalSize = buffers.reduce((r, s) => { return r + s.length + 2; }, 1);
    wasmStrPtr = program.instance.exports.realloc(wasmStrPtr, totalSize);
    let pos = 0;
    buffers.forEach(buffer => {
        let view = new Uint8Array(wasmMemory.buffer, wasmStrPtr + pos, buffer.length + 3);
        view[0] = ' '.charCodeAt(0);
        view.set(buffer, 1);
        view[buffer.length + 1] = 0;
        view[buffer.length + 2] = 0;
        pos += buffer.length + 2;
    });
    return wasmStrPtr;
}

// Main Functions

async function loadWasm(filename, importTable) {
    let response = await fetch(filename);
    let binary = await response.arrayBuffer();
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

function initializeWebApp(serviceWorkerUrl, scope) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorkerUrl, { scope })
            .then((reg) => {
                if (reg.waiting) {
                    // New update was previously found and ignored.
                    console.log('Stale update is found');
                    newServiceWorker = reg.waiting;
                }
                reg.addEventListener('updatefound', () => {
                    const installingServiceWorker = reg.installing;
                    installingServiceWorker.addEventListener('statechange', () => {
                        if (installingServiceWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available.
                            newServiceWorker = installingServiceWorker;
                            window.postMessage({ type: 'app_update_available' }, '*');
                        }
                    });
                });
            })
            .catch(function(error) {
                console.error('Service Worker registration failed:', error);
            });
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (serviceWorkerRefreshing) return;
            window.location.reload();
            serviceWorkerRefreshing = true;
        });
    }
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevents the default mini-infobar or install dialog from appearing on mobile
        e.preventDefault();
        // Save the event because you'll need to trigger it later.
        appInstallPrompt = e;
        window.postMessage({ type: 'app_install_prompt' }, '*');
    });
}

