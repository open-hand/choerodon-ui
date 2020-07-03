import React from 'react';
import ReactDOM from 'react-dom';
import { TextArea, DataSet } from 'choerodon-ui/pro';

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
        name: 'content',
        type: 'string',
        defaultValue: 'textarea',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <TextArea dataSet={this.ds} name="content" resize="both" />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
