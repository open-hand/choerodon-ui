import React from 'react';
import DataSet from '../../data-set';
import Progress from '..';

export default class ProgressTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'percent', type: 'number', defaultValue: 100 }],
  });

  render() {
    return <Progress {...this.props} dataSet={this.ds} name="percent" />;
  }
}
