#!/usr/bin/env node

/**
 * api接口文件生成工具，可写入npm script方便执行
 * @param url 必传，swagger文档接口，如：http://example.com/v2/api-docs
 * @param tarDir 可选，生成文件的目标目录，default: ./
 * @param fileName 可选，生成文件名，default: swagger-api
 * @param fileType 可选，生成ts还是js，default: ts
 * @param template 可选，生成的ts或者js文件顶部自定义的代码段，default: ''
 * @param expandParams 可选，是否展开传参，default: false
 * @param filter 可选，通过正则匹配接口path来筛选需要生成的接口，default: ''
 * @param mock 可选，是否生成mock请求, default: false
 * @author HandsomeWalker
 * @example
 * npx api url=http://foo/bar tarDir=./foo/bar fileName=service fileType=ts template='import request from "./funcRequest";import QS from "qs";'
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const _path = require('path');

const argvs = process.argv.slice(2);
let configObj = {
  url: '',
  tarDir: '.',
  fileName: 'swagger-api',
  fileType: 'ts',
  template: '',
  expandParams: 'false',
  filter: '',
  mock: 'false'
};
for (const key in configObj) {
  for (const item of argvs) {
    if (new RegExp(`${key}=.+`, 'g').test(item)) {
      configObj[key] = item.replace(new RegExp(`${key}=`, 'g'), '');
    }
  }
}

let count = 0;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36';
const config = {
  method: 'GET',
  headers: {
    'user-agent': UA,
  },
};

/**
 * 有分隔符的字符串转大驼峰
 * @param {string} str 字符串
 * @param {string} sep 分隔符
 * @returns {string} 转换结果
 */
function lineToCamel(str = '', sep = '-') {
  const reg = new RegExp(`(^|${sep})(\\w)`, 'g');
  // return str.replace(/(^|-)(\w)/g, (m, $1, $2) => $2.toUpperCase());
  return str.replace(reg, (m, $1, $2) => $2.toUpperCase());
}
// 小驼峰转大驼峰
function littleToBig(str = '') {
  return str.replace(/^(\w)/g, (m, $1) => $1.toUpperCase());
}

