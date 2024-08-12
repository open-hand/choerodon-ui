---
order: 6
title:
  zh-CN: 查看详情
  en-US: showDetailWhenReadonly
---

## zh-CN

只读支持查看详情，不分页查询。需要后端支持。

## en-US

showDetailWhenReadonly.

```jsx
import { DataSet, Lov, message } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'code',
    data: [
      // { 'code_code': 'HR.EMPLOYEE_GENDER, HR.EMPLOYEE_STATUS, SYS.USER_STATUS11' , 'code_description': '性别,员工状态,SYS.USER_STATUS11' },
      { 'code_code': 'HR.EMPLOYEE_GENDER,HR.EMPLOYEE_STATUS', 'code_description': '性别,员工状态' },
    ],
    fields: [
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        multiple: true,
        lovQueryAxiosConfig: (code, lovConfig, props, lovQueryUrl) => {
          console.log('lovQueryAxiosConfig', props);
          const { params, lovQueryDetail } = props || {};
          let defaultUrl = `/common/lov/dataset/${code}${code === 'LOV_CODE' && params ? `/${params.pagesize}/${params.page}` : ''}`;
          defaultUrl = lovQueryDetail
            ? lovConfig ? lovConfig.detailUrl : `/common/lov/dataset/detail/${code}`
            : defaultUrl;
          return {
            url: defaultUrl,
            method: 'get',
          }
        }
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
    selection: 'multiple',
  });

  render() {
    return (
      <Lov
        dataSet={this.ds}
        name="code"
        disabled
        showDetailWhenReadonly
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
