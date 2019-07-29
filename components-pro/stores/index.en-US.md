---
category: Pro Components
subtitle: 存储
cols: 1
type: Other
title: Stores
---

通过存储可以访问LovCode和lookupCode的相关信息。

## 使用

```jsx
import { Stores } from 'choerodon-ui/pro';

// 请求Lov配置，优先返回缓存中的数据
const config = await Stores.LovCodeStore.fetchConfig('LOV_CODE');

// 获取Lov配置生成的DataSet，优先返回缓存中的数据
const lovDataSet = await Stores.LovCodeStore.getLovDataSet('LOV_CODE');

// 请求快码值，优先返回缓存中的数据
const lookupData = await Stores.LookupCodeStore.fetchLookupData('/common/code/SYS.USER_STATUS/');
const lookupData = await Stores.LookupCodeStore.fetchLookupData({
  url: '/common/code/SYS.USER_STATUS/',
  method: 'get',
});

// 清除LookupCode缓存，不传参数时将清除所有缓存
Stores.LookupCodeStore.clearCache(['SYS.USER_STATUS', '/common/code/SYS.USER_STATUS/']);

// 清除Lov缓存，不传参数时将清除所有缓存
Stores.LovCodeStore.clearCache(['LOV_CODE']);

```
