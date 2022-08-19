import handsomeChar from './handsomeChar.js';

function getRandomString() {
  return handsomeChar(`${Math.random() * 100}`);
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
  for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
    arr.push({
      id: i,
      ...getRandomObj()
    });
  }
  return arr;
}

export const mockRequest = function (
  paramConfig,
  customConfig,
  mockData
){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.001) {
        reject("网络错误");
      }
      if (Math.random() >= 0.001 && Math.random() < 0.002) {
        resolve({
          code: 500,
          data: null,
          msg: "服务器错误",
        });
      }
      resolve({
        code: 200,
        data: mockData,
        msg: "success",
      });
    }, Math.random() * 1000);
  });
};

export const mockArray = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomArr());
};

export const mockTablePageData = function (paramConfig, customConfig) {
  const arr = getRandomArr();
  return mockRequest(paramConfig, customConfig, { page: { total: arr.length, current: 1 }, data: arr });
}

export const mockObject = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomObj);
}

export const mockString = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, getRandomString());
}

export const mockNumber = function (paramConfig, customConfig) {
  return mockRequest(paramConfig, customConfig, Math.floor(Math.random()));
}
