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
| lookupAxiosMethod | Lookup and lov fetch method | string \| string | post |
| lovDefineUrl | Lov configure url or hook which return url | string \| ((code: string) => string) | code => \`/sys/lov/lov_define?code=${code}\` |
| lovQueryUrl | Lov query url or hook which return url | string \| ((code: string) => string) | code => \`/common/lov/dataset/${code}\` |
| axios | Replace the built-in axios instance | AxiosInstance |  |
| dataKey | default DataSet's dataKey  | string | rows |
| totalKey | default DataSet's totalKey | string | total |
| labelLayout | default Form's labelLayout | string | horizontal |
| queryBar | default table's queryBar | string | normal |
| tableBorder | default table's border | boolean | true |
| tableHighLightRow | Default Table current line highlight | boolean | true |
| tableRowHeight | Default Table row height | auto \| number | 30 |
| tableColumnResizable | Default Table column resizable | boolean | true |
| renderEmpty | set empty content of components. | Function(componentName: string): ReactNode | - |
