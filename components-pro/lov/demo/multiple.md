---
order: 1
title:
  zh-CN: 多值
  en-US: Multiple
---

## zh-CN

通过属性`multiple`设置为多值。

## en-US

Multiple values via property `multiple`.

```jsx
import { configure } from 'choerodon-ui';
import { DataSet, Lov, message } from 'choerodon-ui/pro';


configure({
  lovQueryCachedSelected() {
    return Promise.resolve([{ code: 'SYS.USER_STATUS11', description: '用户状态11' }]);
  }
});

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset multiple]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'code',
    data: [
      { 'code_code': 'HR.EMPLOYEE_GENDER, HR.EMPLOYEE_STATUS, SYS.USER_STATUS11' , 'code_description': '性别,员工状态,SYS.USER_STATUS11' }
    ],
    fields: [
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'code_code',
        type: 'string',
        bind: 'code.code',
        multiple: ','
      },
      {
         name: 'code_description',
         type: 'string',
        bind: 'code.description',
         multiple: ','
      }
    ],
    cacheSelection: true,
    selection: 'multiple',
    events: {
      update: handleDataSetChange,
    },
  });

  handleBeforeSelect = (records) => {
    if (!records.length) {
      message.warning('请选择至少一条记录');
      // return new Promise(resolve => setTimeout(resolve, 1000));
      return false;
    }
  }

  render() {
    const tableProps = {
      style: {
        maxHeight: 'calc(100vh - 400px)',
      },
    }
    return (
      <Lov
        dataSet={this.ds}
        searchAction="blur"
        name="code"
        placeholder="复选LOV"
        tableProps={tableProps}
        onBeforeSelect={this.handleBeforeSelect}
        showSelectedInView={true}
        selectionProps={{
          nodeRenderer: (record) => (<span style={{ color: 'red' }}>{record.get('description')}</span>)
        }}
        modalProps={
          {
            afterClose: () => console.log('afterClose'),
          }
        }
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
