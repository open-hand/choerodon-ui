import { Utils } from 'choerodon-ui/dataset';
import AttachmentFile from '../data-set/AttachmentFile';
import { Sort } from './Attachment';

const formatFileSize: typeof Utils.formatFileSize = Utils.formatFileSize;

export {
  formatFileSize,
};

export function sortAttachments(attachments: AttachmentFile[] | undefined, sort: Sort, orderField?: string): AttachmentFile[] | undefined {
  if (attachments) {
    if (!sort.custom) {
      const { type, order } = sort;
      return attachments.sort((a, b) => {
        if (type === 'name') {
          if (order === 'desc') {
            return b.name.localeCompare(a.name);
          }
          return a.name.localeCompare(b.name);
        }
        if (order === 'desc') {
          return b.creationDate.getTime() - a.creationDate.getTime();
        }
        return a.creationDate.getTime() - b.creationDate.getTime();
      });
    }
    if (sort.custom && orderField) {
      const { order } = sort;
      if (order === 'desc') {
        return attachments.sort((a, b) => b[orderField] - a[orderField]);
      }
      return attachments.sort((a, b) => a[orderField] - b[orderField]);
    }
    return attachments;
  }
}
