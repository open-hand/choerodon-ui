---
order: 17
title:
  zh-CN: 自适应高度
  en-US: AutoHeight
---

## zh-CN

自适应高度(需要父级元素非仅由 Table 撑开)。

autoHeight:

| 类型 | —— | 默认值 / 自定义 |
| --- | --- |  --- |
| boolean |  | false |
| boolean |  | true = { type: 'minHeight', diff: 80 } |
| object |  | { type: 'minHeight' \| 'maxHeight', diff: number(Table 自适应底部预留调整参数) } |

## en-US

AutoHeight.

```jsx
import {
  DataSet,
  Table,
  Form,
  TextField,
  NumberField,
  SelectBox,
  Modal,
  Button,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const { Column } = Table;

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
        queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs, // 下拉框组件的菜单数据集
        defaultValue: 'F',
      },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
  });

 demoDs = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'autoHeight', defaultValue: true },
    ],
  });
  
  render() {
    return (
      <div style={{ height: '500px' }}>
        <div style={{ 
            margin: "8px 16px 16px",
				    padding: "16px",
				    height: "calc(100% - 16px - 16px)",
    				overflow: "auto"
          }}>
          <Table 
            autoHeight={{ type: "maxHeight" }}
            key="user" 
            dataSet={this.userDs} 
            pristine
		        queryBar="professionalBar"
           >
            <Column name="userid" />
            <Column name="age" />
            <Column name="enable" />
            <Column name="name" />
          </Table>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
