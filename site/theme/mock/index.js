import dataset, { dsTempleList } from './dataset';
import tree, { treeTempList } from './tree';
import lov, { lovTempleList } from './lov';
import lookup, { lookupTempleList } from './lookup';
import upload, { uploadTempList } from './upload';

export default function() {
  dataset();
  tree();
  lov();
  lookup();
  upload();
}

export const mockTempleList = [
  ...treeTempList,
  ...lovTempleList,
  ...lookupTempleList,
  ...dsTempleList,
  ...uploadTempList,
];
