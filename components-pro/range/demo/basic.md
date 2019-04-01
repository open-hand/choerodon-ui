---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

带有 range 控件的数字字段。

## en-US

Numeric field with range control

````jsx

import { Range } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Range min={0} max={1} step={0.01} />
    <Range style={{ margin: '0.2rem 0 0 0' }} value={20} min={0} max={100} step={5} disabled />
  </div>,
  mountNode
);

````
