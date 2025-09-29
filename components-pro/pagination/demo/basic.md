---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

```jsx
import { Form, Switch, DataSet, Pagination, NumberField, Button, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function handleChange(page, pageSize) {
  console.log('[pagination]', page, pageSize);
}

@observer
class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'showSizeChanger', type: 'boolean', label: 'showSizeChanger', defaultValue: true },
      { name: 'showTotal', type: 'boolean', label: 'showTotal', defaultValue: true },
      { name: 'showPager', type: 'string', label: 'showPager', defaultValue: 'false' },
      { name: 'showQuickJumper', type: 'boolean', label: 'showQuickJumper', defaultValue: false },
      { name: 'hideOnSinglePage', type: 'boolean', label: 'hideOnSinglePage', defaultValue: false },
      { name: 'simple', type: 'boolean', label: 'simple', defaultValue: false },
      { name: 'total', type: 'number', label: 'total', defaultValue: 90 },
    ],
  });

  render() {
    const {
      ds,
      ds: { current },
    } = this;
    return (
      <div>
        <Form columns={4} dataSet={ds} labelWidth={150}>
          <Switch name="showSizeChanger" />
          <Switch name="showTotal" />
          <Select name='showPager'>
            <Select.Option value='true'>true</Select.Option>
            <Select.Option value='false'>false</Select.Option>
            <Select.Option value='input'>input</Select.Option>
            <Select.Option value='selectAndInput'>selectAndInput</Select.Option>
          </Select>
          <Switch name="showQuickJumper" />
          <Switch name="hideOnSinglePage" />
          <Switch name="simple" />
          <NumberField name="total" />
        </Form>
        <Pagination
          showSizeChanger={current.get('showSizeChanger')}
          showTotal={current.get('showTotal')}
          showPager={current.get('showPager') === 'true' ? true : current.get('showPager') === 'false' ? false : current.get('showPager')}
          showQuickJumper={current.get('showQuickJumper')}
          simple={current.get('simple')}
          total={current.get('total')}
          hideOnSinglePage={current.get('hideOnSinglePage')}
          onChange={handleChange}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
