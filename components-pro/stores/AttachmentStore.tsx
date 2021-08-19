import { getConfig } from 'choerodon-ui/lib/configure';
import PromiseMerger from '../_util/PromiseMerger';

export class AttachmentStore {
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
}

export default new AttachmentStore();
