import React from 'react';
import ReactDOM from 'react-dom';
import { Select, Button } from 'choerodon-ui';

const Option = Select.Option;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i}>{i.toString(36) + i}</Option>);
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
    }, 3000);
  };

  handleChoiceRemove = value => {
    return value >= 15;
  };

  render() {
    const { options, loading } = this.state;
    return (
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        label="多选用例"
        optionFilterProp="children"
        footer={
          <Button funcType="raised" type="primary">
            这里是footer
          </Button>
        }
        loading={loading}
        choiceRemove={this.handleChoiceRemove}
        filter
        allowClear
      >
        {options}
      </Select>
    );
  }
}

ReactDOM.render(<SelectMulitpleDemo />, document.getElementById('container'));
