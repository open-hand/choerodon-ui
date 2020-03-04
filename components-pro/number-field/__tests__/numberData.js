import React from 'react';
import NumberField from '..';
import DataSet from '../../data-set';

function handleDataSetChange({ record, name, value, oldValue }) {
  // eslint-disable-next-line no-console
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class NumberDataTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'age', type: 'number', defaultValue: 10000000, required: true }],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <NumberField dataSet={this.ds} name="age" />;
  }
}

export default NumberDataTest;
