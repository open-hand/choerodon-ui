import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Transfer } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[searchable]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Transfer;

const data = [{
  'last-name': 'zhangsan',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string', label: '姓' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Transfer dataSet={this.ds} name="last-name" searchable>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="zhangsan">Zhangsan</Option>
      </Transfer>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
