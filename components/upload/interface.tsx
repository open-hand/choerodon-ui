import { CSSProperties, ReactElement } from 'react';
import { Area } from '../image-crop';
import { PopconfirmProps } from '../popconfirm';

export type UploadFileStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed';

export interface HttpRequestHeader {
  [key: string]: string;
}

export interface UploadFile {
  uid: number;
  size: number;
  name: string;
  filename?: string;
  lastModified?: string;
  lastModifiedDate?: Date | number;
  url?: string;
  status?: UploadFileStatus;
  percent?: number;
  thumbUrl?: string;
  isNotImage?: boolean;
  originFileObj?: File | Blob;
  response?: any;
  error?: any;
  linkProps?: any;
  type: string;
  imageCropArea?: Area;
}

export interface UploadChangeParam {
  file: UploadFile;
  fileList: Array<UploadFile>;
  event?: { percent: number };
}

export interface ShowUploadListInterface {
  showRemoveIcon?: boolean;
  showPreviewIcon?: boolean | UploadListIconFunc;
  showDownloadIcon?: boolean | UploadListIconFunc;
  showReUploadIcon?: boolean | 'text' | UploadListReUploadIconFunc;
  removePopConfirmTitle?: string;
  reUploadText?: string;
  reUploadPopConfirmTitle?: string;
  getCustomFilenameTitle?: (file: UploadFile) => string;
}

export interface UploadLocale {
  uploading?: string;
  removeFile?: string;
  uploadError?: string;
  previewFile?: string;
  confirmRemove?: string;
  confirmReUpload?: string;
  reUpload?: string;
}

export type UploadType = 'drag' | 'select';
export type UploadListType = 'text' | 'picture' | 'picture-card';
export type ShowReUploadIconType = 'icon' | 'text';

export interface UploadProps {
  type?: UploadType;
  name?: string;
  defaultFileList?: Array<UploadFile>;
  fileList?: Array<UploadFile>;
  action?: string | ((file: UploadFile) => PromiseLike<any>);
  directory?: boolean;
  data?: Record<string, any> | ((file: UploadFile) => any);
  headers?: HttpRequestHeader;
  showUploadList?: boolean | ShowUploadListInterface;
  multiple?: boolean;
  dragUploadList?: boolean;
  accept?: string;
  beforeUpload?: (file: UploadFile, FileList: UploadFile[]) => boolean | PromiseLike<any | Blob>;
  beforeUploadFiles?: (FileList: UploadFile[]) => boolean;
  onChange?: (info: UploadChangeParam) => void;
  listType?: UploadListType;
  className?: string;
  onStart?: (file: UploadFile) => void;
  onPreview?: (file: UploadFile) => void;
  onDragEnd?: (files: UploadFile[]) => void | boolean;
  onRemove?: (file: UploadFile) => void | boolean;
  onSuccess?: (response: any, file: UploadFile) => void;
  onProgress?: (e: { percent: number }, file: UploadFile) => void;
  onError?: (error: Error, response: any, file: UploadFile) => void;
  supportServerRender?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  prefixCls?: string;
  customRequest?: (option: any) => void;
  previewFile?: PreviewFileHandler;
  withCredentials?: boolean;
  locale?: UploadLocale;
  requestFileKeys?: string[] | string;
  showFileSize?: boolean;
  overwriteDefaultEvent?: boolean;
  downloadPropsIntercept?: Function;
  fileInputClick?: (el: Element) => void;
  onReUpload?: (file: UploadFile) => void;
  renderIcon?: (file: UploadFile, listType: UploadListType, prefixCls?: string) => ReactElement;
  tooltipPrefixCls?: string;
  popconfirmProps?: PopconfirmProps;
}

export interface UploadState {
  fileList: UploadFile[];
  dragState: string;
  originReuploadItem: UploadFile | null;
}

export type UploadListIconFunc = (file: UploadFile) => boolean;

export type UploadListReUploadIconFunc = (file: UploadFile, listType: UploadListType) => (boolean | 'text');

type PreviewFileHandler = (file: File | Blob) => PromiseLike<string>;

export interface UploadListProps {
  listType?: UploadListType;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void | boolean;
  onDragEnd: (files: UploadFile[]) => void | boolean;
  items?: Array<UploadFile>;
  progressAttr?: Record<string, any>;
  prefixCls?: string;
  showRemoveIcon?: boolean;
  dragUploadList?: boolean;
  showPreviewIcon?: boolean | UploadListIconFunc;
  showDownloadIcon?: boolean | UploadListIconFunc;
  downloadPropsIntercept?: Function;
  removePopConfirmTitle?: string;
  showReUploadIcon?: boolean | 'text' | UploadListReUploadIconFunc;
  reUploadText?: string;
  reUploadPopConfirmTitle?: string;
  onReUpload?: (file: UploadFile) => void;
  getCustomFilenameTitle?: (file: UploadFile) => string;
  locale: UploadLocale;
  previewFile?: PreviewFileHandler;
  showFileSize?: boolean;
  renderIcon?: (file: UploadFile, listType: UploadListType, prefixCls?: string) => ReactElement;
  tooltipPrefixCls?: string;
  popconfirmProps?: PopconfirmProps;
  getUploadRef: () => any;
  setReplaceReuploadItem: (file: UploadFile) => void;
}