function request(options) {
  const reqModule = /^https:\/\//.test(configObj.url) ? https : http;
  return new Promise((resolve, reject) => {
    const req = reqModule.request(configObj.url, options, (res) => {
      let chunk = '';
      res.setEncoding('utf-8');
      res.on('data', (data) => {
        chunk += data;
      });
      res.on('end', () => {
        resolve(JSON.parse(chunk));
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}
const fieldTypeMap = {
  string: 'string | number',
  integer: 'string | number',
  array: 'any[]',
  object: 'any',
  boolean: 'boolean',
  ref: 'any',
};
const responseTypeMap = {
  string: 'string',
  integer: 'number',
  array: 'any[]',
  object: 'any',
  boolean: 'boolean',
  ref: 'any',
};
// 获取每行type字段
function getTypeField(item) {
  return `  '${item.name}'${item.required ? '' : '?'}: ${fieldTypeMap[item.type] ? fieldTypeMap[item.type] : 'any'};\n`;
}
// 获取响应字段配置
function getResponseFields(searchKey, resObj) {
  let responseContentProps = {};
  if (searchKey) {
    responseContentProps = definitionsObj[searchKey];
    if (responseContentProps) {
      responseContentProps = responseContentProps.properties || {};
    }
  }
  for (const key in responseContentProps) {
    const item = responseContentProps[key];
    if (!item) {
      continue;
    }
    const { description, type, originalRef } = item;
    if (originalRef && originalRef !== searchKey) {
      return getResponseFields(originalRef, resObj);
    } else {
      resObj.contentJsDoc += ` * @returns ${key} description: ${description} | type: ${type}\n`;
      if (!resObj.contentTypesDoc.includes(key)) {
        resObj.contentTypesDoc += ` * @param {${responseTypeMap[type] || 'any'}} ${key} description: ${description} | type: ${type}\n`;
      }
      if (!resObj.contentTypes.includes(key)) {
        resObj.contentTypes += `${key}: ${responseTypeMap[type] || 'any'};\n`;
      }
    }
  }
  return resObj;
}
// 获取请求体字段配置
function getParamsFields({ parameters, data, params, finalComment, finalTypes }) {
  let hasParams = false;
  let hasData = false;
  const parametersType = Object.prototype.toString.call(parameters);
  if (parametersType === '[object Object]') {
    let temp = [];
    for (const key in parameters) {
      const item = parameters[key];
      temp.push(item);
    }
    parameters = temp;
    temp = null;
  }
  for (const item of parameters) {
    // if (parametersType === '[object Array]' && item.schema) {
    //   if (item.schema.originalRef) {
    //     getParamsFields({
    //       parameters: definitionsObj[item.schema.originalRef].properties,
    //       data,
    //       params,
    //       finalComment,
    //       finalTypes,
    //     });
    //     continue;
    //   }
    // }
    if (item.in === 'header') {
      continue;
    }
    if (item.in === 'query') {
      if (params.includes(`'${item.name}': paramConfig['${item.name}']`)) {
        continue;
      }
      hasParams = true;
      params += `\t\t'${item.name}': paramConfig['${item.name}'],\n`;
    }
    if (item.in === 'body') {
      if (data.includes(`'${item.name}': paramConfig['${item.name}']`)) {
        continue;
      }
      hasData = true;
      data += `\t\t'${item.name}': paramConfig['${item.name}'],\n`;
    }
    if (item.in === 'formData') {
      if (data.includes(`'${item.name}': paramConfig['${item.name}']`)) {
        continue;
      }
      hasData = true;
      data += `\t\t'${item.name}': paramConfig['${item.name}'],\n`;
    }
    finalComment += ` * @param {${fieldTypeMap[item.type] ? fieldTypeMap[item.type] : 'any'}} ${item.name} description: ${item.description} | required: ${item.required} | type: ${item.type}\n`;
    finalTypes += getTypeField(item);
  }

  return {
    hasParams,
    hasData,
    params,
    data,
    finalComment,
    finalTypes,
  };
}
/**
 * 统一生成模板
 */
function genTemplate(path, api) {
  const names = path.split('/');
  let name = '';
  for (const item of names) {
    let temp;
    if (/-/g.test(item)) {
      temp = item.replace(/-(\w)/g, (m, $1) => $1.toUpperCase());
    } else if (/\{.+\}/g.test(item)) {
      temp = 'By' + littleToBig(item.replace(/[{}]/g, ''));
    } else {
      temp = item.replace(/^\w/g, (m) => m.toUpperCase());
    }
    name += temp;
  }
  name = name.replace(/^\w/g, (m) => m.toLowerCase());
  let contentJs = '', contentTs = '', contentType = '';
  const methods = Object.keys(api);
  methods.forEach(method => {
    count++;
    const obj = api[method];
    const tags = obj.tags.join();
    let { description, parameters, summary, responses, consumes } = obj;
    let showParamConfig = false;
    let handledPath = path;
    // 路径参数
    if (/\{\w+\}/g.test(handledPath)) {
      showParamConfig = true;
      handledPath = handledPath.replace(/\{(\w+)\}/g, (m, $1) => "${paramConfig['" + $1 + "']}");
      handledPath = '`' + handledPath + '`';
    } else {
      handledPath = "'" + handledPath + "'";
    }
    let isJsonData = true;
    let params = '  params: {\n';
    let data = '  data: {\n';
    if (consumes) {
      if (consumes[0] === 'application/json') {
        data = '  data: {\n';
      }
      if (consumes[0] === 'application/x-www-form-urlencoded') {
        isJsonData = false;
        data = "\theaders: { 'Content-Type': 'application/x-www-form-urlencoded' },\n" + '  data: QS.stringify({\n';
      }
      if (consumes[0] === 'multipart/form-data') {
        data = "\theaders: { 'Content-Type': 'multipart/form-data' },\n" + '  data: {\n';
      }
    }
    let finalParams = '';
    let finalTypes = '';
    let finalComment = '';
    let searchKey = '';
    try {
      searchKey = responses['200'].schema.originalRef;
    } catch (e) { }
    // let finalResponse = getResponseFields(searchKey, {
    //   contentJsDoc: '',
    //   contentTypes: '',
    //   contentTypesDoc: '',
    // });
    if (!parameters) {
      parameters = [];
    }
    let hasParams = false;
    let hasData = false;
    // 请求体参数
    const paramsFields = getParamsFields({
      parameters,
      data,
      params,
      finalComment,
      finalTypes,
    });
    hasParams = paramsFields.hasParams;
    hasData = paramsFields.hasData;
    params = paramsFields.params;
    data = paramsFields.data;
    finalComment = paramsFields.finalComment;
    finalTypes = paramsFields.finalTypes;
    params += '\t},\n';
    data += isJsonData ? '\t},\n' : '\t}),\n';

    if (hasParams || hasData) {
      showParamConfig = true;
    }
    if (configObj.expandParams === 'false') {
      hasParams && (finalParams += '  params: paramConfig,\n');
      hasData && (finalParams += '  data: paramConfig,\n');
    } else {
      hasParams && (finalParams += params);
      hasData && (finalParams += data);
    }
    contentJs += `
  /**
   * ${tags}-${summary}
  ${finalComment}*/
  export const ${name}${method.toUpperCase()} = (paramConfig, customConfig = {}) => request({
    url: ${handledPath},
    method: '${method}',
  ${finalParams}...customConfig,\n});
  `;
    contentTs += `
  /**
   * ${tags}-${summary}
  ${finalComment}*/
  export const ${name}${method.toUpperCase()} = (${showParamConfig ? 'paramConfig: ' + name + method.toUpperCase() + 'Props' : 'paramConfig?: ' + name + method.toUpperCase() + 'Props'
      }, customConfig: CustomConfigProps = {}) => request({
    url: ${handledPath},
    method: '${method}',
  ${finalParams}...customConfig,\n});
  `;
    contentType += `
  /**
   * ${tags}-${summary}
  ${finalComment} */
  interface ${name}${method.toUpperCase()}Props extends anyFields {
  ${finalTypes}}
  `;
  });

  return {
    contentJs,
    contentTs,
    contentType
  };
}
let definitionsObj = {};
// 递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(_path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
// 创建相应文件
function createFile(filePath, data) {
  const isFileExists = fs.existsSync(filePath);
  if (!isFileExists && configObj.tarDir !== '.') {
    mkdirsSync(configObj.tarDir);
  }
  fs.writeFileSync(filePath, data);
}
// 解析api数据入口
function handleSwaggerApis(data) {
  let contentJs = `import request from './client';\n` + configObj.template;
  let contentTs = `import request, { RequestConfig } from './client';\nimport './${configObj.fileName}Types';\n` + configObj.template + '\ntype CustomConfigProps = RequestConfig; // 修改这里为自定义配置支持TS提示\n';
  let contentType = `interface anyFields { [key: string]: any }`;
  let reg
  try {
    reg = new RegExp(configObj.filter);
  } catch (err) {
    reg = new RegExp()
    console.log('***************正则匹配出错(-_-!)*****************');
    console.log(err);
  }

  const jsPath = `${configObj.tarDir}/${configObj.fileName}.js`;
  const tsPath = `${configObj.tarDir}/${configObj.fileName}.ts`;
  const typePath = `${configObj.tarDir}/${configObj.fileName}Types.ts`;

  const pathObj = data.paths;
  definitionsObj = data.definitions;

  let contentObj = {};
  for (const path in pathObj) {
    if (!reg.test(path)) {
      continue;
    }
    contentObj = genTemplate(path, pathObj[path]);
    contentJs += contentObj.contentJs;
    contentTs += contentObj.contentTs;
    contentType += contentObj.contentType;
  }

  if (configObj.fileType === 'ts') {
    createFile(tsPath, contentTs);
    createFile(typePath, contentType);
    createFile(`${configObj.tarDir}/client.ts`, fs.readFileSync(_path.resolve(__dirname, './snipeets/client.ts'), 'utf-8'));
    if (configObj.mock === 'true') {
      createFile(`${configObj.tarDir}/handsomeChar.js`, fs.readFileSync(_path.resolve(__dirname, './snipeets/handsomeChar.js'), 'utf-8'));
      createFile(`${configObj.tarDir}/mock.ts`, fs.readFileSync(_path.resolve(__dirname, './snipeets/mock.ts'), 'utf-8'));
    }
  } else if (configObj.fileType === 'js') {
    createFile(jsPath, contentJs);
    createFile(`${configObj.tarDir}/client.js`, fs.readFileSync(_path.resolve(__dirname, './snipeets/client.js'), 'utf-8'));
    if (configObj.mock === 'true') {
      createFile(`${configObj.tarDir}/handsomeChar.js`, fs.readFileSync(_path.resolve(__dirname, './snipeets/handsomeChar.js'), 'utf-8'));
      createFile(`${configObj.tarDir}/mock.js`, fs.readFileSync(_path.resolve(__dirname, './snipeets/mock.js'), 'utf-8'));
    }
  }
  console.log('***************api文件生成成功了(^_^)*****************');
  console.log(`[接口数量]: ${count}`);
}

request(config)
  .then(handleSwaggerApis)
  .catch((err) => {
    console.log('***************出错啦(-_-!)请重试或砸电脑*****************');
    console.log(err);
  });
