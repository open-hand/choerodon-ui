import { AttachmentBatchFetchCount, AttachmentValue } from 'choerodon-ui/dataset/configure';
import PromiseMerger from '../promise-merger';
import AttachmentFile from '../data-set/AttachmentFile';
import Field from '../data-set/Field';
import { getGlobalConfig } from './utils';

export type AttachmentCache = { count?: number | undefined, attachments?: AttachmentFile[] | undefined };

type callbackArgs = [AttachmentBatchFetchCount, boolean | undefined];

const publicKeys = new WeakMap<AttachmentBatchFetchCount, symbol>();
const privateKeys = new WeakMap<AttachmentBatchFetchCount, symbol>();

export class AttachmentStore {

  batchCallback = (uuids: string[], args: callbackArgs, items: AttachmentValue[]): Promise<{ [key: string]: number | undefined }> => {
    return args[0](uuids, { isPublic: args[1], items });
  };

  merger: PromiseMerger<number | undefined, callbackArgs, AttachmentValue> = new PromiseMerger<number | undefined, callbackArgs, AttachmentValue>(
    this.batchCallback,
    { maxAge: 60000, max: 100 },
  );

  fetchCountInBatch(options: AttachmentValue, field?: Field | undefined): Promise<number | undefined> {
    const { batchFetchCount } = getGlobalConfig('attachment', field);
    if (batchFetchCount) {
      const { isPublic, attachmentUUID } = options;
      return this.merger.add(attachmentUUID, () => {
        if (isPublic) {
          let publicKey = publicKeys.get(batchFetchCount);
          if (!publicKey) {
            publicKey = Symbol('PUBLIC_KEY');
            publicKeys.set(batchFetchCount, publicKey);
          }
          return publicKey;
        }
        let privateKey = privateKeys.get(batchFetchCount);
        if (!privateKey) {
          privateKey = Symbol('PRIVATE_KEY');
          privateKeys.set(batchFetchCount, privateKey);
        }
        return privateKey;
      }, [batchFetchCount, isPublic], options);
    }
    return Promise.resolve(undefined);
  }

  updateCacheCount(code: string, count?: number): void {
    const { merger: { cache } } = this;
    const cacheCount = cache.get(code);
    if (cacheCount !== count) {
      cache.set(code, count);
    }
  }

  /**
   * @deprecated
   */
  get(_uuid: string): undefined {
    return undefined;
  }


  /**
   * @deprecated
   */
  set(_uuid: string, _cache: AttachmentCache) {
  }


  /**
   * @deprecated
   */
  getCount(_uuid: string): number | undefined {
    return undefined;
  }


  /**
   * @deprecated
   */
  getAttachments(_uuid: string): AttachmentFile[] | undefined {
    return undefined;
  }


  /**
   * @deprecated
   */
  clearCache(_codes?: string[]) {

  }
}

export default new AttachmentStore();
