---
order: 21
title:
  zh-CN: 头像展示
  en-US: Avatar Display
---

## zh-CN

支持下拉选项展示头像。

## en-US

Support avatar display in dropdown options.

```jsx
import { useDataSet, Select, Form } from 'choerodon-ui/pro';

const App = () => {
  const optionsDs = useDataSet(() => ({
    selection: 'single',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
  }), []);

  const ds = useDataSet(() => ({
    autoCreate: true,
    fields: [
      {
        name: 'single',
        type: 'object',
        options: optionsDs,
        textField: 'name',
        valueField: 'userid',
        label: '单选列表',
      },
      {
        name: 'multiple',
        type: 'object',
        options: optionsDs,
        textField: 'name',
        valueField: 'userid',
        label: '多选列表',
        multiple: true,
      },
      {
        name: 'colorful',
        type: 'object',
        options: optionsDs,
        textField: 'name',
        valueField: 'userid',
        label: '多色头像',
        multiple: true,
      },
    ],
  }), [optionsDs])

  return (
    <Form dataSet={ds}>
      <Select name="single" popupShowAvatar />
      <Select name="multiple" popupShowAvatar />
      <Select name="colorful" popupShowAvatar="colorful" />
    </Form>
  );
};


ReactDOM.render(<App />, mountNode);
```
