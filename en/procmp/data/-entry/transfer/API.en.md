---
title: API
---

### Transfer

> Added properties since version 1.5.0.

| Property | Description | Type | Default |
|-----------|------------------------------------------|------------|--------|
| operations | Operation text set; order from bottom to top | string\[] \| ReactNode[] | ['>', '<'] |
| sortable | Whether to show sort buttons | boolean | false |
| sortOperations | Sort text set | string\[] \| ReactNode[] | ['∧', '∨'] |
| placeholderOperations(1.6.6) | Search text set | string\[]\| string | Please enter your search |
| oneWay(1.5.1) | One way shuttle | boolean | false |

For more properties, please refer to [Select](/en/procmp/data-entry/select/#Select).


### Transfer.OptGroup 

| Property | Description | Type |
|-----------|------------------------------------------|------------|
| label | Option group title | string |

### Transfer.Option

| Property | Description | Type |
|-----------|------------------------------------------|------------|
| value | Option value | any |

### Render Props

> Component added in version 1.5.3.

- Transfer supports receiving children to customize the rendered list and returns the following parameters:

| Property | Description | Type |
|-----------|------------------------------------------|------------|
| direction | Direction of the rendered list | `left` \| `right`  |
| targetOption | Target data source | Record[]  |
| setTargetOption(1.5.5) | Set target data source | (values: any[]) => void  |  |
| onItemSelect | Select items | (Records: Record[])  |

#### Reference Example

```
<Transfer {...props}>{({ direction, targetOption, onItemSelect}) => <YourComponent {...listProps} />}</Transfer>
 ```
