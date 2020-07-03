import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Output } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'first-name', type: 'string', defaultValue: 'Huazhen', required: true },
    ],
  });

  render() {
    return <Output dataSet={this.ds} name="first-name" />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
