import dataset, { dsTempleList } from './dataset';
import tree, { treeTempList } from './tree';
import lov, { lovTempleList } from './lov';
import lookup, { lookupTempleList } from './lookup';

export default function() {
  dataset();
  tree();
  lov();
  lookup();
}

export const mockTempleList = [
  ...treeTempList,
  ...lovTempleList,
  ...lookupTempleList,
  ...dsTempleList,
];
