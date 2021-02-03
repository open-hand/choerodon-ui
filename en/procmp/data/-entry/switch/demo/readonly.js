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
        <Switch style={{margin:'.1rem'}}  name="rd" disabled />
        <br />
        <Switch style={{margin:'.1rem'}}  name="rd" readOnly />
        <br />
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="rd" value="C" />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
