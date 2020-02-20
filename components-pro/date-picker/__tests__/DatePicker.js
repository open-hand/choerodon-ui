import React from 'react';
import DatePicker from '..';
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

function rangeValidator(value, name) {
  // eslint-disable-next-line no-console
  console.log(`[validation ${name} value]`, value);
  return true;
}

class DatePickerTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        defaultValue: { start: '1984-11-22', end: '2020-02-09' },
        required: true,
        validator: rangeValidator,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <DatePicker dataSet={this.ds} name="date" placeholder={['Start Date', 'End Date']} />;
  }
}

export default DatePickerTest;
