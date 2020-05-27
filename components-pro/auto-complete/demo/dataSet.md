---
order: 0
title:
  zh-CN: 绑定数据源
  en-US: Basic usage
---

## zh-CN

绑定数据源

## en-US

Basic usage example.

````jsx
import { AutoComplete, DataSet, Tooltip, Icon } from 'choerodon-ui/pro';

const data = [{
  user: 'wu',
}];

const renderer = ({ text }) => (
  <div style={{ width: '100%' }}>
    {text && <Icon type="people" />} {text}
  </div>
);

const optionRenderer = ({ text }) => (
  <Tooltip title={text} placement="left">
    {renderer({ text })}
  </Tooltip>
);

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', label: '用户' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

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
    return (
      <AutoComplete options={options} name="user" dataSet={this.ds} optionRenderer={optionRenderer} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
