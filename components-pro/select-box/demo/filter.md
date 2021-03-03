---
order: 10
title:
  zh-CN: 过滤
  en-US: Filter
---

## zh-CN

通过属性`optionsFilter`过滤选项。

## en-US

Through the property `optionsFilter` the options will be filtered.

````jsx
import { DataSet, SelectBox, Button } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const data = [{
  'last-name': 'huazhen',
}];

class App extends React.Component {
  state = {
    key: 'a',
  };

  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string', label: '姓' },
    ],
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
        <SelectBox dataSet={this.ds} name="last-name" optionsFilter={this.optionsFilter}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="huazhen">Huazhen</Option>
        </SelectBox>
        <Button onClick={this.handleClick}>切换过滤条件</Button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
