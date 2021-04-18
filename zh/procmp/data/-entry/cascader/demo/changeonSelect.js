import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Cascader } from 'choerodon-ui/pro';

class App extends React.Component {
  optionDs = new DataSet({
    queryUrl: '/tree-less.mock',
    autoQuery: true,
    selection: 'mutiple',
    parentField: 'parentId',
    idField: 'id',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'string' },
    ],
  });

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'id',
        type: 'string',
        textField: 'text',
        defaultValue: ['2', '7'],
        valueField: 'id',
        label: '部门',
        options: this.optionDs,
      },
    ],
  });

  render() {
    return <Cascader changeOnSelect dataSet={this.ds} name="id" />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
