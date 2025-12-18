import { action as mobxAction, observable, runInAction } from 'mobx';
import { AxiosError, CancelTokenSource } from 'axios';
import isNil from 'lodash/isNil';
import AttachmentFileChunk from './AttachmentFileChunk';
import PromiseQueue from '../promise-queue';

const extReg = /(.*)\.([^.]*)$/;

export interface FileLike {
  name?: string;
  size?: number;
  type?: string;
  lastModified?: number;
  uid?: string;
  url?: string;
  originFileObj?: File;
  creationDate?: Date;
  attachmentUUID?: string;

  [key: string]: any;
}

export default class AttachmentFile implements FileLike {

  @observable name: string;

  @observable size: number;

  type: string;

  lastModified?: number;

  uid: string;

  @observable url?: string | undefined;

  @observable filename: string;

  @observable ext: string;

  originFileObj?: File | undefined;

  @observable status?: 'error' | 'success' | 'uploading' | 'deleting' | 'done' | 'aborted';

  @observable aborted?: boolean;

  @observable private $percent?: number | undefined;

  uploadQueue?: PromiseQueue;

  cancelToken?: CancelTokenSource;

  md5?: string;

  get percent(): number | undefined {
    const { chunks } = this;
    if (chunks) {
      const { length } = chunks;
      return chunks.reduce((sum, chunk) => {
        const { status, percent = status === 'success' ? 100 : 0 } = chunk;
        return sum + percent / length;
      }, 0);
    }
    return this.$percent;
  }

  set percent(percent: number | undefined) {
    runInAction(() => {
      this.$percent = percent;
    });
  }

  @observable error?: AxiosError | undefined;

  @observable errorMessage?: string | undefined;

  @observable invalid?: boolean;

  creationDate: Date;

  attachmentUUID?: string | undefined;

  chunks?: AttachmentFileChunk[];

  constructor(file: FileLike) {
    runInAction(() => {
      this.name = '';
      this.filename = '';
      this.size = 0;
      this.type = '';
      this.uid = '';
      this.creationDate = new Date();
      this.load(file);
    });
  }

  @mobxAction
  private load(file: FileLike) {
    const { name } = file;
    if (name) {
      const matches = name.match(extReg);
      if (matches && matches.length > 2) {
        this.ext = matches[2] ? matches[2].toLowerCase() : '';
        this.filename = matches[1];
      } else {
        this.ext = '';
        this.filename = name;
      }
    }
    Object.keys(file).forEach(key => {
      const value = file[key];
      if (!isNil(value)) {
        switch (key) {
          case 'uid':
            this.uid = String(value);
            break;
          default:
            this[key] = value;
        }
      }
    });
  }
}
