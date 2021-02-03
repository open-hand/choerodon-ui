import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Switch } from 'choerodon-ui/pro';

function handleChange({ name, value, oldValue }) {
  console.log(`[dataset:${name}]`, value, '[oldValue]', oldValue);
}

const data = [{
  bind: 'A',
}];

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'bind', multiple: true },
      { name: 'bind2', type: 'boolean' },
      { name: 'bind3', type: 'boolean', trueValue: 'Y', falseValue: 'N' },
    ],
    data,
    events: {
      update: handleChange,
    },
  });

  render() {
    return (
      <div>
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="bind" value="A" />
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="bind" value="B" />
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="bind" value="C" />
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="bind2" />
        <Switch style={{margin:'.1rem'}}  dataSet={this.ds} name="bind3" />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
