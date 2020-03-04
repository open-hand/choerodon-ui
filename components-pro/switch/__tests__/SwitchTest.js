import React from 'react';
import DataSet from '../../data-set';
import Switch from '..';

function handleChange({ name, value, oldValue }) {
  return { name, value, oldValue };
}

const data = [
  {
    bind: 'A',
  },
];

export default class ProgressTest extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'bind', multiple: true },
      { name: 'bind2', type: 'boolean', readOnly: true },
      { name: 'bind3', type: 'boolean', trueValue: 'Y', falseValue: 'N' },
    ],
    data,
    events: {
      update: handleChange,
    },
  });

  render() {
    return (
      <>
        <Switch dataSet={this.ds} name="bind" value="A" />
        <Switch dataSet={this.ds} name="bind" value="B" />
        <Switch dataSet={this.ds} name="bind" value="C" />
        <Switch dataSet={this.ds} name="bind2" />
        <Switch dataSet={this.ds} name="bind3" />
      </>
    );
  }
}
