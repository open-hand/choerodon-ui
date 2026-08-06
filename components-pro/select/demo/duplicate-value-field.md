---
order: 20
title:
  zh-CN: 重复值复现
  en-US: Duplicate Value Reproduction
---

## zh-CN

打开任一下拉框后，选项上方会显示错误 Alert，重复值选项会标红，控制台输出提示。该示例仅用于复现问题，业务中不建议使用重复值。

## en-US

Open either dropdown to see an error Alert above the options and duplicate-value options highlighted in red. In non-production environments, Console output prompt. This demo is only for reproduction; duplicate values are not recommended in business code.

```jsx
import { DataSet, Select } from 'choerodon-ui/pro';

const { Option } = Select;

const userOptions = new DataSet({
  paging: false,
  data: [
    { userid: 'duplicate-user', name: 'Alice' },
    { userid: 'duplicate-user', name: 'Bob' },
    { userid: 'unique-user', name: 'Carol' },
  ],
});

const ds = new DataSet({
    fields: [
      {
        name: 'user',
        type: 'object',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: userOptions,
      },
    ],
  });

function App() {
  return (
    <div>
      <p>JSX Option（Jack 与 Mark 的 value 均为 jack）</p>
      <Select placeholder="Open JSX options">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="jack">Mark</Option>
      </Select>
      <p>DataSet options（Alice 与 Bob 的 userid 相同）</p>
      <Select
        dataSet={ds}
        name="user"
        placeholder="Open DataSet options"
      />
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
