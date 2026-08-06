---
order: 31
title:
  zh-CN: 重复主键复现
  en-US: Duplicate Primary Key Reproduction
---

## zh-CN

同一当前页包含两条 `primaryKey='id'` 相同的不同记录。Table 会显示错误 Alert，并在重复记录最左侧显示红条；控制台输出提示。本示例刻意保留原始主键和重复数据，仅用于复现。

## en-US

The current page contains two different records with the same `primaryKey='id'`. Table displays an error Alert and a red bar at the left edge of duplicate rows. In non-production environments, Console output prompt. The original keys and duplicate data are intentionally preserved for reproduction only.

```jsx
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

const dataSet = new DataSet({
  primaryKey: 'id',
  paging: false,
  data: [
    { id: 'duplicate-id', name: 'Current page record A', source: 'current-page-a' },
    { id: 'duplicate-id', name: 'Current page record B', source: 'current-page-b' },
    { id: 'unique-id', name: 'Current page record C', source: 'current-page-c' },
  ],
  fields: [
    { name: 'id', type: 'string', label: 'ID' },
    { name: 'name', type: 'string', label: 'Name' },
    { name: 'source', type: 'string', label: 'Source' },
  ],
});

function App() {
  return (
    <Table dataSet={dataSet}>
      <Column name="id" />
      <Column name="name" />
      <Column name="source" />
    </Table>
  );
}

ReactDOM.render(<App />, mountNode);
```
