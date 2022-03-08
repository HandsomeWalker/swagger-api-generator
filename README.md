# swagger-api-generator
swagger接口前端代码生成命令行工具

# 生成结果
## TS
`index.ts`
```typescript
import './indexTypes';
import funcRequest from './request';
import { RequestOptionsInit } from 'umi-request';
const request = funcRequest({ baseURL: '/mock' });
type CustomConfigProps = RequestOptionsInit; // 修改这里为自定义配置支持TS提示

/**
 * 示例接口
 * @param {string | number} id description: id | required: true | type: string
 * @returns name description: 名称 | type: string
 * @returns count description: 值 | type: integer
 * @returns type description: 类型 | type: string
 */
export const myHandsomeApiGET = (
  paramConfig: myHandsomeApiGETProps,
  customConfig: CustomConfigProps = {},
): Promise<myHandsomeApiGETResProps> =>
  request<myHandsomeApiGETResProps>({
    url: '/my/handsome/api',
    method: 'get',
    params: paramConfig,
    ...customConfig,
  });
```
`indexTypes.ts`
```typescript
interface anyFields {
  [key: string]: any;
}
/**
 * 示例接口
 * @param {string | number} id description: id | required: true | type: string
 */
interface myHandsomeApiGETProps {
    id: string | number;
}
/**
* @param {string} name description: 名称 | type: string
* @param {number} count description: 值 | type: integer
* @param {string} type description: 类型 | type: string
*/
interface myHandsomeApiGETResProps {
    name: string;
    count: number;
    type: string;
}
```
## JS
```javascript
import funcRequest from './request';
const request = funcRequest({ baseURL: '/mock' });

/**
 * 示例接口
 * @param {string | number} id description: id | required: true | type: string
 * @returns name description: 名称 | type: string
 * @returns count description: 值 | type: integer
 * @returns type description: 类型 | type: string
 */
export const myHandsomeApiGET = (
  paramConfig,
  customConfig = {},
) =>
  request({
    url: '/my/handsome/api',
    method: 'get',
    params: paramConfig,
    ...customConfig,
  });
```

# 安装
```
npm install -D swagger-api-gen
```
# 用法
## 命令行
全局安装
```
api url=http://example.com/v2/api-docs
```
本地安装
```
npx api url=http://example.com/v2/api-docs
```
## npm script使用
1.配置package.json
```
{
    "script": {
        "api": "api url=http://example.com/v2/api-docs"
    }
}
```
2.运行 `npm run api` 或 `yarn api`
## 完整示例
```
api url=http://example.com/v2/api-docs tarDir=./src/api fileName=index fileType=ts template='import request from "./request";' expandParams=true filter=pet
```
# 参数说明
|参数|必传|说明|默认|示例|
|----|----|----|----|----|
|url|是|swagger api地址|-|url=http://example.com/v2/api-docs|
|tarDir|否|目标目录|当前目录|tarDir=./src/api|
|fileName|否|生成文件名|swagger-api|fileName=index|
|fileType|否|生成文件类型`js`或`ts`|ts|fileType=js|
|template|否|顶部自定义的代码段|-|template='import request from "./request";'|
|expandParams|否|是否展开传参|false|expandParams=true|
|filter|否|通过正则匹配接口path来筛选需要生成的接口|-|filter=pet|

# 注意
使用 `git for windows` 终端时，参数首位的 `/` 会被解析为 `$GIT_HOME/`

解决方案如下
```
filter=//pet

MSYS_NO_PATHCONV=1 filter=/pet/find

filter=\\/pet/find
```
