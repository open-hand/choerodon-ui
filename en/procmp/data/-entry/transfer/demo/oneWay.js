import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Transfer } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    '[record.get(name)]',
    record.get(name),
  );
}

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Huazhen', value: 'huazhen' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    fields: [
      {
        name: 'first-name',
        type: 'string',
        label: '名',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <div>
        <Transfer
          dataSet={this.ds}
          name="first-name"
          titles={['Source', 'Target']}
          oneWay
          sortable
          searchable
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
