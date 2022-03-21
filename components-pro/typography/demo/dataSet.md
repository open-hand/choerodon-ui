---
order: 3
title:
  zh-CN: 绑定数据源
  en-US: Bind DataSet
---

## zh-CN

使用 DataSet 进行控制。

## en-US

Use DataSet to control

```jsx
import React from 'react'
import { Typography, DataSet, Form } from 'choerodon-ui/pro';

const { Text, Link, Title, Paragraph } = Typography;

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'title0', type: 'string', defaultValue: '非 Form 下使用' },
      { name: 'text0', type: 'string', defaultValue: '这个不在 Form 下的绑定数据源显示' },
      { name: 'link0', type: 'string', defaultValue: 'choerodon-ui' },
      { name: 'paragraph0', type: 'string', defaultValue: '这是一段不在 Form 表单下的段落展示。' },

      { name: 'title1', type: 'string', defaultValue: 'Introduce' },
      { name: 'title2', type: 'string', defaultValue: 'This is my personal profile' },
      { name: 'name', label:"姓名", type: 'string', defaultValue: 'LeBron James' },
      { name: 'age', label:"年龄", type: 'string', defaultValue: '28' },
      { name: 'sex', label:"性别", type: 'string', defaultValue: 'Male' },
      { name: 'habbit', label:"爱好", type: 'string', defaultValue: 'Basketball, rugby and Dancing' },
      { name: 'website', label:"网站", type: 'string', defaultValue: 'choerodon-ui' },
      { name: 'introduce', label:"个人经历", type: 'string', defaultValue: 'Extensive business experience including accounting firms,legal firms,financial firms,insurance companies,transportation companies,medical environments,government agencies and non-profit groups' },
    ],
  });

  render(){
    return (
      <>
        <Title name="title0" dataSet={this.ds} /> 
        <Text name="text0" dataSet={this.ds} /> 
        <br />
        <Link name="link0" href="/" dataSet={this.ds} /> 
        <Paragraph name='paragraph0' dataSet={this.ds} />
        <Form header="Form 下使用" dataSet={this.ds} useColon>
          <Title name='title1' level={2} labelWidth={0} />
          <Title name='title2' level={5} labelWidth={1} />
          <Text name="name" />
          <Text name="age" />
          <Text name="sex" />
          <Text name="habbit" />
          <Link name="website" href="/" target="_top" />
          <Paragraph name='introduce' />
        </Form>
      </>
      
    )
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
