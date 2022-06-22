import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, NumberField, Form } from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';

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

function handleChange(value, oldValue) {
  console.log('[range newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'age',
        type: 'number',
        required: true,
        max: '12345678901234567890123456',
        min: '-12345678901234567890123456',
        defaultValue: '123456789012345678.213123',
        formatterOptions: {
          lang: 'zh-CN',
          options: {
            maximumFractionDigits: 4,
            minimumFractionDigits: 2,
          },
        },
      },
      {
        name: 'big',
        type: 'bigNumber',
        required: true,
        max: '12345678901234567890123456',
        min: '-12345678901234567890123456',
        defaultValue: '123456789012345678.213123',
        precision: 2,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Form>
        <NumberField dataSet={this.ds} name="age" />
        <NumberField dataSet={this.ds} name="big" />
        <NumberField
          max="1234567890"
          min="-1234567890"
          step="0.0000000001"
          precision={10}
          defaultValue="10000000.0000000001"
          onChange={handleChange}
        />
        <NumberField
          max="1234567890"
          min="-1234567890"
          step="1"
          defaultValue={new BigNumber('10000000.0000000001')}
          onChange={handleChange}
        />
      </Form>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
