---
order: 29
title:
  zh-CN: 燕千云搜索条
  en-US: Bar for yanqian cloud
---

## zh-CN

燕千云搜索条。

## en-US

Bar for yanqian cloud

```jsx
import React from 'react'
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Menu, Dropdown, Icon } from 'choerodon-ui';

const optionData = [{ text: '男', value: 'M' }, { text: '女', value: 'F' }];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
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
    queryFields: [
      { name: 'name', type: 'string', label: '姓名', autoFocus: true },
      { name: 'age', type: 'number', label: '年龄', autoFocus: true },
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs,
      },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE', multiple: true },
    ],
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    events: {
      query: ({ params, data }) => console.log('custom bar query parameter', params, data),
    },
  });

  get columns() {
    return [{ name: 'name', width: 450 }, { name: 'age', editor: true }, { name: 'sex' }, { name: 'date.startDate' }, { name: 'code' }, { name: 'userid', lock: "right" }];
  }


  render() {
    const menu=()=>(
      <Menu>
        <Menu.Item key="1">
          类别
        </Menu.Item>
        <Menu.Item key="2">
          明细
        </Menu.Item>
      </Menu>
    )
    return (
      <div>
        <Table
          dataSet={this.ds}
          queryBar="yqcloudBar"
          buttons={['add']}
          queryHeaderConfig={{
            title: '燕千云',
            dropDownArea: (
              <Dropdown overlay={menu}>
                <Icon type="menu" />
              </Dropdown>
            ),
            fold: true,
            buttonArea: <Button>默认按钮</Button>,
            searchable: true,
          }}
          queryBarProps={{ defaultShowMore: false }}
          columns={this.columns}
          queryFieldsLimit={3}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
