import AttachmentFile from '../data-set/AttachmentFile';
import { Sort } from './Attachment';

export function appendFormData(formData: FormData, data: object) {
  Object.keys(data).forEach(key => formData.append(key, data[key]));
}

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatFileSize(size: number, unitIndex = 0) {
  if (size < 1024) {
    return `${size}${units[unitIndex]}`;
  }
  return formatFileSize(Math.round(size / 1024), unitIndex + 1);
}

export function sortAttachments(attachments: AttachmentFile[] | undefined, sort: Sort): AttachmentFile[] | undefined {
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
    return attachments;
  }
}
