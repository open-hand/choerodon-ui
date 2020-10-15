import React, { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Table } from 'choerodon-ui';
import { DndProvider, useDrag, useDrop, createDndContext } from 'react-dnd';
import update from 'immutability-helper';

// import { HTML5Backend } from 'react-dnd-html5-backend';

const RNDContext = createDndContext(HTML5Backend);

const type = 'DragableBodyRow';

const DragableBodyRow = ({
  index,
  moveRow,
  className,
  style,
  ...restProps
}) => {
  const ref = React.useRef();
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    item: { type, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const DragSortingTable = () => {
  const [data, setData] = useState([
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ]);

  const components = {
    body: {
      row: DragableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = data[dragIndex];
      setData(
        update(data, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      );
    },
    [data],
  );

  const manager = useRef(RNDContext);

  return (
    <DndProvider manager={manager.current.dragDropManager}>
      <Table
        columns={columns}
        dataSource={data}
        components={components}
        onRow={(record, index) => ({
          index,
          moveRow,
        })}
      />
    </DndProvider>
  );
};

ReactDOM.render(<DragSortingTable />, document.getElementById('container'));
