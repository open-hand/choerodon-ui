---
order: 8
title:
  zh-CN: 可折叠触发区域
  en-US: Collapsible
---

## zh-CN

通过 `collapsible` 属性，可以设置面板的可折叠触发区域。

## en-US

Specify the trigger area of collapsible by `collapsible`.

```tsx
import { Collapse, Space } from 'choerodon-ui';
import React from 'react';

const Panel = Collapse.Panel;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;


ReactDOM.render(
  <>
    <Collapse>
      <Panel collapsible="header" header="This panel can't be collapsed" key="1">
        <p>{text}</p>
      </Panel>
    </Collapse>
    <br />
    <Collapse collapsible="header">
      <Panel collapsible="disabled" header="This panel can't be collapsed" key="1">
        <p>{text}</p>
      </Panel>
    </Collapse>
  </>,
  mountNode,
);
```
