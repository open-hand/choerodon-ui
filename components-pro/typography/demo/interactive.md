---
order: 4
title:
  zh-CN: 可交互
  en-US: Interactive
---

## zh-CN

提供可复制等额外的交互能力。

## en-US

Provide additional interactive capacity of copyable.

```jsx
import React from 'react';
import { Typography } from 'choerodon-ui/pro';
import {Icon} from 'choerodon-ui';

const { Paragraph } = Typography;


const Demo = () => {
  const editableStr = 'This is an editable text.';
  const customIconStr = 'Custom Edit icon and replace tooltip text.'
  const clickTriggerStr = 'Text or icon as trigger - click to start editing.';
  const customEnterIconStr = 'Editable text with a custom enter icon in edit field.';
  const noEnterIconStr = 'Editable text with no enter icon in edit field.';
  const hideTooltipStr = 'Hide Edit tooltip.';
  const lengthLimitedStr = 'This is an editable text with limited length.';

  return (
    <>
      <Paragraph copyable>{editableStr}</Paragraph>
      <Paragraph copyable >
        {customIconStr}
      </Paragraph>
      <Paragraph copyable>
        {clickTriggerStr}
      </Paragraph>
      <Paragraph copyable>
        {customEnterIconStr}
      </Paragraph>
      <Paragraph copyable>
        {noEnterIconStr}
      </Paragraph>
      <Paragraph copyable>
        {hideTooltipStr}
      </Paragraph>
      <Paragraph copyable >
        {lengthLimitedStr}
      </Paragraph>
      <Typography.Title copyable level={1} style={{ margin: 0 }}>
        h1. Choerodon-ui
      </Typography.Title>
      <Typography.Title copyable  level={2} style={{ margin: 0 }}>
        h2. Choerodon-ui
      </Typography.Title>
      <Typography.Title copyable level={3} style={{ margin: 0 }}>
        h3. Choerodon-ui
      </Typography.Title>
      <Typography.Title copyable level={4} style={{ margin: 0 }}>
        h4. Choerodon-ui
      </Typography.Title>
      <Typography.Title copyable level={5} style={{ margin: 0 }}>
        h5. Choerodon-ui
      </Typography.Title>
      <br />
      <Paragraph copyable>This is a copyable text.</Paragraph>
      <Paragraph copyable={{ text: 'Hello, Choerodon-ui!' }}>Replace copy text.</Paragraph>
      <Paragraph
        copyable={{
          icon: [<Icon type="face_retouching_natural" key={1} />, <Icon type="face_retouching_off" key={2} />],
          tooltips: ['click here', 'you clicked!!'],
        }}
      >
        Custom Copy icon and replace tooltips text.
      </Paragraph>
      <Paragraph copyable={{ tooltips: false }}>Hide Copy tooltips.</Paragraph>
    </>
  );
};

ReactDOM.render(<Demo />, mountNode);
```
