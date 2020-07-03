import React from 'react';
import ReactDOM from 'react-dom';
import { AutoComplete, DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    options: new DataSet({
      fields: [{
        name: 'value', type: 'string',
      }, {
        name: 'meaning', type: 'string',
      }],
    }),
  }

  render() {
    const { options } = this.state
    const handeValueChange = (v) => {
      const value = v.target.value
      const suffixList = ['@qq.com', '@163.com', '@hand-china.com']
      if (value.indexOf('@') !== -1) {
        options.loadData([])
      } else {
        options.loadData(suffixList.map(suffix => ({
          value: `${value}${suffix}`,
          meaning: `${value}${suffix}`,
        })))
      }
    }

    return (
      <AutoComplete options={options} onInput={handeValueChange} />
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container'),
);
