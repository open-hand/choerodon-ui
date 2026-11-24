import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select } from 'choerodon-ui/pro';

const { Option } = Select;

const userOptions = new DataSet({
  paging: false,
  data: [
    { userid: 'duplicate-user', name: 'Alice' },
    { userid: 'duplicate-user', name: 'Bob' },
    { userid: 'unique-user', name: 'Carol' },
  ],
});

const ds = new DataSet({
  autoCreate: true,
  fields: [
    {
      name: 'user',
      type: 'object',
      textField: 'name',
      valueField: 'userid',
      label: '用户',
      options: userOptions,
    },
  ],
});

function App() {
  return (
    <div>
      <p>JSX Option（Jack 与 Mark 的 value 均为 jack）</p>
      <Select
        duplicateKey={{ disable: true, showWarning: true }}
        placeholder="Open JSX options"
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="jack">Mark</Option>
      </Select>
      <p>DataSet options（Alice 与 Bob 的 userid 相同）</p>
      <Select
        duplicateKey={{ disable: true, showWarning: true }}
        dataSet={ds}
        name="user"
        placeholder="Open DataSet options"
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('container'));
