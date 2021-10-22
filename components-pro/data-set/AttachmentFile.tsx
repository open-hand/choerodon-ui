import { action, observable, runInAction } from 'mobx';
import { AxiosError } from 'axios';
import isNil from 'lodash/isNil';

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

  @observable status?: 'error' | 'success' | 'uploading' | 'deleting' | 'done';

  @observable percent?: number | undefined;

  @observable error?: AxiosError | undefined;

  @observable errorMessage?: string;

  @observable invalid?: boolean;

  creationDate: Date;

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

  @action
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
