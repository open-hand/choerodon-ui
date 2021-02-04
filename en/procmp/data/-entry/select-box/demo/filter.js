import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, SelectBox, Button } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const data = [
  {
    'last-name': 'zhangsan',
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
    const { key } = this.state;
    return record.get('meaning').toLowerCase().indexOf(key) !== -1;
  };

  render() {
    return (
      <div>
        <SelectBox
          dataSet={this.ds}
          name="last-name"
          optionsFilter={this.optionsFilter}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="zhangsan">Zhangsan</Option>
        </SelectBox>
        <Button onClick={this.handleClick}>切换过滤条件</Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
