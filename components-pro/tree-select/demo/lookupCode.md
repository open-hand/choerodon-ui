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
import { DataSet, TreeSelect, Button, Row, Col } from 'choerodon-ui/pro';

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
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
      {
        name: 'sex2',
        type: 'string',
        computedProps: {
          lookupAxiosConfig: ({ record }) => ({
            url: record.get('sex') ? '/tree-less.mock' : null,
            transformResponse(data) {
              console.log('transformResponse', data);
              try {
                return JSON.parse(data);
              } catch(e) {
                return data;
              }
            },
          }),
        },
        textField: 'text',
        valueField: 'functionCode',
        idField: 'id',
        parentField: 'parentId',
      },
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
    },
  });

  changeLookupCode = () => {
    this.flag = !this.flag;
    this.ds.getField('sex').set('lookupCode', this.flag ? 'SYS.USER_STATUS' : 'HR.EMPLOYEE_GENDER');
  };

  render() {
    return (
      <Row gutter={10}>
        <Col span={6}>
          <TreeSelect dataSet={this.ds} name="sex" placeholder="请选择" onOption={handleOption} />
        </Col>
        <Col span={6}>
          <Button onClick={this.changeLookupCode}>修改lookupCode</Button>
        </Col>
        <Col span={12}>
          <TreeSelect dataSet={this.ds} name="sex2" placeholder="请选择" />
        </Col>
        <Col span={24}>
          <TreeSelect 
            dataSet={this.ds} 
            name="lov2" 
            placeholder="请选择" 
            maxTagCount={2} 
            maxTagTextLength={3} 
            maxTagPlaceholder={restValues => `+${restValues.length}...`}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
