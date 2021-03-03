---
order: 4
title:
  zh-CN: 数据源选项
  en-US: DataSet Options
---

## zh-CN

数据源选项。当有分页时，请使用object类型字段，并且通过接口查询出显示值绑定到该字段上， 因为选项只会加载第一页数据，导致没有匹配的显示值。

## en-US

DataSet Options. 当有分页时，请使用object类型字段，并且通过接口查询出显示值绑定到该字段上， 因为选项只会加载第一页数据，导致没有匹配的显示值。

```jsx
import { DataSet, SelectBox, Row, Col, Button } from 'choerodon-ui/pro';

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
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
  });

  ds = new DataSet({
    data: [
      { userid: '15', name: '戴刚' }
    ],
    fields: [
      {
        name: 'user',
        type: 'object',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: this.optionDs,
        ignore: 'always',
      },
      {
        name: 'account',
        multiple: true,
      },
      {
        name: 'name',
        bind: 'user.name'
      },
       {
         name: 'userid',
         bind: 'user.userid'
       }
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  changeOptions = () => {
    this.ds.addField('account', {
      name: 'account',
      type: 'string',
      multiple: true,
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
          <SelectBox
            optionsFilter={record => record.get('sex') === 'F'}
            dataSet={this.ds}
            name="user"
          />
        </Col>
        <Col span={8}>
          <SelectBox dataSet={this.ds} name="account" />
        </Col>
        <Col span={8}>
          <Button onClick={this.changeOptions}>切换选项</Button>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
