import React, { ReactNode } from 'react';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import isPromise from 'is-promise';
import { T } from 'choerodon-ui/lib/upload/utils';
import Button from '../button/Button';
import { ButtonColor } from '../button/enum';
import autobind from '../_util/autobind';
import { FormField, FormFieldProps } from '../field/FormField';
import Icon from '../icon';
import message from '../message';
import Modal from '../modal';
import { UploadFile } from './interface';
import UploadList from './UploadList';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';
import isIE from '../_util/isIE';

/**
 * 把XMLHttpRequest对象的返回信息转化为字符串
 *
 * @param {XMLHttpRequest} xhr
 * @returns {string}
 * @memberof Upload
 */
function getResponse(xhr: XMLHttpRequest): string {
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
   * 上传之前的回调
   *
   * @memberof UploadProps
   */
  beforeUpload?: (file: UploadFile, FileList: UploadFile[]) => boolean | PromiseLike<void>;
  /**
   * 删除后的回调
   *
   * @memberof UploadProps
   */
  onRemoveFile?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
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
   * 自定义预览图片
   *
   * @type {function}
   * @memberof UploadProps
   */
  previewImageRenderer?: (file: UploadFile) => ReactNode;
  /**
   * 是否显示上传按钮
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  showUploadBtn?: boolean;
  /**
   * 是否显示上传列表
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  showUploadList?: boolean;
  /**
   * 默认显示的上传列表
   *
   * @type {array}
   * @memberof UploadProps
   */
  defaultFileList?: Array<UploadFile>;
  /**
   * 已经上传的列表
   *
   * @type {array}
   * @memberof UploadProps
   */
  uploadFileList?: Array<UploadFile>;
  /**
   * 上传请求时是否携带 cookie
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  withCredentials?: boolean;
  /**
   * 是否以追加形式添加文件至列表中
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  appendUpload?: boolean;
  /**
   * 是否每次上传全部文件
   *
   * @type {boolean}
   * @memberof UploadProps
   */
  partialUpload?: boolean;
}

