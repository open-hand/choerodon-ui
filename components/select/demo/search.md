---
order: 1
title:
  zh-CN: 带搜索框
  en-US: Select with search field
---

## zh-CN

展开后可对选项进行搜索。

## en-US

Search the options while expanded.

````jsx
import { Select } from 'choerodon-ui';
const Option = Select.Option;

ReactDOM.render(
  <Select
    style={{ width: 300 }}
    placeholder="Select a person"
    optionFilterProp="children"
    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    filter
  >
    <Option value="jack">Jack</Option>
    <Option value="lucy">Lucy</Option>
    <Option value="tom">Tom</Option>
    <Option value="jack1">Jack1</Option>
    <Option value="lucy1">Lucy1</Option>
    <Option value="tom1">Tom1</Option>
    <Option value="jack2">Jack2</Option>
    <Option value="lucy2">Lucy2</Option>
    <Option value="tom2">Tom2</Option>
  </Select>,
  mountNode);
````
