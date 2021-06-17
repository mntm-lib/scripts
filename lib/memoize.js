module.exports = (fn) => {
  const cache = new WeakMap();
  return (param) => {
    if (cache.has(param)) {
      return cache.get(param);
    }

    const result = fn(param);
    cache.set(param, result);
    return result;
  };
};
