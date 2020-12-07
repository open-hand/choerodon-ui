export interface UploadFile {
  uid: string;
  size: number;
  name: string;
  filename?: string;
  lastModified?: string;
  lastModifiedDate?: Date;
  url?: string;
  status?: 'error' | 'success' | 'uploading' | 'done' | 'removed';
  percent?: number;
  thumbUrl?: string;
  originFileObj?: File;
  response?: any;
  error?: any;
  linkProps?: any;
  type: string;
  msClose?: boolean;
}

export {
  UploadProps,
} from './Upload';

export {
  UploadListProps,
} from './UploadList';