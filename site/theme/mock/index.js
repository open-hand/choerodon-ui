import setup from './setup';
import dataset from './dataset';
import tree from './tree';
import lov from './lov';
import lookup from './lookup';

export default function() {
  setup();
  dataset();
  tree();
  lov();
  lookup();
}
