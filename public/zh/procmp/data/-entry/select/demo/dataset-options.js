import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col, Button } from 'choerodon-ui/pro';

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
  optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/dataset/user/queries',
    autoQuery: true,
  });

  ds = new DataSet({
    fields: [
      {
        name: 'user',
        type: 'string',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: this.optionDs,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  changeOptions = () => {
    this.ds.addField('account', {
      name: 'account',
      type: 'string',
      textField: 'name',
      valueField: 'userid',
      label: '账户',
      options: this.optionDs,
    });
  };

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <Select
            multiple
            optionsFilter={record => record.get('sex') === 'F'}
            dataSet={this.ds}
            name="user"
          />
        </Col>
        <Col span={8}>
          <Select multiple dataSet={this.ds} name="account" />
        </Col>
        <Col span={8}>
          <Button onClick={this.changeOptions}>切换选项</Button>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
