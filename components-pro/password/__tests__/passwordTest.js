import React from 'react';
import Password from '..';
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

class PasswordTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'test',
        type: 'string',
        defaultValue: 'password',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <Password dataSet={this.ds} name="test" />;
  }
}

export default PasswordTest;
