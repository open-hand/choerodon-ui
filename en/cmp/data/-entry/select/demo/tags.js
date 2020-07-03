import React from 'react';
import ReactDOM from 'react-dom';
import { Select } from 'choerodon-ui';
import classNames from 'classnames';

const Option = Select.Option;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}

function handleRender(liNode, value) {
  console.log(value);
  return React.cloneElement(liNode, {
    className: classNames(liNode.props.className, 'choice-render'),
  });
}

ReactDOM.render(
  <Select
    mode="tags"
    style={{ width: '100%' }}
    label="标签用例"
    placeholder="tags"
    onChange={handleChange}
    choiceRender={handleRender}
    allowClear
  >
    {children}
  </Select>,
  document.getElementById('container'));
