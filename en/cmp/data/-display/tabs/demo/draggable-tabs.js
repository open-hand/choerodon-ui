import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Tabs } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';
import {
  DndContext,
  PointerSensor,
  useSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableTabNode = ({ ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: props['data-node-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleX: 1 }),
    transition: transition || 'none',
    cursor: 'move',
  };

  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

const App = () => {
  const [items, setItems] = useState([
    {
      key: '1',
      label: 'Tab 1',
      children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Tab 2',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Tab 3',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: 'Tab 4',
      children: <TextField />,
    },
  ]);

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }) => {
    // 第一个不可移动
    if (active.id !== over?.id && active.id !== '1' && over?.id !== '1') {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  const add = () => {
    items.push({
      label: 'New Tab',
      children: 'Content of new Tab',
      key: String(new Date().getTime()),
    });
    setItems([...items]);
  };

  const remove = (targetKey) => {
    setItems(items.filter((item) => item.key !== targetKey));
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else if (action === 'remove') {
      remove(targetKey);
    }
  };

  return (
    <Tabs
      defaultActiveKey="1"
      type="editable-card"
      onEdit={onEdit}
      renderTabBar={(tabBarProps, DefaultTabBar) => (
        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
          <SortableContext
            items={items.map((i) => i.key)}
            strategy={horizontalListSortingStrategy}
          >
            <DefaultTabBar {...tabBarProps}>
              {(node) => {
                // 第一个不可移动
                if (node.props['data-node-key'] === '1') {
                  return node;
                }
                return (
                  <DraggableTabNode {...node.props} key={node.key}>
                    {node}
                  </DraggableTabNode>
                );
              }}
            </DefaultTabBar>
          </SortableContext>
        </DndContext>
      )}
    >
      {items.map((item) => {
        return (
          <Tabs.TabPane tab={item.label} key={item.key}>
            <div>{item.children}</div>
          </Tabs.TabPane>
        );
      })}
    </Tabs>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