@observer
export default class Upload extends FormField<UploadProps> {
  static displayName = 'Upload';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload',
    multiple: false,
    headers: {},
    data: {},
    action: '',
    name: 'file',
    withCredentials: false,
    appendUpload: false,
    partialUpload: true,
    uploadImmediately: true,
    fileListMaxLength: 0,
    showPreviewImage: true,
    previewImageWidth: 100,
    showUploadBtn: true,
    showUploadList: true,
    beforeUpload: T,
    onUploadSuccess: () => {
      message.success($l('Upload', 'upload_success'));
    },
    onUploadError: () => {
      message.error($l('Upload', 'upload_failure'));
    },
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
      this.fileList = props.uploadFileList || props.defaultFileList || [];
    });
  }

  @action
  componentWillReceiveProps(nextProps) {
    const { uploadFileList } = nextProps;
    if (uploadFileList !== this.fileList && uploadFileList !== undefined) {
      this.fileList = uniqBy(uploadFileList, (item: UploadFile) => item.uid);
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'accept',
      'action',
      'data',
      'header',
      'multiple',
      'uploadImmediately',
      'fileListMaxLength',
      'showPreviewImage',
      'previewImageWidth',
      'previewImageRenderer',
      'showUploadBtn',
      'showUploadList',
      'onRemoveFile',
      'onUploadSuccess',
      'onUploadError',
      'onFileChange',
      'beforeUpload',
      'withCredentials',
      'partialUpload',
      'appendUpload',
      'uploadFileList',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.ref;
    delete otherProps.onChange;
    return otherProps;
  }

  saveNativeInputElement = elem => (this.nativeInputElement = elem);

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
        previewImageRenderer,
        showUploadBtn,
        showUploadList,
        extra,
        disabled,
      },
    } = this;

    const uploadProps = {
      multiple,
      accept: accept ? accept.join(',') : undefined,
      action: formAction,
      name,
      type: 'file',
      ref: this.saveNativeInputElement,
      onChange: this.handleChange,
      ...this.getOtherProps(),
    };

    const inputWrapperBtn = [
      <Button key="upload-btn" onClick={this.handleWrapperBtnClick} disabled={disabled}>
        <Icon type="insert_drive_file" />
        <span>{children || $l('Upload', 'file_selection')}</span>
      </Button>,
      <input key="upload" {...uploadProps} hidden />,
    ];

    const uploadBtn = (
      <Tooltip title={$l('Upload', 'click_to_upload')} placement="right">
        <Button color={ButtonColor.primary} onClick={this.handleUploadBtnClick} disabled={disabled}>
          <Icon type="file_upload" />
        </Button>
      </Tooltip>
    );

    /**
     * to solve the ie11 dispaly inline-block with the button cause unaligned
     */
    const IeStyle = isIE() ? { display: '-ms-inline-flexbox' } : {};

    return (
      <div className={`${prefixCls}`} style={IeStyle}>
        <div className="flex-wrapper">
          <div className={`${prefixCls}-select`}>
            {inputWrapperBtn}
            {!uploadImmediately && showUploadBtn ? uploadBtn : null}
          </div>
          <div>{extra}</div>
        </div>
        {showUploadList ? (
          <UploadList
            previewImageWidth={previewImageWidth as number}
            showPreviewImage={showPreviewImage as boolean}
            previewImageRenderer={previewImageRenderer}
            items={[...this.fileList]}
            remove={this.handleRemove}
          />
        ) : null}
      </div>
    );
  }

  handleUploadBtnClick = () => {
    this.startUpload();
  };

  /**
   * 文件上传前的回调
   *
   * @param {UploadFile}
   * @param {UploadFile[]}
   * @memberof Upload
   */
  beforeUpload = (file: UploadFile, fileList: UploadFile[]) => {
    const { beforeUpload } = this.props;
    if (!beforeUpload) {
      return true;
    }
    const result = beforeUpload(file, fileList);
    if (result === false) {
      this.removeFileItem(file);
      return false;
    }
    if (isPromise(result)) {
      return result;
    }
    return true;
  };

  startUpload = () => {
    const fileList = [...this.fileList];
    if (fileList.length) {
      // <-- 当有文件时才上传
      this.uploadFiles(fileList);
      // this.nativeInputElement.value = '';
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
    if (e.target.value === '') {
      return;
    }
    const { appendUpload, defaultFileList, uploadFileList } = this.props;
    const fileList = e.target.files;
    const files: any = Array.from(fileList).slice(0);
    const tempFileList =
      appendUpload || defaultFileList || uploadFileList ? this.fileList.slice() : [];
    const fileBuffer: UploadFile[] = [];
    files.forEach((file: UploadFile, index: number) => {
      file.uid = this.getUid(index);
      file.url = URL.createObjectURL(file);
      const res = this.beforeUpload(file, files);
      if (!res) {
        return;
      }
      fileBuffer.push(file);
    });
    this.fileList = [...tempFileList, ...fileBuffer];
    const { uploadImmediately, onFileChange } = this.props;
    e.target.value = '';
    if (uploadImmediately) {
      if (!isEmpty(fileBuffer)) {
        this.uploadFiles(this.fileList);
      }
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
  @action
  uploadFiles(fileList: UploadFile[]): void {
    const {
      action: formAction,
      accept,
      fileListMaxLength = 0, // <-- convince ts
      partialUpload,
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
    const files = partialUpload
      ? fileList
        .filter(item => !item.status || item.status !== 'success')
      : Array.from(fileList);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    if (!files.length) {
      message.info($l('Upload', 'been_uploaded'));
    }
    files.forEach((file: UploadFile, index: number) => {
      file.uid = this.getUid(index);
      setTimeout(() => {
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

  /* istanbul ignore next */
  @autobind
  @action
  upload(file: any): void {
    const {
      data,
      action: formAction,
      headers,
      name: filename,
      withCredentials: xhrWithCredentials,
    } = this.props;
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // 修改文件状态，方便UploadList判断是否展示进度条
    file.status = 'uploading';
    if (xhr.upload) {
      xhr.upload.onprogress = (e): void => {
        let percent = 0;
        if (e.total > 0) {
          percent = (e.loaded / e.total) * 100;
        }
        this.handleProgress(percent, file);
      };
    }
    if (data) {
      const newData = typeof data === 'function' ? data(file) : data;
      Object.keys(newData).forEach(key => formData.append(key, newData[key]));
    }
    // TODO: `filename` default value needs better implementation
    formData.append(filename || 'file', file);
    const errorMsg = `cannot post ${formAction} ${xhr.status}`;
    if (xhrWithCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }
    xhr.open('post', formAction, true);
    xhr.onload = () => {
      // 以二开头的状态码都认为是成功，暂定？
      const isSuccessful = xhr.status.toString().startsWith('2');
      if (isSuccessful) {
        this.handleSuccess(xhr.status, xhr.response, file);
      } else {
        this.handleError(new Error(errorMsg), getResponse(xhr), xhr.response, file);
      }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (headers !== undefined) {
      Object.keys(headers).forEach(key => {
        if ({}.hasOwnProperty.call(headers, key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      });
    }
    xhr.send(formData);
    xhr.onerror = () => {
      this.handleError(new Error(errorMsg), getResponse(xhr), xhr.response, file);
    };
    xhr.ontimeout = () => {
      const timeoutMsg = `The request post for ${action} timed out`;
      this.handleError(new Error(timeoutMsg), getResponse(xhr), xhr.response, file);
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
  handleSuccess(status: number, response: any, file: UploadFile) {
    const targetItem = this.getFileItem(file);
    if (targetItem) {
      const { onUploadSuccess } = this.props;
      targetItem.status = status === 200 ? 'success' : 'done';
      targetItem.response = response;
      if (onUploadSuccess) {
        onUploadSuccess(response, file);
      }
      this.forceUpdate();
    }
  }

  /**
   * 处理上传进度变化的函数，更新文件对象中的percent值，
   * 用于在UploadList中展示
   *
   * @param {number} percent 上传百分比
   * @param {UploadFile} file 文件对象
   * @returns
   */
  @action
  handleProgress(percent: number, file: UploadFile) {
    const { onUploadProgress } = this.props;
    const targetItem = this.getFileItem(file);
    if (targetItem) {
      targetItem.percent = percent;
      if (onUploadProgress) {
        onUploadProgress(percent, file);
      }
      this.forceUpdate();
    }
  }

  /**
   * 处理上传出错的函数，用于设置文件对象的status值，
   *
   * @param {Error} error 错误对象
   * @param {string} responseText 处理成字符串的响应对象
   * @param {UploadFile} file 文件对象
   * @returns
   */
  @action
  handleError(error: Error, responseText: string, response: any, file: UploadFile) {
    const { onUploadError } = this.props;
    const targetItem = this.getFileItem(file);
    if (targetItem) {
      targetItem.status = 'error';
      targetItem.error = error;
      targetItem.response = responseText;
      if (onUploadError) {
        onUploadError(error, response, file);
      }
      this.forceUpdate();
    }
  }

  @action
  handleRemove = (file: UploadFile) => {
    // this.removeFileItem(file);
    // this.upload.abort(file);
    file.status = 'removed';
    this.handleOnRemove(file);
  };

  handleOnRemove(file: UploadFile) {
    const { onRemoveFile } = this.props;
    Promise.resolve(typeof onRemoveFile === 'function' ? onRemoveFile(file) : onRemoveFile).then(
      ret => {
        if (ret === false) {
          return;
        }
        this.removeFileItem(file);
      },
    );
  }

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
    const acceptTypes = accept.map(type => {
      type = type.replace(/\./g, '\\.');
      type = type.replace(/\*/g, '.*');
      return new RegExp(type);
    });
    return fileList.some(({ name, type }) =>
      acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type)),
    );
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
  getFileItem(file: UploadFile): UploadFile | undefined {
    const matchKey = file.uid !== undefined ? 'uid' : 'name';
    return this.fileList.find(item => item[matchKey] === file[matchKey]);
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
  @action
  removeFileItem(file: UploadFile): void {
    const matchKey = file.uid !== undefined ? 'uid' : 'name';
    const index = this.fileList.findIndex(item => item[matchKey] === file[matchKey]);
    const { uploadFileList } = this.props;
    if (uploadFileList && uploadFileList.length) {
      uploadFileList.splice(index, 1);
      this.fileList.splice(index, 1);
    } else {
      this.fileList.splice(index, 1);
    }
  }
}
