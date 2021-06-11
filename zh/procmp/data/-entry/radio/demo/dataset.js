import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Radio } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue);
}

const data = [{ bind: 'A' }];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'bind' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <form>
        <Radio dataSet={this.ds} name="bind" value="A">A</Radio>
        <Radio dataSet={this.ds} name="bind" value="B">B</Radio>
        <Radio dataSet={this.ds} name="bind" value="C">C</Radio>
      </form>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
