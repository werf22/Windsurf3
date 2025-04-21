if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => require('core-js-pure/features/structured-clone')(obj);
}
