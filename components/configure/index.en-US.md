---
category: Components
type: Other
cols: 1
title: Configure
---

## Usage

```jsx
import { configure } from 'choerodon-ui';

configure({ prefixCls: 'ant' });
```

## API

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| prefixCls | set prefix class | string | c7n |
| proPrefixCls | set prefix class for pro components | string | c7n-pro |
| ripple | Whether to open the ripple effect | boolean | true |
| lookupUrl | Lookup value url or hook which return url | string \| ((code: string) => string) | code => \`/common/code/${code}/\` |
| lovDefineUrl | Lov configure url or hook which return url | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=${code}\` |
| lovQueryUrl | Lov query url or hook which return url | string \| ((code: string) => string) | code => \`/common/lov/dataset/${code}\` |
| axios | Replace the built-in axios instance | AxiosInstance |  |
| dataKey | default DataSet's dataKey  | string | |
| totalKey | default DataSet's totalKey | string | |
| labelLayout | default Form's labelLayout | string | |
| queryBar | default table's queryBar | string | |
| tableBorder | default table's border | string | |
