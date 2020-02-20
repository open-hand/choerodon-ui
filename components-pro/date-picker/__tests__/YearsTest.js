import React from 'react';
import YearsPicker from '../../year-picker';

class YearsPickerTest extends React.Component {
  handleChange(value, oldValue) {
    // eslint-disable-next-line no-console
    console.log(
      '[yearPicker]',
      value && value.format(),
      '[oldValue]',
      oldValue && oldValue.format(),
    );
  }

  render() {
    return <YearsPicker placeholder="Select year" onChange={this.handleChange} />;
  }
}

export default YearsPickerTest;
