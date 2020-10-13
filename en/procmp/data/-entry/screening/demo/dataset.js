import React from 'react';
import ReactDOM from 'react-dom';
import { Screening, DataSet } from 'choerodon-ui/pro';

const { ScreeningItem } = Screening;

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.toData(),
  );
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    data: [{ wear5: ['kidsOverSize', 'thermalUnderWear'] }],
    fields: [
      { name: 'wear0', type: 'object', lookupCode: 'WEAR', label: '衣服分类0' },
      { name: 'wear1', type: 'string', lookupCode: 'WEAR', label: '衣服分类1' },
      { name: 'wear2', type: 'string', lookupCode: 'WEAR', label: '衣服分类2' },
      { name: 'wear3', type: 'string', lookupCode: 'WEAR', label: '衣服分类3' },
      { name: 'wear4', type: 'string', lookupCode: 'WEAR', label: '衣服分类4' },
      { name: 'wear5', type: 'string', lookupCode: 'WEAR', label: '衣服分类5' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Screening dataSet={this.ds}>
        <ScreeningItem name="wear0" />
        <ScreeningItem
          optionRenderer={({ text, _value, _record }) => `${text}-精品`}
          colProps={{ span: 8 }}
          name="wear1"
        />
        <ScreeningItem name="wear2" />
        <ScreeningItem colProps={{ span: 12 }} name="wear3" />
        <ScreeningItem name="wear4" />
        <ScreeningItem name="wear5" />
      </Screening>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
