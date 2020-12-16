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

wasmApi.registerEventHandler = (elementName, eventName, elementPtr) => {
    const jsElementName = toJsString(elementName);
    const jsEventName = toJsString(eventName);
    document.getElementById(jsElementName)[`on${jsEventName}`] = (event) => {
      onEvent(elementPtr, jsEventName, event);
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

function stringifyEvent(event) {
  const obj = { elementPtr: event.elementPtr, eventName: event.eventName, eventData: {} };
  for (let k in event.eventData) {
    obj.eventData[k] = event.eventData[k];
  }
  return JSON.stringify(obj, (k, v) => {
    if (v instanceof Node) return 'Node';
    if (v instanceof Window) return 'Window';
    return v;
  }, ' ');
}

function onEvent (elementPtr, eventName, event) {
  eventsQueue.push({ elementPtr, eventName, eventData: event });

  // Unblock wasm if it's waiting for events.
  if (eventWaiting) {
    program.instance.exports.asyncify_start_rewind(asyncifyDataPtr);
    // The code is now ready to rewind; re-enter the program from the
    // same entry point to start the rewind process.
    program.instance.exports.wasmStart();
  }
}

function toJsString(strPtr) {
  let view = new Uint8Array(wasmMemory.buffer, strPtr);
  const nul = view.indexOf(0);
  if (nul !== -1) view = view.subarray(0, nul);
  return (new TextDecoder()).decode(view);
}

function toWasmString(str) {
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

  program.instance.exports.wasmStart();
  program.instance.exports.asyncify_stop_unwind();
}


