---
order: 2
title:
  zh-CN: 多选
  en-US: multiple selection
---

## zh-CN

多选，从已有条目中选择（scroll the menu）

## en-US

Multiple selection, selecting from existing items (scroll the menu).

````jsx
import { Select, Button } from 'choerodon-ui';
const Option = Select.Option;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}

class SelectMulitpleDemo extends React.Component {
  state = {
    loading: true,
    options: [],
  };
  componentDidMount() {
    this.getOptions();
  }
  getOptions = () => {
    setTimeout(() => {
      this.setState({
        options: children,
        loading: false,
      });
    }, 5000);
  }
  render() {
    const { options, loading } = this.state;
    return (
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        label="多选用例"
        onChange={handleChange}
        optionFilterProp="children"
        footer={<Button funcType="raised" type="primary">这里是footer</Button>}
        loading={loading}
        choiceRemove={false}
        filter
        allowClear
      >
        {options}
      </Select>
    );
  }
};
ReactDOM.render(<SelectMulitpleDemo />, mountNode);
````
