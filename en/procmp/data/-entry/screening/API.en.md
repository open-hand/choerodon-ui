---
title: API
---

### Screening

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| tagRender | Render tags at the top; customize the display of selected values | ({ labelTitle, TagsProps }) => ReactElement<any> | - |
| onChange | Callback triggered when value changes | `(value: any, oldValue: any) => void` | - |

### ScreeningItem

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| multiple | Initially open multiple selection | string | - |
| name | Bind to specified field (required) | string | - |
| primitiveValue | Primitive value; similar effect to using field object | boolean | false |
| onChange | Callback triggered when modifying value | string | - |
| renderer | Renderer for the entire selection box | (props: RenderProps) => ReactNode | - |
| colProps | Grid layout configuration (see base components) | ColProps | - |
| rowProps | Grid layout configuration (see base components) | RowProps | - |
| optionRenderer | Customize option display | ({text,value,record}) => ReactElement<any>; | - |

### PropsTab 

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| text | Text content of each small tag | string | - |
| label | Tag subtitle | string | - |
| handleClose | Method triggered by clicking close button to remove value | (key) => void | - |
| key | Identifier of current field; used with handleClose and defined as unique value | string | - |

For more properties, please refer to [DataSetComponent](/en/procmp/abstract/ViewComponent#datasetcomponent).
