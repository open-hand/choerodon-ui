import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import TableContext from '../../TableContext';

export interface TreeProps {
  value?: any;
  children?: ReactNode;
}

const Tree: FunctionComponent<TreeProps> = function Tree(props) {
  const { children, value } = props;
  const { prefixCls, columnsDragRender = {}, tableStore: { columnDraggable } } = useContext(TableContext);
  const { droppableProps, renderClone } = columnsDragRender;
  return columnDraggable ? (
    <Droppable
      droppableId={`tree__--__${value}`}
      key="tree"
      renderClone={renderClone ? (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
        rubric: DraggableRubric,
      ) => renderClone({ provided, snapshot, rubric }) : undefined}
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
};

Tree.displayName = 'Tree';

export default observer(Tree);
