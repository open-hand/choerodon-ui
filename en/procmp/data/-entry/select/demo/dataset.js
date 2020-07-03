import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Select;

const data = [{
  user: 'wu',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Select dataSet={this.ds} name="user">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
