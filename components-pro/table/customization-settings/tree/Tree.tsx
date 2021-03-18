import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Droppable, DroppableProvided } from 'react-beautiful-dnd';
import TableContext from '../../TableContext';

export interface TreeProps {
  value?: any;
  children?: ReactNode
}

const Tree: FunctionComponent<TreeProps> = observer((props) => {
  const { children, value } = props;
  const { tableStore: { prefixCls, columnDraggable, props: { columnsDragRender = {} } } } = useContext(TableContext);
  const { droppableProps, renderClone } = columnsDragRender;
  return columnDraggable ? (
    <Droppable
      droppableId={`tree__--__${value}`}
      key="tree"
      renderClone={renderClone}
      {...droppableProps}
    >
      {
        (droppableProvided: DroppableProvided) => (
          <div
            ref={droppableProvided.innerRef}
            className={`${prefixCls}-customization-tree`}
            {...(droppableProvided && droppableProvided.droppableProps)}
          >
            {children}
            {droppableProvided && droppableProvided.placeholder}
          </div>
        )
      }
    </Droppable>
  ) : (
    <div
      className={`${prefixCls}-customization-tree`}
    >
      {children}
    </div>
  );
});

Tree.displayName = 'Tree';

export default Tree;
