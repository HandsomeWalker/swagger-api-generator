import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function getDirname(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  return dirname(__filename);
};

/**
 * 有分隔符的字符串转大驼峰
 * @param {string} str 字符串
 * @param {string} sep 分隔符
 * @returns {string} 转换结果
 */
export function lineToCamel(str = "", sep = "-") {
  const reg = new RegExp(`(^|${sep})(\\w)`, "g");
  // return str.replace(/(^|-)(\w)/g, (m, $1, $2) => $2.toUpperCase());
  return str.replace(reg, (m, $1, $2) => $2.toUpperCase());
}
// 小驼峰转大驼峰
export function littleToBig(str = "") {
  return str.replace(/^(\w)/g, (m, $1) => $1.toUpperCase());
}
