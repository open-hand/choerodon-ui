import { CSSProperties } from 'react';
import { Area } from '../image-crop';

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
  showPreviewIcon?: boolean;
}

export interface UploadLocale {
  uploading?: string;
  removeFile?: string;
  uploadError?: string;
  previewFile?: string;
}

export interface UploadProps {
  type?: 'drag' | 'select';
  name?: string;
  defaultFileList?: Array<UploadFile>;
  fileList?: Array<UploadFile>;
  action?: string;
  data?: Record<string, any> | ((file: UploadFile) => any);
  headers?: HttpRequestHeader;
  showUploadList?: boolean | ShowUploadListInterface;
  multiple?: boolean;
  dragUploadList?: boolean;
  accept?: string;
  beforeUpload?: (file: UploadFile, FileList: UploadFile[]) => boolean | PromiseLike<any | Blob>;
  onChange?: (info: UploadChangeParam) => void;
  listType?: 'text' | 'picture' | 'picture-card';
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
  requestFileKeys?: string[]|string;
}

export interface UploadState {
  fileList: UploadFile[];
  dragState: string;
}

type PreviewFileHandler = (file: File | Blob) => PromiseLike<string>;
export interface UploadListProps {
  listType?: 'text' | 'picture' | 'picture-card';
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void | boolean;
  onDragEnd: (files: UploadFile[]) => void | boolean;
  items?: Array<UploadFile>;
  progressAttr?: Record<string, any>;
  prefixCls?: string;
  showRemoveIcon?: boolean;
  dragUploadList?: boolean;
  showPreviewIcon?: boolean;
  locale: UploadLocale;
  previewFile?: PreviewFileHandler;
}
