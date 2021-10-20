import { action, get, observable, ObservableMap } from 'mobx';
import { getConfig } from 'choerodon-ui/lib/configure';
import PromiseMerger from '../_util/PromiseMerger';
import AttachmentFile from '../data-set/AttachmentFile';

export type AttachmentCache = { count?: number | undefined, attachments?: AttachmentFile[] | undefined };

export class AttachmentStore {

  cache: ObservableMap<string, AttachmentCache> = observable.map<string, AttachmentCache>();

  batchCallback = (uuids: string[]): Promise<{ [key: string]: number | undefined }> => {
    const { batchFetchCount } = getConfig('attachment');
    if (batchFetchCount) {
      return batchFetchCount(uuids);
    }
    return Promise.resolve({});
  };

  merger: PromiseMerger<number | undefined, []> = new PromiseMerger<number | undefined, []>(
    this.batchCallback,
    { maxAge: 60000, max: 100 },
  );

  fetchCountInBatch(uuid: string): Promise<number | undefined> {
    return this.merger.add(uuid);
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
