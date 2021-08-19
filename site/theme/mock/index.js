import dataset, { dsTempleList } from './dataset';
import tree, { treeTempList } from './tree';
import lov, { lovTempleList } from './lov';
import lookup, { lookupTempleList } from './lookup';
import upload, { uploadTempList } from './upload';
import attachment, { attachmentTempleList } from './attachment';

export default function () {
  dataset();
  tree();
  lov();
  lookup();
  upload();
  attachment();
  if (typeof window !== 'undefined') {
    const XHR = window._XMLHttpRequest;
    if (XHR) {
      const xhr = new XHR();
      window.XMLHttpRequest.prototype.upload = xhr.upload;
    }
  }
}

export const mockTempleList = [
  ...treeTempList,
  ...lovTempleList,
  ...lookupTempleList,
  ...dsTempleList,
  ...uploadTempList,
  ...attachmentTempleList,
];
