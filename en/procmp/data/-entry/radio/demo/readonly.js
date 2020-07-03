import React from 'react';
import ReactDOM from 'react-dom';
import { Radio, DataSet } from 'choerodon-ui/pro';

const data = [{ rd: 'C' }];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'rd', readOnly: true },
    ],
  });

  render() {
    return (
      <div>
        <Radio name="rd" disabled>A</Radio>
        <Radio name="rd" readOnly>B</Radio>
        <Radio dataSet={this.ds} name="rd" value="C">C</Radio>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
