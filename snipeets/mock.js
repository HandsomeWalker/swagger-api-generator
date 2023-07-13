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

export const customMockRequest = function (mockRes, mockErrorRes, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.001) {
        reject("网络错误");
      }
      if (Math.random() >= 0.001 && Math.random() < 0.002) {
        resolve(mockErrorRes);
      }
      resolve(mockRes);
    }, Math.random() * 1000);
  });
};

export const mockRequest = function (paramConfig, customConfig, mockData) {
  if (customConfig.getResponse) {
    return customMockRequest(mockData, null);
  } else {
    return customMockRequest(
      { code: 200, data: mockData, msg: "success" },
      { code: 500, data: null, msg: "服务器错误" }
    );
  }
};

export const mockArray = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomArr());
};

export const mockTablePageData = function (paramConfig, customConfig) {
  const arr = getRandomArr();
  return mockRequest(paramConfig, customConfig, {
    page: { total: arr.length, current: 1 },
    data: arr,
  });
};

export const mockObject = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomObj());
};

export const mockString = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomString());
};

export const mockNumber = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, Math.floor(Math.random()));
};
