---
order: 16
title:
  zh-CN: 扩展菜单
  en-US: Custom dropdown
---

## zh-CN

扩展菜单

## en-US

Custom dropdown

```jsx
import { Select, Button, TextField, Form, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = Select;

const SelectContent = ({ children, dataSet, textField, valueField, setPopup }) => {
  const [value, setValue] = React.useState('');
  const handleAdd = React.useCallback(() => {
    if (value && !dataSet.find((record) => record.get(valueField) === value)) {
      dataSet.create({ [textField]: value, [valueField]: value });
    }
  }, [dataSet, textField, valueField, value]);
  const handleClose = React.useCallback(() => {
    setPopup(false);
  }, [setPopup]);
  return (
    <>
      {children}
      <div style={{ display: 'flex' }}>
        <TextField value={value} onChange={setValue} style={{ flex: 1 }} tabIndex={1} />
        <Button onClick={handleAdd} tabIndex={3}>Add</Button>
        <Button onClick={handleClose} tabIndex={2}>Close</Button>
      </div>
    </>
  );
}

const App = observer(() => {
  const ds = React.useMemo(() => new DataSet({ autoCreate: true }), []);
  const options = React.useMemo(() => new DataSet({
    data: [
      { value: 'jack', meaning: 'Jack' },
      { value: 'lucy', meaning: 'Lucy' },
      { value: 'wu', meaning: 'Wu' },
    ],
  }), []);
  const [created, setCreated] = React.useState(null);
  const [isCreate, setIsCreate] = React.useState(false);
  const reset = React.useCallback(() => {
    setIsCreate(false);
     setCreated(null);
     if (created && (!created.get('value') || !created.get('meaning'))) {
       options.remove(created);
     }
  }, [created, options]);
  const handlePopupHiddenChange = React.useCallback((hidden) =>{
    if (hidden) {
      reset();
    }
  }, [reset]);
  const renderPopupContent = React.useCallback(({ content, dataSet, textField, valueField, setPopup }) => isCreate? (
    <Form dataSet={dataSet}>
      <TextField name="value" label="值" />
      <TextField name="meaning" label="标题" />
      <Button onClick={reset}>还原</Button>
    </Form>
  ) : (
    <SelectContent dataSet={dataSet} textField={textField} valueField={valueField} setPopup={setPopup}>
      {content}
    </SelectContent>
  ), [isCreate, reset]);
  const renderSelectAllButton = React.useCallback((buttons) => [
    ...buttons,
    { key: 'add', children: '新增', onClick: () => {setCreated(options.create());setIsCreate(true);}},
  ], []);

  return (
    <Form dataSet={ds} labelLayout="float">
      <Select
        searchable
        name="value"
        options={options}
        placeholder="请选择"
        popupContent={renderPopupContent}
        selectAllButton={renderSelectAllButton}
        onPopupHiddenChange={handlePopupHiddenChange}
        tabIntoPopupContent
        multiple
      />
    </Form>
  );
});

ReactDOM.render(<App />, mountNode);
```
