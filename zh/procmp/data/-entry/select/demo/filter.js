import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Button } from 'choerodon-ui/pro';

const { Option } = Select;

const data = [
  {
    'last-name': 'huazhen',
  },
];

class App extends React.Component {
  state = {
    key: 'a',
  };

  ds = new DataSet({
    data,
    fields: [{ name: 'last-name', type: 'string', label: '姓' }],
  });

  handleClick = () => {
    this.setState({ key: this.state.key === 'a' ? 'c' : 'a' });
  };

  optionsFilter = (record) => {
    return record.get('meaning').toLowerCase().indexOf(this.state.key) !== -1;
  };

  render() {
    return (
      <div>
        <Select
          dataSet={this.ds}
          name="last-name"
          optionsFilter={this.optionsFilter}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="huazhen">Huazhen</Option>
        </Select>
        <Button style={{ marginLeft: 10 }} onClick={this.handleClick}>
          切换过滤条件
        </Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
