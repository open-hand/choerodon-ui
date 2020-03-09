import React from 'react';
import ColorPicker from '..';
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

class ColorPickerTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'color',
        type: 'color',
        defaultValue: '#00ff12',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <ColorPicker dataSet={this.ds} name="color" />;
  }
}

export default ColorPickerTest;
