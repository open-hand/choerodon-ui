import React from 'react';
import IntlField from '..';
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

class IntlFieldTest extends React.Component {
  ds = new DataSet({
    primaryKey: 'pk',
    data: [{ 'first-name': '吴' }],
    tlsUrl: '/dataset/user/languages',
    fields: [
      {
        name: 'first-name',
        type: 'intl',
        defaultValue: 'Huazhen',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <IntlField dataSet={this.ds} name="first-name" />;
  }
}

export default IntlFieldTest;
