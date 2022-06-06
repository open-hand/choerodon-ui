---
order: 0
title:
  zh-CN: 按钮
  en-US: button
---

## zh-CN

按钮模式

## en-US

Button Mode.


````jsx
import { Icon } from 'choerodon-ui';
import { ColorPicker } from 'choerodon-ui/pro';

ReactDOM.render(
  <>
    <ColorPicker defaultValue="#e88b3463" mode="button" preset style={{ marginRight: 30 }} />
    <ColorPicker defaultValue="#e88b34" mode="button"  renderer={({value}) =>{
      return <Icon type="color_lens-o" style={{ color: value }} />;
    }} />
  </>,
  mountNode
);

````
