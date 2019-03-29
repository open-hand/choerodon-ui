---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

头像有三种尺寸，两种形状可选。

## en-US

Three sizes and two shapes are available.

````jsx
import { Avatar } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <div>
      <Avatar size={64} icon="person" />
      <Avatar size="large" icon="person" />
      <Avatar icon="person" />
      <Avatar size="small" icon="person" />
    </div>
    <div>
      <Avatar shape="square" size={64} icon="person" />
      <Avatar shape="square" size="large" icon="person" />
      <Avatar shape="square" icon="person" />
      <Avatar shape="square" size="small" icon="person" />
    </div>
  </div>,
  mountNode);
````

<style>
#components-avatar-demo-basic .c7n-avatar {
  margin-top: 16px;
  margin-right: 16px;
}
</style>
