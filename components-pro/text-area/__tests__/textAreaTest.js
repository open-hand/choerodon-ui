import React from 'react';
import TextArea from '..';
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

class TextAreaTest extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: 'string',
        defaultValue: 'textarea',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <TextArea dataSet={this.ds} name="content" resize="both" />;
  }
}

export default TextAreaTest;
