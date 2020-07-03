import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, DataSet } from 'choerodon-ui/pro';

const data = [{ rd: 'C' }];

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'rd', readOnly: true },
    ],
    data,
  });

  render() {
    return (
      <div>
        <Switch name="rd" disabled />
        <br />
        <Switch name="rd" readOnly />
        <br />
        <Switch dataSet={this.ds} name="rd" value="C" />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
