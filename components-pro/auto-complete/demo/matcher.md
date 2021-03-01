---
order: 0
title:
  zh-CN: 修改匹配方式
  en-US: Modify matching method
---

## zh-CN

修改匹配方式。例如不区分大小写。

## en-US

Modify matching method.For example, case insensitive

````jsx
import { AutoComplete, DataSet } from 'choerodon-ui/pro';

const matcher=(value,inputText)=>{
  return value.toLocaleLowerCase().includes(inputText.toLocaleLowerCase())
}

class App extends React.Component {
  state = {
    options: new DataSet({
      fields: [{
        name: 'value', type: 'string',
      }, {
        name: 'meaning', type: 'string',
      }],
      data: [{
        value: 'Test',
        meaning: 'Test',
      }, {
        value: 'teSt',
        meaning: 'teSt',
      }, {
        value: 'test-1',
        meaning: 'test-1',
      }],
    }),
  }

  render() {
    const { options } = this.state
    
    return (
      <AutoComplete matcher={matcher} options={options} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
