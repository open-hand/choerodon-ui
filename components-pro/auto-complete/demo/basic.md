---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { AutoComplete, DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    options: new DataSet({
      fields: [{
        name: 'value', type: 'string',
      }, {
        name: 'meaning', type: 'string',
      }],
      data: [{
        value: '1',
        meaning: '1',
      }, {
        value: '12',
        meaning: '12',
      }, {
        value: '123',
        meaning: '123',
      }],
    }),
  }

  render() {
    const { options } = this.state
    const optionRenderer = ({ value }) => {
      return `${value}@qq.com`
    }
    return (
      <AutoComplete options={options} optionRenderer={optionRenderer} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
