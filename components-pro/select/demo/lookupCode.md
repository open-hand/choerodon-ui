---
order: 2
title:
  zh-CN: 值列表代码
  en-US: Lookup Code
---

## zh-CN

值列表代码。

## en-US

Lookup Code

```jsx
import { DataSet, Select, Output, Button, Row, Col } from 'choerodon-ui/pro';

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

function handleOption({ record }) {
  return {
    disabled: record.index === 0,
  };
}

class App extends React.Component {
  flag = false;

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'user', type: 'string', lookupCode: 'USER', valueField: 'code', textField: 'name', defaultValue: 'zf', lookupUrl: 'https://7b3fb464-bab8-478c-9350-1957e484162f.mock.pstmn.io/user' },
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
      {
        name: 'lov2',
        type: 'string',
        lookupCode: 'SHI',
        defaultValue: ['QP', 'XH'],
        multiple: true,
      },
    ],
    events: {
      update: handleDataSetChange,
      create({ dataSet, record }) {
        dataSet.addField('status', {
           name: 'status',
           computedProps: {
             lookupAxiosConfig: ({ record }) => record && ({
               url: record.get('sex') ? '/common/code/HR.EMPLOYEE_GENDER/' : '/common/code/SYS.USER_STATUS/',
               transformResponse(data) {
                 try {
                   const jsonData = JSON.parse(data);
                   console.log('transformResponse', jsonData);
                   return jsonData.rows || jsonData;
                 } catch(e) {
                   return data;
                 }
               },
             }),
           },
         });
        record.init('status', 'ACTV');
      }
    },
  });

  changeLookupCode = () => {
    this.flag = !this.flag;
    this.ds.getField('sex').set('lookupCode', this.flag ? 'SYS.USER_STATUS' : 'HR.EMPLOYEE_GENDER');
  };

  render() {
    if (!this.ds.current) {
      return null;
    }
    return (
      <Row gutter={10}>
        <Col span={6}>
          <Select dataSet={this.ds} name="sex" placeholder="请选择" onOption={handleOption} trigger={['hover']} />
        </Col>
        <Col span={6}>
          <Button onClick={this.changeLookupCode}>修改lookupCode</Button>
        </Col>
        <Col span={12}>
          <Output dataSet={this.ds} name="status" placeholder="请选择" />
        </Col>
        <Col span={24}>
          <Select 
            dataSet={this.ds} 
            name="lov2" 
            placeholder="请选择" 
            maxTagCount={2} 
            maxTagTextLength={3} 
            maxTagPlaceholder={restValues => `+${restValues.length}...`}
            style={{ width: '100%' }}
            trigger={['hover']}
          />
        </Col>
        <Col span={24}>
          <Select dataSet={this.ds} noCache name="user" placeholder="USER" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
