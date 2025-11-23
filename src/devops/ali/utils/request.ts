import axios from 'axios';

const request = axios.create({
  baseURL: 'https://openapi-rdc.aliyuncs.com/oapi/v1',
  headers: {
    'Content-Type': 'application/json',
    'x-yunxiao-token': `${process.env.WORkFLOW_TOKEN}`,
  },
});

request.interceptors.response.use(
  (respones) => {
    if (respones.status !== 200) {
      throw new Error(respones.data);
    }
    return respones.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { request };
