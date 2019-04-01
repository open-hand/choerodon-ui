---
order: 4
title:
  zh-CN: 单元格渲染器
  en-US: Cell renderer
---

## zh-CN

单元格渲染器。

## en-US

Cell renderer.

````jsx
import { DatePicker } from 'choerodon-ui/pro';

function dayRenderer(props, text, currentDate) {
  const dayInWeek = currentDate.get('d');
  if (dayInWeek === 0 || dayInWeek === 1) {
    props.style = { color: 'red' };
  }
  return <td {...props} />;
}

function cellRenderer(view) {
  if (view === 'date') {
    return dayRenderer;
  }
}

ReactDOM.render(
  <DatePicker placeholder="Select date" cellRenderer={cellRenderer} />,
  mountNode
);
````
