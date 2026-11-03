---
order: 9
title:
  zh-CN: 下拉头像
  en-US: popup avatar
---

## zh-CN

下拉头像。

## en-US

popup avatar.

```jsx
import { DataSet, Form, Lov } from 'choerodon-ui/pro';

function nodeRenderer({ record }) {
  return record.get('text');
}

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'single',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            label: '单选下拉',
          },
          {
            name: 'multiple',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            label: '多选下拉',
            multiple: true,
          },
          {
            name: 'avatar1',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            label: '单选头像',
          },
          {
            name: 'avatar2',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            label: '多选头像',
            multiple: true,
          },
          {
            name: 'avatar-color',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            label: '多色头像',
            multiple: true,
          },
        ],
      }),
    [],
  );

  return (
    <>
      <Form dataSet={ds} header="popup" columns={2}>
        <Lov name="single" viewMode="popup" />
        <Lov name="multiple" viewMode="popup" />
        <Lov name="avatar1" popupShowAvatar viewMode="popup" />
        <Lov name="avatar2" popupShowAvatar viewMode="popup" />
        <Lov name="avatar-color" popupShowAvatar viewMode="popup" popupAvatarColorful />
      </Form>
      <Form dataSet={ds} header="searchable" columns={2}>
        <Lov name="single" searchable />
        <Lov name="multiple" searchable />
        <Lov name="avatar1" searchable popupShowAvatar />
        <Lov name="avatar2" searchable popupShowAvatar />
        <Lov name="avatar-color" searchable popupShowAvatar popupAvatarColorful />
      </Form>
    </>
  );
};

ReactDOM.render(<App />, mountNode);
```
