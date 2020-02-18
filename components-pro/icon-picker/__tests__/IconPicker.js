import React from 'react';
import IconPicker from '..';
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

class IconPickerTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'icon',
        type: 'string',
        defaultValue: 'cancel',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <IconPicker dataSet={this.ds} name="icon" />;
  }
}

export default IconPickerTest;
