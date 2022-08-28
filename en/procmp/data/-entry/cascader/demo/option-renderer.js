import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Cascader, Tooltip, Icon } from 'choerodon-ui/pro';

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
    events: {
      update: handleDataSetChange,
    },
  });

  renderer = ({ text }) => (
    <div style={{ width: '100%' }}>
      {text && <Icon type="badge" />} {text}
    </div>
  );

  optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      {this.renderer({ text })}
    </Tooltip>
  );

  render() {
    return (
      <Cascader
        dataSet={this.ds}
        name="id"
        searchable
        optionRenderer={this.optionRenderer}
        renderer={this.renderer}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
