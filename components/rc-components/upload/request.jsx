import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isObject  from 'lodash/isObject';
import toString  from 'lodash/toString';
import isNil  from 'lodash/isNil';

function getError(option, xhr) {
  const msg = `cannot post ${option.action} ${xhr.status}'`;
  const err = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = option.action;
  return err;
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// option {
//  onProgress: (event: { percent: number }): void,
//  onError: (event: Error, body?: Object): void,
//  onSuccess: (body: Object): void,
//  data: Object,
//  filename: String,
//  file: File,
//  withCredentials: Boolean,
//  action: String,
//  headers: Object,
// }


function requestFileFormData(requestFileKeys,option) {

  const formData = new FormData();
  /** 
   * 添加注入的data数据
   */
  if (option.data) {
    Object.keys(option.data).map(key => {
      formData.append(key, option.data[key]);
    });
  }
  /**
   * 添加文件数据
   */
  formData.append(option.filename, option.file);

  const toStringValue = (value) => {
    if(isNil(value)){
      return '';
    }
    if(isString(value)){
      return value
    }
    if(isObject(value)) {
      return JSON.stringify(value)
    }
    return toString(value)
  }
  
  /**
   * 
   * @param {所有数据} obj 
   * @param {需要传出的参数keys} arrayString 
   */
  const ArrayToObject = (obj,arrayString) => {
    arrayString.forEach(item => {
      formData.append(toStringValue(item), toStringValue(obj[toStringValue(item)]));
    })
  }
  
  /**
   * 判断是否需要增加key
   */
  if(isString(requestFileKeys) || isArray(requestFileKeys)){
    let requestFileKeysFile = ['uid','type','name','lastModifiedDate'];
    if(isString(requestFileKeys)){
      requestFileKeysFile.push(requestFileKeys);
    }else{
      requestFileKeysFile = [...requestFileKeysFile,...requestFileKeys]
    }
    ArrayToObject(option.file,requestFileKeysFile)
  }
  return formData
}
export default function upload(option) {
  const xhr = new XMLHttpRequest();

  if (option.onProgress && xhr.upload) {
    xhr.upload.onprogress = function progress(e) {
      if (e.total > 0) {
        e.percent = e.loaded / e.total * 100;
      }
      option.onProgress(e);
    };
  }


  const formData =  requestFileFormData(option.requestFileKeys,option)


  xhr.onerror = function error(e) {
    option.onError(e);
  };

  xhr.onload = function onload() {
    // allow success when 2xx status
    // see https://github.com/react-component/upload/issues/34
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(option, xhr), getBody(xhr));
    }

    option.onSuccess(getBody(xhr), xhr);
  };


  xhr.open('post', option.action, true);

  // Has to be after `.open()`. See https://github.com/enyo/dropzone/issues/179
  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }

  const headers = option.headers || {};

  // when set headers['X-Requested-With'] = null , can close default XHR header
  // see https://github.com/react-component/upload/issues/33
  if (headers['X-Requested-With'] !== null) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }

  for (const h in headers) {
    if (headers.hasOwnProperty(h) && headers[h] !== null) {
      xhr.setRequestHeader(h, headers[h]);
    }
  }
  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    },
  };
}
