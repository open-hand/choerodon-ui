import React from 'react';
import ReactDOM from 'react-dom';
import { TextArea, DataSet } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
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

  state = { width: 200 };

  render() {
    return (
      <TextArea
        dataSet={this.ds}
        name="content"
        onChange={() => this.setState({ width: 300 })}
        onResize={(width) => this.setState({ width })}
        resize="both"
        style={{ width: this.state.width, height: 200 }}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
