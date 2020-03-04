import React from 'react';
import Transfer from '..';

const handleChange = value => {
  return value;
};

const { Option } = Transfer;

// eslint-disable-next-line react/prefer-stateless-function
export default class TransferTest extends React.Component {
  render() {
    return (
      <div>
        <Transfer onChange={handleChange} titles={['Source', 'Target']}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="wu">Wu</Option>
        </Transfer>
      </div>
    );
  }
}
