---
order: 2
title:
  zh-CN: 拖拽
  en-US: drag
---

## zh-CN

拖拽。

## en-US

drag.

````jsx

import React from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { PerformanceTable, Icon } from 'choerodon-ui/pro';
import { HTML5Backend } from 'react-dnd-html5-backend';

import '../../../components-pro/performance-table/style/index.less';
import fakeData from '../../../site/theme/mock/performance-data/users';

const { Column, Cell, HeaderCell  } = PerformanceTable;

const style = {
  border: '1px dashed gray',
  cursor: 'move',
  padding: '0 0.1rem',
};

const ItemTypes = {
  COLUMN: 'column',
  ROW: 'row',
};

function DraggableHeaderCell({ children, onDrag, id, ...rest }) {
  const ref = React.useRef(null);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item, _monitor) {
      onDrag(item.id, id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id, type: ItemTypes.COLUMN },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  const isActive = canDrop && isOver;

  drag(drop(ref));

  const styles = {
    ...style,
    opacity,
    background: isActive ? '#ddd' : null,
  };

  return (
    <HeaderCell {...rest} style={{ padding: 0 }}>
      <div ref={ref} style={styles}>
        {children}
      </div>
    </HeaderCell>
  );
}

function DraggableCell({ children, onDrag, _id, rowData, ...rest }) {
  const ref = React.useRef(null);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ItemTypes.ROW,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item, _monitor) {
      onDrag && onDrag(item.id, rowData.id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id: rowData.id, type: ItemTypes.ROW },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  const isActive = canDrop && isOver;

  drag(drop(ref));

  const styles = {
    ...style,
    opacity,
    background: isActive ? '#ddd' : null,
  };

  return (
    <Cell {...rest} style={{ padding: 0,textAlign: 'center' }}>
      <div ref={ref} style={styles}>
        {children}
      </div>
    </Cell>
  );
}

function sort(source, sourceId, targetId) {
  const nextData = source.filter(item => item.id !== sourceId);
  const dragItem = source.find(item => item.id === sourceId);
  const index = nextData.findIndex(item => item.id === targetId);

  nextData.splice(index + 1, 0, dragItem);
  return nextData;
}

function DraggableTable() {
  const [data, setData] = React.useState(fakeData.filter((item, index) => index < 7));
  const [columns, setColumns] = React.useState([
    { id: 'id', name: 'Id', width: 250 },
    { id: 'firstName', name: 'First Name', width: 260 },
    { id: 'lastName', name: 'Last Name', width: 300 },
    { id: 'email', name: 'Email', width: 300 },
    { id: 'action', name: 'Action', width: 300},
  ]);

  const handleDragColumn = (sourceId, targetId) => {
    setColumns(sort(columns, sourceId, targetId));
  };

  const handleDragRow = (sourceId, targetId) => {
    setData(sort(data, sourceId, targetId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <PerformanceTable height={400} data={data} rowKey='id'>
          {columns.map(column => (
            <Column width={column.width} key={column.id}>
              <DraggableHeaderCell onDrag={handleDragColumn} id={column.id}>
                {column.name} <Icon type="add" />
              </DraggableHeaderCell>

              {column.id === 'action' ? (
                <DraggableCell id={column.id} onDrag={handleDragRow}>
                 <Icon type="add" />
                </DraggableCell>
              ) : (
                <Cell dataKey={column.id} />
              )}
            </Column>
          ))}
        </PerformanceTable>
      </div>
    </DndProvider>
  );
}

ReactDOM.render(
  <DraggableTable />,
  mountNode
);
````
