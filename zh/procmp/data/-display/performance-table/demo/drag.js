import { PerformanceTable, Icon } from 'choerodon-ui/pro';
import React from 'react';
import ReactDOM from 'react-dom';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

const { Column, Cell, HeaderCell } = PerformanceTable;

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
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item, _monitor) {
      onDrag(item.id, id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id, type: ItemTypes.COLUMN },
    collect: (monitor) => ({
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
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop(item, _monitor) {
      onDrag && onDrag(item.id, rowData.id);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id: rowData.id, type: ItemTypes.ROW },
    collect: (monitor) => ({
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
    <Cell {...rest} style={{ padding: 0, textAlign: 'center' }}>
      <div ref={ref} style={styles}>
        {children}
      </div>
    </Cell>
  );
}

function sort(source, sourceId, targetId) {
  const colSource = source.slice();
  const sourceIdIndex = colSource.findIndex((item) => item.id === sourceId);
  const targetIdIndex = colSource.findIndex((item) => item.id === targetId);
  const [removed] = colSource.splice(sourceIdIndex, 1);
  colSource.splice(targetIdIndex, 0, removed);
  return colSource;
}

function DraggableTable() {
  const [data, setData] = React.useState(
    fakeData.filter((item, index) => index < 7),
  );
  const [columns, setColumns] = React.useState([
    { id: 'id', name: 'Id', width: 250 },
    { id: 'firstName', name: 'First Name', width: 260 },
    { id: 'lastName', name: 'Last Name', width: 300 },
    { id: 'email', name: 'Email', width: 300 },
    { id: 'action', name: 'Action', width: 300 },
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
        <PerformanceTable height={400} data={data}>
          {columns.map((column) => (
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

ReactDOM.render(<DraggableTable />, document.getElementById('container'));
