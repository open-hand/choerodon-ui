import axios, { AxiosInstance } from 'axios';

const jsonMimeType = 'application/json';

const instance: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': jsonMimeType,
    Accept: jsonMimeType,
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// http response 拦截器
instance.interceptors.response.use(
  (response) => {
    const { status, data } = response;
    if (status === 204) {
      return response;
    }
    if (data.success === false) {
      throw data;
    } else {
      return data;
    }
  },
);

export default instance;
