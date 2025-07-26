/**
 * 有分隔符的字符串转大驼峰
 * @param {string} str 字符串
 * @param {string} sep 分隔符
 * @returns {string} 转换结果
 */
function lineToCamel(str = "", sep = "-") {
  const reg = new RegExp(`(^|${sep})(\\w)`, "g");
  // return str.replace(/(^|-)(\w)/g, (m, $1, $2) => $2.toUpperCase());
  return str.replace(reg, (m, $1, $2) => $2.toUpperCase());
}
// 小驼峰转大驼峰
function littleToBig(str = "") {
  return str.replace(/^(\w)/g, (m, $1) => $1.toUpperCase());
}

module.exports = { lineToCamel, littleToBig };
