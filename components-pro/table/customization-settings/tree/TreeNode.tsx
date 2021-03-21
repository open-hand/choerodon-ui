import React, { Children, cloneElement, FunctionComponent, isValidElement, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import defaultTo from 'lodash/defaultTo';
import isFunction from 'lodash/isFunction';
import Record from '../../../data-set/Record';
import Icon from '../../../icon';
import TableContext from '../../TableContext';

export interface TreeNodeProps {
  renderer: (record: Record, provided?: DraggableProvided) => ReactNode;
  record: Record;
  index: number;
  records: Record[];
  suffix: (record: Record, index, records: Record[]) => ReactNode;
  className?: string;
  isLeaf?: boolean;
  hidden?: boolean;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  children?: ReactNode;
}

const TreeNode: FunctionComponent<TreeNodeProps> = observer((props) => {
  const { tableStore: { dataSet, prefixCls, columnDraggable, props: { columnsDragRender = {} } } } = useContext(TableContext);
  const { droppableProps, renderClone, renderIcon } = columnsDragRender;
  const selfPrefixCls = `${prefixCls}-customization-tree-treenode`;
  const { renderer, suffix, children, className, isLeaf, hidden, record, index, records, provided, snapshot } = props;
  const sort = record.get('sort');
  const isExpanded = defaultTo(record.getState('expanded'), true);
  const [expended, setExpanded] = useState(isExpanded);
  const [isHover, setIsHover] = useState(false);
  const toggleExpanded = useCallback(() => {
    record.setState('expanded', !isExpanded);
    if (!expended) {
      setExpanded(true);
    }
  }, [record, isExpanded, expended]);
  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);
  const { isDragging } = snapshot || {};

  useEffect(() => {
    setIsHover(false);
  }, [sort]);

  function renderSwitcherIcon() {
    return !isLeaf && (
      <Icon
        type="expand_more"
        className={classNames(`${selfPrefixCls}-switcher-icon`, { [`${selfPrefixCls}-switcher-icon-close`]: !isExpanded })}
        onClick={toggleExpanded}
      />
    );
  }

  function renderChildren() {
    return Children.map(children, child => isValidElement(child) ? cloneElement(child, {
      hidden: hidden || !isExpanded,
    }) : child);
  }

  function getIcon() {
    if (provided) {
      const iconProps = { ...provided.dragHandleProps, style: { cursor: 'move' } };
      if (isFunction(renderIcon)) {
        const icon = renderIcon({ dataSet, column: record.toData(), snapshot });
        if (isValidElement(icon)) {
          return cloneElement(icon, iconProps);
        }
        return icon;
      }
      return (
        <Icon className={`${selfPrefixCls}-drag-icon`} type="baseline-drag_indicator"  {...iconProps} />
      );
    }
  }

  return (
    <div
      ref={provided && provided.innerRef}
      {...(provided && provided.draggableProps)}
      className={classNames({ [`${selfPrefixCls}-dragging`]: isDragging })}
    >
      <div
        className={classNames(selfPrefixCls, className, { [`${selfPrefixCls}-hover`]: isHover })}
        style={{ display: hidden ? 'none' : '' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`${selfPrefixCls}-content`}>
          {getIcon()}
          <div className={`${selfPrefixCls}-title`}>
            {renderer(record, provided)}
            <span className={classNames(`${selfPrefixCls}-switcher`, { [`${selfPrefixCls}-switcher-noop`]: isLeaf })}>
              {renderSwitcherIcon()}
            </span>
          </div>
          {suffix(record, index, records)}
        </div>
      </div>
      {
        columnDraggable ? (
          <Droppable
            droppableId={`treenode__--__${record.key}`}
            key="treenode"
            renderClone={renderClone}
            {...droppableProps}
          >
            {
              (droppableProvided: DroppableProvided) => (
                <div
                  style={{ paddingLeft: 15 }}
                  ref={droppableProvided && droppableProvided.innerRef}
                  {...(droppableProvided && droppableProvided.droppableProps)}
                >
                  {expended && renderChildren()}
                  {droppableProvided && droppableProvided.placeholder}
                </div>
              )
            }
          </Droppable>
        ) : (
          <div style={{ paddingLeft: 15 }}>
            {expended && renderChildren()}
          </div>
        )
      }

    </div>
  );
});

TreeNode.displayName = 'TreeNode';

export default TreeNode;
