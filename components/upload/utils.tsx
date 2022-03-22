import { UploadFile } from './interface';

export function T() {
  return true;
}

// Fix IE file.status problem
// via coping a new Object
export function fileToObject(file: UploadFile) {
  return {
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
    name: file.filename || file.name,
    size: file.size,
    type: file.type,
    uid: file.uid,
    response: file.response,
    error: file.error,
    percent: 0,
    originFileObj: file as (File | UploadFile),
  } as UploadFile;
}

/**
 * 生成Progress percent: 0.1 -> 0.98
 *   - for ie
 */
export function genPercentAdd() {
  let k = 0.1;
  const i = 0.01;
  const end = 0.98;
  return function (s: number) {
    let start = s;
    if (start >= end) {
      return start;
    }

    start += k;
    k -= i;
    if (k < 0.001) {
      k = 0.001;
    }
    return start;
  };
}

export function getFileItem(file: UploadFile, fileList: UploadFile[]) {
  const matchKey = file.uid !== undefined ? 'uid' : 'name';
  return fileList.filter(item => item[matchKey] === file[matchKey])[0];
}

export function removeFileItem(file: UploadFile, fileList: UploadFile[]) {
  const matchKey = file.uid !== undefined ? 'uid' : 'name';
  const removed = fileList.filter(item => item[matchKey] !== file[matchKey]);
  if (removed.length === fileList.length) {
    return null;
  }
  return removed;
}

const isImageFileType = (type: string): boolean => type.indexOf('image/') === 0;

const MEASURE_SIZE = 200;

export function previewImage(file: File | Blob): Promise<string> {
  return new Promise(resolve => {
    if (!file.type || !isImageFileType(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result || '').toString());
      reader.readAsDataURL(file);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = MEASURE_SIZE;
    canvas.height = MEASURE_SIZE;
    canvas.style.cssText = `position: fixed; left: 0; top: 0; width: ${MEASURE_SIZE}px; height: ${MEASURE_SIZE}px; z-index: 9999; display: none;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;

      let drawWidth = MEASURE_SIZE;
      let drawHeight = MEASURE_SIZE;
      let offsetX = 0;
      let offsetY = 0;

      if (width < height) {
        drawHeight = height * (MEASURE_SIZE / width);
        offsetY = -(drawHeight - drawWidth) / 2;
      } else {
        drawWidth = width * (MEASURE_SIZE / height);
        offsetX = -(drawWidth - drawHeight) / 2;
      }

      ctx!.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const dataURL = canvas.toDataURL();
      document.body.removeChild(canvas);

      resolve(dataURL);
    };
    img.src = window.URL.createObjectURL(file);
  });
}

/**
 * 获取部分文件类型
 * @param filename 文件名
 * @returns 文件类型
 */
export function getFileType(filename: string): string {
  if (/\.(zip|rar|rar4|7z|Z|gz|bz2|xz|tar|tar\.gz|tar\.bz2|tar\.xz)$/i.test(filename)) {
    return 'compressedfile';
  }
  const suffix = filename ?
    filename.lastIndexOf('.') === -1 ? '' : filename.split('.').pop()
    : '';
  switch (suffix ? suffix.toLowerCase() : '') {
    case 'doc':
    case 'docx':
      return 'doc';
    case 'webp':
    case 'svg':
    case 'png':
    case 'gif':
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'bmp':
    case 'dpg':
    case 'ico':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'xls':
    case 'xlsx':
      return 'xls';
    default:
      return 'other';
  }
}

export function getFileSizeStr(filesize: number): string {
  const scale = 1024;
  if (isNaN(filesize / scale)) {
    return '';
  }
  return filesize / scale / scale >= 0.09 ?
    filesize / scale / scale / scale >= 0.09 ? `${(filesize / scale / scale / scale).toFixed(1)}GB` : `${(filesize / scale / scale).toFixed(1)}MB`
    : `${(filesize / scale).toFixed(1)}KB`;
}

const extname = (url = ''): string => {
  const temp = url.split('/');
  const filename = temp[temp.length - 1];
  const filenameWithoutSuffix = filename.split(/#|\?/)[0];
  return (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [''])[0];
};

export const isImageUrl = (file: UploadFile): boolean => {
  if (file.type && !file.thumbUrl) {
    return isImageFileType(file.type);
  }
  const url: string = (file.name || file.thumbUrl || file.url || '') as string;
  const extension = extname(url);
  if (
    /^data:image\//.test(url) ||
    /(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico)$/i.test(extension)
  ) {
    return true;
  }
  if (/^data:/.test(url)) {
    // other file types of base64
    return false;
  }
  if (extension) {
    // other file types which have extension
    return false;
  }
  return true;
};
