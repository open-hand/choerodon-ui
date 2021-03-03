import React from 'react';
import ReactDOM from 'react-dom';
import { AutoComplete, DataSet } from 'choerodon-ui/pro';

const matcher = (value, inputText) => {
  return value.toLocaleLowerCase().includes(inputText.toLocaleLowerCase());
};

class App extends React.Component {
  state = {
    options: new DataSet({
      fields: [
        {
          name: 'value',
          type: 'string',
        },
        {
          name: 'meaning',
          type: 'string',
        },
      ],
      data: [
        {
          value: 'Test',
          meaning: 'Test',
        },
        {
          value: 'teSt',
          meaning: 'teSt',
        },
        {
          value: 'test-1',
          meaning: 'test-1',
        },
      ],
    }),
  };

  render() {
    const { options } = this.state;

    return <AutoComplete matcher={matcher} options={options} />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
