import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Lov } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset multiple]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'code',
    data: [
      {
        code_code: 'HR.EMPLOYEE_GENDER, HR.EMPLOYEE_STATUS',
        code_description: '性别,员工状态',
      },
    ],
    fields: [
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'code_code',
        type: 'string',
        bind: 'code.code',
        multiple: ',',
      },
      {
        name: 'code_description',
        type: 'string',
        bind: 'code.description',
        multiple: ',',
      },
    ],
    cacheSelection: true,
    selection: 'multiple',
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Lov
        dataSet={this.ds}
        searchAction="blur"
        name="code"
        placeholder="复选LOV"
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
