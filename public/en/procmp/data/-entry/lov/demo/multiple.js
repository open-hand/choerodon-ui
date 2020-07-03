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
    autoCreate: true,
    fields: [
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
        defaultValue: ['Mock'],
      },
    ],
    cacheSelection: true,
    selection: 'multiple',
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <Lov dataSet={this.ds} name="code" placeholder="复选LOV" />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
