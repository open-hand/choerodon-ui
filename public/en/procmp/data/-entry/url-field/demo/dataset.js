import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, UrlField } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'url', type: 'url', defaultValue: 'https://choerodon.io', required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <UrlField dataSet={this.ds} name="url" />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
