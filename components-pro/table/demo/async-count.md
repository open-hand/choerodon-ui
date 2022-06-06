---
order: 17
title:
  zh-CN: 异步计数
  en-US: async count
---

## zh-CN

查询时通知后端是否自动统计总数
当 autoCount 设为 false 时， 查询的参数默认会带上count=N的参数（通过 configure 设置默认 autoCount 属性时，参数为defaultCount=N，用于区分全局设置和自定义设置），参数名和值可以通过全局配置 generatePageQuery 设置
当查询结果中 countKey 对应的值是 Y 时，会发起计数查询的请求，请求地址同 read 的地址， 请求参数会带上 onlyCount=Y 的参数，参数名和值可以通过全局配置 generatePageQuery 设置

## en-US



```jsx
import {
  DataSet,
  Table,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const { Column } = Table;

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize, count, onlyCount } }) {
        if (onlyCount === 'Y') {
          return {
            url: '/dataset/user/count',
          };
        }
        if (count === 'N') { 
          return {
            url: `/dataset/user/page/asynccount/${pagesize}/${page}`,
          };
        }
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    autoCount: false,
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
  });

  render() {
    return (
      <Table 
         autoHeight={{ type: "maxHeight" }}
         key="user" 
         dataSet={this.userDs} 
       >
        <Column name="userid" />
        <Column name="age" />
        <Column name="enable" />
        <Column name="name" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
