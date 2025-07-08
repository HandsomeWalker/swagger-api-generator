# swagger-api-generator
swagger接口前端代码生成命令行工具，支持ts和js，适用于v2文档

# 特性

🛠️ 生成请求方法

📦 完整的接口入参和响应类型

📄 完整的jsdoc注释

🛜 自定义请求客户端

🌲 treeshaking友好

🧩 支持按模块生成文件

# 生成结果
```typescript
import { paths } from "./schema";
import request, { RequestConfig } from "./client";

function objToFormData(obj: any) {
  const formData = new FormData();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

type CustomConfigProps = RequestConfig; // 修改这里为自定义配置支持TS提示

/**
 * pet-uploads an image
 * @param {string | number} petId description: ID of pet to update | required: true | type: integer
 * @param {string | number} additionalMetadata description: Additional data to pass to server | required: false | type: string
 * @param {any} file description: file to upload | required: false | type: file
 */
export const petByPetIdUploadImagePOST = (
  paramConfig: paths["/pet/{petId}/uploadImage"]["post"]["parameters"],
  customConfig: CustomConfigProps = {}
) =>
  request<paths["/pet/{petId}/uploadImage"]["post"]["responses"]["200"]["schema"]>({
    url: `/pet/${paramConfig.path["petId"]}/uploadImage`,
    method: "post",
    data: objToFormData(paramConfig.formData),
    headers: { "Content-Type": "multipart/form-data" },
    ...customConfig,
  });
```

# 安装
```
npm install -D swagger-api-gen
```
# 用法
## 命令行
全局运行
```
api url=http://example.com/v2/api-docs
```
项目内运行
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
api url=http://example.com/v2/api-docs tarDir=./src/api fileName=index fileType=ts template='import request from "./request";' expandParams=true filter=pet client=true mock=true module=true
```
# 参数说明
|参数|必传|说明|默认|示例|
|----|----|----|----|----|
|url|是|swagger api地址|-|url=http://example.com/v2/api-docs|
|tarDir|否|目标目录|`当前目录`|tarDir=./src/api|
|fileName|否|生成文件名，当module选项为true时不生效|`swagger-api`|fileName=index|
|fileType|否|生成文件类型`js`或`ts`|`ts`|fileType=js|
|template|否|顶部自定义的代码段|-|template='import request from "./request";'|
|expandParams|否|是否展开传参|`false`|expandParams=false|
|filter|否|通过正则匹配接口path来筛选需要生成的接口|-|filter=pet|
|client|否|是否生成请求客户端|`false`|client=true|
|mock|否|是否生成mock请求|`false`|mock=true|
|module|否|是否分模块|`false`|module=true|

# 注意
使用 `git for windows` 终端时，参数首位的 `/` 会被解析为 `$GIT_HOME/`

解决方案如下
```
filter=//pet

MSYS_NO_PATHCONV=1 filter=/pet/find

filter=\\/pet/find
```
