---
title: API
---

### Board

| Property | Description | Type | Default | Version |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------- | ----- |
| viewVisible | Controls view rendering. When the corresponding view is false, creating and switching views are hidden. | \{ card: boolean, kanban: boolean, table: boolean\} \| boolean | true | 1.6.1 |
| renderCommand | Render action buttons. | ({ command, viewMode, record, dataSet }) => command |  | 1.6.1 |
| onConfigChange | Configuration switch event. | (props) => void |  | 1.6.1 |
| cardProps | Card configuration. |  |  | 1.6.1 |
| tableProps | Table configuration. |  |  | 1.6.1 |
| kanbanProps | Kanban configuration. | { isDragDropDisabled: boolean; allDsProps: DataSetProps; columnDsProps: DataSetProps; droppableProps: DroppableProps; draggableProps: DraggableProps; dragDropContext: DragDropContextProps; cardWidth?: 4 \| 6 \| 8 \| 12; } |  | 1.6.1 |

For more properties, please refer to [Table](/en/procmp/data-display/table#API).
For more personalized storage examples, please refer to [Table#User Personalization](/en/procmp/data-display/table#user-personalization).

