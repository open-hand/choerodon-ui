import React from 'react';
import { categories } from 'choerodon-ui-font';
import Category from './Category';

function renderCategories() {
  return Object.keys(categories).map(category => (
    <Category key={category} title={category} icons={categories[category]} />
  ));
}

const IconSet = () => <div>{renderCategories()}</div>;

export default IconSet;
