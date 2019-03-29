import omit from 'lodash/omit';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import Button from '../button/Button';
import { ButtonColor } from '../button/enum';
import autobind from '../_util/autobind';
import { FormField, FormFieldProps } from '../field/FormField';
import Icon from '../icon';
import message from '../message';
import Modal from '../modal';
import { UploadFile } from './interface';
import UploadList from './UploadList';
import { Tooltip } from '..';
import { $l } from '../locale-context';

export interface UploadProps extends FormFieldProps {
  /**
   *  可接受的上传文件类型
   */
  accept?: string[];
  /**
   * 上传文件路径
   */
  action: string;
  /**
   * 上传所需参数或者返回上传参数的方法
   */
  data?: object | Function;
  /**
   * 设置上传的请求头部
   */
  headers?: any;
  /**
   * 是否支持多选文件
   */
  multiple?: boolean;
  /**
   * 是否在选择文件后立即上传
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  uploadImmediately?: boolean;
  /**
   * 组件右上角的帮助信息
   *
   * @type {ReactNode}
   * @memberof UploadProps
   */
  extra?: ReactNode;
  /**
   * input元素内已选择文件变化的回调
   *
   * @memberof UploadProps
   */
  onFileChange?: (fileList: UploadFile[]) => void;
  /**
   * 上传进度变化的回调
   *
   * @memberof UploadProps
   */
  onUploadProgress?: (percent: number, file: UploadFile) => void;
  /**
   * 上传成功的回调
   *
   * @memberof UploadProps
   */
  onUploadSuccess?: (response: any, file: UploadFile) => void;
  /**
   * 上传出错的回调
   *
   * @memberof UploadProps
   */
  onUploadError?: (error: Error, response: any, file: UploadFile) => void;
  /**
   * 文件上传队列的最大长度，0表示不限制
   *
   * @type {number}
   * @memberof UploadProps
   */
  fileListMaxLength?: number;
  /**
   * 控制图片预览的配置对象
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  showPreviewImage?: boolean;
  /**
   * 预览图片的宽度
   *
   * @type {number}
   * @memberof UploadProps
   */
  previewImageWidth?: number;
  /**
   * 是否显示上传按钮
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  showUploadBtn?: boolean;
}

@observer
export default class Upload extends FormField<UploadProps> {

  static displayName = 'Upload';

  static propTypes = {
    /**
     * 可接受的上传文件类型
     * 可选值: MIME类型字符串组成的数组
     */
    accept: PropTypes.arrayOf(PropTypes.string),
    /**
     * 上传文件路径
     */
    action: PropTypes.string,
    /**
     * 上传所需参数或者返回上传参数的方法
     * @default
     * {}
     */
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * 设置上传的请求头部
     * @default
     * {}
     */
    headers: PropTypes.object,
    /**
     * 是否支持多选文件
     * @default
     * false
     */
    multiple: PropTypes.bool,
    uploadImmediately: PropTypes.bool,
    fileListMaxLength: PropTypes.number,
    showPreviewImage: PropTypes.bool,
    previewImageWidth: PropTypes.number,
    extra: PropTypes.any,
    onFileChange: PropTypes.func,
    onUploadProgress: PropTypes.func,
    onUploadSuccess: PropTypes.func,
    onUploadError: PropTypes.func,
    showUploadBtn: PropTypes.bool,
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'pro-upload',
    multiple: false,
    headers: {},
    data: {},
    action: '',
    name: 'file',
    uploadImmediately: true,
    fileListMaxLength: 0,
    showPreviewImage: true,
    previewImageWidth: 100,
    showUploadBtn: true,
    onUploadSuccess: () => message.success($l('Upload', 'upload_success')),
    onUploadError: () => message.error($l('Upload', 'upload_failure')),
  };

  /**
   * 保存上传的文件对象
   *
   * 若直接传递，浏览器会认为它是Mobx对象，因此有时需要手动复制并传值调用
   *
   * @type {UploadFile[]}
   * @memberof Upload
   */
  @observable fileList: UploadFile[];

  /**
   * 原生<input>元素的引用
   *
   * @private
   * @type {HTMLInputElement}
   * @memberof Upload
   */
  private nativeInputElement: HTMLInputElement;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.fileList = [];
    });
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'accept',
      'action',
      'data',
      'header',
      'multiple',
      'onChange',
      'ref',
      'uploadImmediately',
      'fileListMaxLength',
      'showPreviewImage',
      'previewImageWidth',
      'showUploadBtn',
      'onUploadSuccess',
      'onUploadError',
      'onFileChange',
    ]);
    return otherProps;
  }

  saveNativeInputElement = (elem) => this.nativeInputElement = elem;

  /**
   * 传递包装按钮的点击事件
   *
   */
  handleWrapperBtnClick = () => {
    this.nativeInputElement.click();
  };

  render() {
    const {
      prefixCls,
      props: {
        action: formAction,
        children,
        multiple,
        accept,
        name = 'file', // <-- convince ts
        uploadImmediately,
        showPreviewImage,
        previewImageWidth,
        showUploadBtn,
        extra,
      },
    } = this;

    const uploadProps = {
      multiple: multiple,
      accept: accept ? accept.join(',') : undefined,
      action: formAction,
      name: name,
      type: 'file',
      ref: this.saveNativeInputElement,
      onChange: this.handleChange,
      ...this.getOtherProps(),
    };

    const inputWrapperBtn = (
      <Button onClick={this.handleWrapperBtnClick}>
        <input {...uploadProps} hidden />
        <Icon type="insert_drive_file" />
        <span>{children || $l('Upload', 'file_selection')}</span>
      </Button>
    );

    const uploadBtn = (
      <Tooltip
        title={$l('Upload', 'click_to_upload')}
        placement="right"
      >
        <Button color={ButtonColor.blue} onClick={this.handleUploadBtnClick}>
          <Icon type="file_upload" />
        </Button>
      </Tooltip>
    );

    return (
      <div className={`${prefixCls}`}>
        <div className="flex-wrapper">
          <div className={`${prefixCls}-select`}>
            {inputWrapperBtn}
            {!uploadImmediately && showUploadBtn ? uploadBtn : null}
          </div>
          <div>
            {extra}
          </div>
        </div>

        <UploadList
          previewImageWidth={previewImageWidth as number}
          showPreviewImage={showPreviewImage as boolean}
          items={[...this.fileList]}
          remove={this.handleRemove}
        />
      </div>
    );
  }

  handleUploadBtnClick = () => {
    this.startUpload();
  };

  startUpload = () => {
    const fileList = [...this.fileList];
    if (fileList.length) { // <-- 当有文件时才上传
      this.uploadFiles(fileList);
      this.nativeInputElement.value = '';
    } else {
      Modal.error($l('Upload', 'no_file'));
    }
  };

  /**
   * 处理<input type="file">元素的change事件，
   * 主要是取出事件对象中的files对象并传递给uploadFiles方法
   *
   * @param {*} e <input>元素的change事件对象
   * @memberof Upload
   */
  @autobind
  @action
  handleChange(e: any) {
    const fileList = e.target.files;
    const files = Array.from(fileList).slice(0);
    this.fileList = [];
    const fileBuffer: UploadFile[] = [];
    files.forEach((file: UploadFile, index: number) => {
      file.uid = this.getUid(index);
      file.url = URL.createObjectURL(file);
      fileBuffer.push(file);
    });
    this.fileList = fileBuffer;
    e.target.value = '';

    const { uploadImmediately, onFileChange } = this.props;
    if (uploadImmediately) {
      this.uploadFiles(this.fileList);
    }
    if (onFileChange) {
      onFileChange(this.fileList.slice());
    }
  }

  /**
   * 分别上传fileList中的每个文件对象
   *
   * @param {UploadFile[]} fileList 文件对象数组
   * @returns {void}
   * @memberof Upload
   */
  @autobind
  uploadFiles(fileList: UploadFile[]): void {
    const {
      action: formAction,
      accept,
      fileListMaxLength = 0, // <-- convince ts
    } = this.props;
    if (!formAction) {
      Modal.error($l('Upload', 'upload_path_unset'));
      return;
    }
    if (!this.isAcceptFiles(fileList)) {
      Modal.error($l('Upload', 'not_acceptable_prompt') + accept!.join(','));
      return;
    }
    if (fileListMaxLength !== 0 && this.fileList.length > fileListMaxLength) {
      Modal.error(`${$l('Upload', 'file_list_max_length')}: ${fileListMaxLength}`);
      return;
    }
    const files = Array.from(fileList).slice(0);
    const that = this;
    files.forEach((file: UploadFile, index: number) => {
      file.uid = this.getUid(index);
      setTimeout(function () {
        // that.handleStart(file);
        that.upload(file);
      }, 0);
    });
  }

  /**
   * 上传每个文件对象
   *
   * @param {*} file
   * @returns {void}
   * @memberof Upload
   */
  @autobind
  upload(file: any): void {
    const {
      data,
      action: formAction,
      headers,
      name: filename,
    } = this.props;
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // 修改文件状态，方便UploadList判断是否展示进度条
    file.status = 'uploading';

    if (xhr.upload) {
      xhr.upload.onprogress = (e) => {
        let percent = 0;
        if (e.total > 0) {
          percent = e.loaded / e.total * 100;
        }
        this.handleProgress(percent, file);
      };
    }
    if (data) {
      let newData = data;
      if (typeof data === 'function') {
        newData = data(file);
      }
      Object.keys(newData).map(function (key) {
        formData.append(key, data[key]);
      });
    }
    // TODO: `filename` default value needs better implementation
    formData.append(filename || 'file', file);
    const errorMsg = `cannot post ${formAction} ${xhr.status}`;
    xhr.open('post', formAction, true);
    xhr.onload = () => {
      // 以二开头的状态码都认为是成功，暂定？
      const isSuccessful = xhr.status.toString().startsWith('2');
      if (isSuccessful) {
        this.handleSuccess(xhr.status, xhr.response, file);
      } else {
        this.handleError(new Error(errorMsg), this.getResponse(xhr), xhr.response, file);
      }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (headers !== undefined) {
      Object.keys(headers).forEach((key) => {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      });
    }
    xhr.send(formData);
    xhr.onerror = () => {
      this.handleError(new Error(errorMsg), this.getResponse(xhr), xhr.response, file);
    };
    xhr.ontimeout = () => {
      const timeoutMsg = `The request post for ${action} timed out`;
      this.handleError(new Error(timeoutMsg), this.getResponse(xhr), xhr.response, file);
    };
  }

  /**
   * 处理上传成功的函数，根据结果设置文件对象的状态，
   * 用于在UploadList中的展示
   *
   * @param {number} status HTTP状态码
   * @param {string} response 响应对象
   * @param {UploadFile} file 文件对象
   * @returns
   */
  @action
  handleSuccess = (status: number, response: any, file: UploadFile) => {
    const fileList = this.fileList.slice();
    const targetItem = this.getFileItem(file, fileList);
    const { onUploadSuccess } = this.props;
    if (!targetItem) {
      return;
    }
    targetItem.status = status === 200 ? 'success' : 'done';
    targetItem.response = response;
    this.fileList = fileList;

    if (onUploadSuccess) {
      onUploadSuccess(response, file);
    }
  };

  /**
   * 处理上传进度变化的函数，更新文件对象中的percent值，
   * 用于在UploadList中展示
   *
   * @param {number} percent 上传百分比
   * @param {UploadFile} file 文件对象
   * @returns
   */
  @action
  handleProgress = (percent: number, file: UploadFile) => {
    const { onUploadProgress } = this.props;
    const fileList = [...this.fileList];
    const targetItem = this.getFileItem(file, fileList);
    if (!targetItem) {
      return;
    }
    targetItem.percent = percent;
    this.fileList = fileList;
    if (onUploadProgress) {
      onUploadProgress(percent, file);
    }
  };

  /**
   * 处理上传出错的函数，用于设置文件对象的status值，
   *
   * @param {Error} error 错误对象
   * @param {string} responseText 处理成字符串的响应对象
   * @param {UploadFile} file 文件对象
   * @returns
   */
  @action
  handleError = (error: Error, responseText: string, response: any, file: UploadFile) => {
    const { onUploadError } = this.props;
    const fileList = this.fileList.slice();
    const targetItem = this.getFileItem(file, fileList);
    if (!targetItem) {
      return;
    }
    if (onUploadError) {
      onUploadError(error, response, file);
    }
    targetItem.status = 'error';
    targetItem.error = error;
    targetItem.response = responseText;
    this.fileList = fileList;
  };

  handleRemove = (file: UploadFile) => {
    runInAction(() => {
      this.fileList = this.removeFileItem(file, this.fileList);
    });
  };

  /**
   * 判断文件后缀名是否合格
   * this.props.accept值为falsy时返回true，否则正常判断
   *
   * @param {UploadFile[]} fileList 文件对象数组
   * @returns {boolean}
   * @memberof Upload
   */
  isAcceptFiles(fileList: UploadFile[]): boolean {
    const { accept } = this.props;
    if (!accept) {
      return true;
    }
    const acceptTypes = accept.map((type) => {
      type = type.replace(/\./g, '\\.');
      type = type.replace(/\*/g, '.*');
      return new RegExp(type);
    });
    for (const file of fileList) {
      for (const type of acceptTypes) {
        if (type.test(file.name) || type.test(file.type)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 把XMLHttpRequest对象的返回信息转化为字符串
   *
   * @param {XMLHttpRequest} xhr
   * @returns {string}
   * @memberof Upload
   */
  getResponse(xhr: XMLHttpRequest): string {
    const res = xhr.responseText || xhr.response;
    if (!res) {
      return res;
    }

    try {
      return JSON.parse(res).message;
    } catch (e) {
      return '';
    }
  }

  /**
   * 使用日期获取一个uid
   *
   * @param {number} index 索引
   * @returns {string}
   * @memberof Upload
   */
  getUid(index: number): string {
    const { prefixCls } = this;
    const now = new Date();
    return `${prefixCls}-${now}-${index}`;
  }

  /**
   * 从文件对象数组中获取一个文件对象的引用，
   * 首先尝试通过uid属性匹配文件对象，若失败则尝试name
   *
   * @param {UploadFile} file
   * @param {UploadFile[]} fileList 文件对象数组
   * @returns {UploadFile}
   * @memberof Upload
   */
  getFileItem(file: UploadFile, fileList: UploadFile[]): UploadFile {
    const matchKey = file.uid !== undefined ? 'uid' : 'name';
    return fileList.filter(item => item[matchKey] === file[matchKey])[0];
  }

  /**
   * 从文件对象数组中移除一个文件对象，
   * 首先尝试通过uid属性匹配文件对象，若失败则尝试name
   *
   * @param {UploadFile} file
   * @param {UploadFile[]} fileList
   * @returns {UploadFile[]}
   * @memberof Upload
   */
  removeFileItem(file: UploadFile, fileList: UploadFile[]): UploadFile[] {
    const matchKey = file.uid !== undefined ? 'uid' : 'name';
    const removed = fileList.filter(item => item[matchKey] !== file[matchKey]);
    if (removed.length === fileList.length) {
      return [];
    }
    return removed;
  }
}
