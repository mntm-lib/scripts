/*
 * @param {'production'|'development'} mode
 */
module.exports = (mode = 'development', isLegacy = true) => {
  return mode !== 'development' && !isLegacy;
};
