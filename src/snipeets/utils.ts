import { type RequestConfig } from "./client";
/** js对象转formData */
export function objToFormData(obj: Object) {
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

export type ParamsProps<T extends { parameters: any }> = T["parameters"]; // 修改这里自定义入参
export type ResponseProps<T extends { responses: any }> = T["responses"]["200"]["schema"]; // 修改这里自定义响应
export type CustomConfigProps = RequestConfig; // 修改这里为自定义配置支持TS提示
