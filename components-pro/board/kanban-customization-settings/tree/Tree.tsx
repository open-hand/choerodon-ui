import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Droppable, DroppableProvided } from 'react-beautiful-dnd';
import BoardContext from '../../BoardContext';

export interface TreeProps {
  value?: any;
  children?: ReactNode;
}

const Tree: FunctionComponent<TreeProps> = function Tree(props) {
  const { children } = props;
  const { prefixCls } = useContext(BoardContext);
  // const { droppableProps, renderClone } = columnsDragRender;
  return true ? (
    <Droppable
      droppableId="tree__--__fields"
      key="tree"
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
