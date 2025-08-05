import axios, { AxiosRequestConfig } from "axios";

let baseURL;
switch (process.env.APP_ENV) {
  case "prod":
    baseURL = "/api";
    break;
  case "dev":
    baseURL = "/api";
    break;
  case "test":
    baseURL = "/api";
    break;
  default:
    baseURL = "/api";
    break;
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    let authorization = sessionStorage.getItem("authorization");
    if (authorization) {
      if (config.headers) {
        if (config.headers.authorization) {
          return config;
        }
      }
      config.headers.authorization = authorization;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  function (response) {
    let { data } = response;
    // 对响应数据做点什么
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      return response;
    }
    return data;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

function request<ResponseType>(requestConfig: RequestConfig) {
  return axiosInstance.request<ResponseType>(requestConfig);
}

export default request;

export interface RequestConfig extends AxiosRequestConfig {}
export type ParamsProps<T extends { parameters: any }> = T["parameters"]; // 修改这里自定义入参
export type ResponseProps<T extends { responses: any }> = T["responses"]["200"]["schema"]; // 修改这里自定义响应
export type CustomConfigProps = RequestConfig; // 修改这里为自定义配置支持TS提示
