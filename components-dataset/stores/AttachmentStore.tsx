import PromiseMerger from '../promise-merger';
import AttachmentFile from '../data-set/AttachmentFile';
import Field from '../data-set/Field';
import { getGlobalConfig } from './utils';

export type AttachmentCache = { count?: number | undefined, attachments?: AttachmentFile[] | undefined };

type callbackArgs = [Field | undefined, boolean | undefined];

const publicKey = Symbol('PUBLIC_KEY');

export class AttachmentStore {

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
    return undefined
  }


  /**
   * @deprecated
   */
  getAttachments(_uuid: string): AttachmentFile[] | undefined {
    return undefined
  }


  /**
   * @deprecated
   */
  clearCache(_codes?: string[]) {

  }
}

export default new AttachmentStore();
