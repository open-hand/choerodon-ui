import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TimePicker } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'time',
        type: 'time',
        step: {
          minute: 15,
          second: 10,
        },
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <TimePicker
        dataSet={this.ds}
        name="time"
        placeholder="minute: 15, second: 10"
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
