import React from 'react';
import { categories } from 'choerodon-ui-font';
import hzeroCategories from 'hzero-ued-icon/lib/index';
import Category from './Category';

function renderCategories() {
  const hzeroIcons = Object.keys(hzeroCategories).map(category => (
    <Category key={`hzero_${category}`} title={`hzero_${category}`} icons={hzeroCategories[category]} />
  ));
  const c7nIcons = Object.keys(categories).map(category => (
    <Category key={category} title={category} icons={categories[category]} />
  ));
  return [hzeroIcons, c7nIcons];
}

const IconSet = () => <div>{renderCategories()}</div>;

export default IconSet;
