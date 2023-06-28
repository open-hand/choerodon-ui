import React, { Children, cloneElement, FunctionComponent, isValidElement, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import { getHeader } from 'choerodon-ui/pro/lib/table/utils';
import defaultTo from 'lodash/defaultTo';
import Record from '../../../data-set/Record';
import Icon from '../../../icon';
import BoardContext from '../../BoardContext';
import Switch from '../../../switch/Switch';

export interface TreeNodeProps {
  renderer?: (record: Record, provided?: DraggableProvided) => ReactNode;
  record: Record;
  index: number;
  records?: Record[];
  suffix?: (record: Record, index, records: Record[]) => ReactNode;
  className?: string;
  isLeaf?: boolean;
  hidden?: boolean;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  children?: ReactNode;
}

const TreeNode: FunctionComponent<TreeNodeProps> = function TreeNode(props) {
  const { dataSet, prefixCls } = useContext(BoardContext);
  const selfPrefixCls = `${prefixCls}-customization-tree-treenode`;
  const { children, className, isLeaf, hidden, record, provided, snapshot } = props;
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
      return (
        <Icon className={`${selfPrefixCls}-drag-icon`} type="baseline-drag_indicator"  {...iconProps} />
      );
    }
  }

  const header = getHeader({
    name: record.get('name'),
    title: record.get('title'),
    header: record.get('header'),
    dataSet: dataSet!,
  });

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
            <span className={`${selfPrefixCls}-title-text`}>
              <span {...(provided && provided.dragHandleProps)} style={provided ? { cursor: 'move' } : undefined}>
                {toJS(header)}
              </span>
            </span>
            <span className={classNames(`${selfPrefixCls}-switcher`, { [`${selfPrefixCls}-switcher-noop`]: isLeaf })}>
              {renderSwitcherIcon()}
            </span>
          </div>
          <Switch
            record={record}
            disabled={record.get('hideable') === false || (record.parent && record.parent.get('hidden'))}
            name="hidden"
            value={false}
            unCheckedValue
          />
        </div>
      </div>
      {
        true ? (
          <Droppable
            droppableId={`treenode__--__${record.key}`}
            key="treenode"
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
};

TreeNode.displayName = 'TreeNode';

export default observer(TreeNode);
