---
title: API
---

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| items | The response object queue corresponds to the renderProps parameter of children and the parameters of onChange one by one object[] | - |
| disabled | Whether to disable the response | boolean | - |
| children | Child Element | ReactNode \| (responsiveItems: any[]) => ReactNode | - |
| onChange | Response value change hook | (responsiveItems: any[]) => void | - |

## Method

| Name | Description |
| --- | --- |
| blur() | Remove Focus |
| focus() | Get Focus |

### BreakPoints

| Key-value | Response ViewWidth |
|-----------|------------------------------------------|
| xs  |  < 576px | 
| sm  | >= 576px |
| md  | >= 768px |
| lg  | >= 992px | 
| xl  | >= 1200px | 
| xxl | >= 1600px |