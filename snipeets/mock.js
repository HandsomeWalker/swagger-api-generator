import handsomeChar from "./handsomeChar.js";

function getRandomString() {
  return handsomeChar(`${Math.floor(Math.random() * 100)}`);
}

function getRandomObj() {
  return {
    m1: getRandomString(),
    m2: getRandomString(),
    m3: getRandomString(),
    m4: getRandomString(),
    m5: getRandomString(),
    m6: getRandomString(),
    m7: getRandomString(),
    m8: getRandomString(),
    m9: getRandomString(),
    m10: getRandomString(),
  };
}

function getRandomArr() {
  let arr = [];
  for (let i = 0; i < Math.floor(Math.random() * 1000); i++) {
    arr.push({
      id: i,
      index: i + 1,
      ...getRandomObj(),
    });
  }
  return arr;
}

const customMockRequest = function (mockRes, mockErrorRes, paramConfig) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("%cmock参数:", "color:blue", paramConfig);
      if (Math.random() < 0.001) {
        console.log("%cmock请求失败", "color:red");
        reject("网络错误");
      }
      if (Math.random() >= 0.001 && Math.random() < 0.002) {
        console.log("%cmock请求失败:", "color:red", mockErrorRes);
        resolve(mockErrorRes);
      }
      console.log("%cmock请求结果:", "color:green", mockRes);
      resolve(mockRes);
    }, Math.random() * 1000);
  });
};

export const mockRequest = function (paramConfig, mockData, customConfig) {
  if (customConfig?.getResponse) {
    return customMockRequest(
      { code: 200, data: mockData, msg: "success" },
      { code: 500, data: null, msg: "服务器错误" },
      paramConfig
    );
  } else {
    return customMockRequest(mockData, null, paramConfig);
  }
};

export const mockArray = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, getRandomArr(), customConfig);
};

export const mockTablePageData = function (paramConfig, customConfig) {
  const arr = getRandomArr();
  return mockRequest(
    paramConfig,
    {
      page: { total: arr.length, current: 1 },
      data: arr,
    },
    customConfig
  );
};

export const mockObject = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, getRandomObj(), customConfig);
};

export const mockString = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, getRandomString(), customConfig);
};

export const mockNumber = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, Math.floor(Math.random()), customConfig);
};
