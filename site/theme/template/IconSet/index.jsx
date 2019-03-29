import React from 'react';
import { Icon } from 'choerodon-ui';
import Category from './Category';

function renderCategories() {
  const { categories } = Icon;
  return Object.keys(categories)
    .map(category => (
      <Category
        key={category}
        title={category}
        icons={categories[category]}
      />
    ));
}

const IconSet = () => (
  <div>
    {renderCategories()}
  </div>
);

export default IconSet;
