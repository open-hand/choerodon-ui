import { action, observable } from 'mobx';
import { AxiosError } from 'axios';

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

  @observable status?: 'error' | 'success' | 'uploading' | 'done';

  @observable percent?: number | undefined;

  @observable error?: AxiosError | undefined;

  @observable errorMessage?: string;

  @observable invalid?: boolean;

  creationDate: Date;

  constructor(file: FileLike) {
    this.load(file);
  }

  @action
  private load(file: FileLike) {
    Object.assign<AttachmentFile, FileLike>(this, file);
    this.uid = String(file.uid);
    const { name } = file;
    if (name) {
      const matches = name.match(extReg);
      if (matches && matches.length > 2) {
        this.ext = matches[2];
        this.filename = matches[1];
      } else {
        this.ext = '';
        this.filename = name;
      }
    }
  }
}
