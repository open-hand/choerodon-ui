import React from 'react';
import DateTimePicker from '../../date-time-picker';
import DataSet from '../../data-set';

function handleDataSetChange({ value, oldValue }) {
  // eslint-disable-next-line no-console
  console.log(
    '[dataset newValue]',
    value && value.format(),
    '[oldValue]',
    oldValue && oldValue.format(),
  );
}

const data = [
  {
    creationTime: '2020-01-22 19:19:19',
  },
];

class DateTimePickerTest extends React.Component {
  ds = new DataSet({
    data,
    fields: [{ name: 'creationTime', type: 'dateTime' }],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <DateTimePicker dataSet={this.ds} name="creationTime" />;
  }
}

export default DateTimePickerTest;
