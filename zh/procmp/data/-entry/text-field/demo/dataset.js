import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TextField } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'first-name',
        type: 'string',
        defaultValue: 'Zhangsan',
        readOnly: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <TextField dataSet={this.ds} name="first-name" />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
