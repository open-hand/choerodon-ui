import { action, get, observable, ObservableMap } from 'mobx';
import PromiseMerger from '../promise-merger';
import AttachmentFile from '../data-set/AttachmentFile';
import Field from '../data-set/Field';
import { getGlobalConfig } from './utils';

export type AttachmentCache = { count?: number | undefined, attachments?: AttachmentFile[] | undefined };

type callbackArgs = [Field | undefined, boolean | undefined];

const publicKey = Symbol('PUBLIC_KEY');

export class AttachmentStore {

  cache: ObservableMap<string, AttachmentCache> = observable.map<string, AttachmentCache>();

  batchCallback = (uuids: string[], args?: callbackArgs): Promise<{ [key: string]: number | undefined }> => {
    const { batchFetchCount } = getGlobalConfig('attachment', args && args[0]);
    if (batchFetchCount) {
      return batchFetchCount(uuids, { isPublic: args && args[1] });
    }
    return Promise.resolve({});
  };

  merger: PromiseMerger<number | undefined, callbackArgs> = new PromiseMerger<number | undefined, callbackArgs>(
    this.batchCallback,
    { maxAge: 60000, max: 100 },
  );

  fetchCountInBatch(uuid: string, field: Field | undefined, isPublic?: boolean): Promise<number | undefined> {
    return this.merger.add(uuid, (privateKey) => isPublic ? publicKey : privateKey, [field, isPublic]);
  }

  get(uuid: string): AttachmentCache | undefined {
    return this.cache.get(uuid);
  }

  set(uuid: string, cache: AttachmentCache) {
    this.cache.set(uuid, cache);
  }

  getCount(uuid: string): number | undefined {
    const cache = this.cache.get(uuid);
    if (cache) {
      return get(cache, 'count');
    }
  }

  getAttachments(uuid: string): AttachmentFile[] | undefined {
    const cache = this.cache.get(uuid);
    if (cache) {
      return get(cache, 'attachments');
    }
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      codes.forEach(code => {
        this.cache.delete(code);
      });
    } else {
      this.cache.clear();
    }
  }
}

export default new AttachmentStore();
