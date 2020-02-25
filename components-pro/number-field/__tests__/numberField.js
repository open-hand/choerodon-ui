import React from 'react';
import NumberField from '..';

class NumberTest extends React.Component {
  handleChange(value, oldValue) {
    // eslint-disable-next-line no-console
    console.log('[range newValue]', value, '[oldValue]', oldValue);
  }

  render() {
    return (
      <NumberField
        range={['start', 'end']}
        defaultValue={{ start: 0, end: 4 }}
        placeholder={['Range Start', 'Range End']}
        onChange={this.handleChange}
      />
    );
  }
}

export default NumberTest;
