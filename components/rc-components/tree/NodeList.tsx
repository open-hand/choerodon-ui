/**
 * Handle virtual list of the TreeNodes.
 */

import * as React from 'react';
import omit from 'lodash/omit';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { DataEntity, DataNode, FlattenNode, Key, ScrollTo } from './interface';
import MotionTreeNode, { MotionTreeNodeProps } from './MotionTreeNode';
import { findExpandedKeys, getExpandRange } from './utils/diffUtil';
import { getKey, getTreeNodeProps, TreeNodeRequiredProps } from './utils/treeUtil';
import List from './List';

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
};

const noop = () => {/* noop */};

export const MOTION_KEY = `RC_TREE_MOTION_${Math.random()}`;

const MotionNode: DataNode = {
  key: MOTION_KEY,
};

export const MotionEntity: DataEntity = {
  key: MOTION_KEY,
  level: 0,
  index: 0,
  pos: '0',
  node: MotionNode,
};

const MotionFlattenData: FlattenNode = {
  parent: null,
  children: [],
  pos: MotionEntity.pos,
  data: MotionNode,
  /** Hold empty list here since we do not use it */
  isStart: [],
  isEnd: [],
};

export interface NodeListRef {
  scrollTo: ScrollTo;
  getIndentWidth: () => number;
}

interface NodeListProps {
  prefixCls: string;
  style?: React.CSSProperties;
  data: FlattenNode[];
  motion: any;
  focusable?: boolean;
  activeItem: FlattenNode | null;
  focused?: boolean;
  tabIndex: number;
  checkable?: boolean;
  selectable?: boolean;
  disabled?: boolean;

  expandedKeys: Key[];
  selectedKeys: Key[];
  checkedKeys: Key[];
  loadedKeys: Key[];
  loadingKeys: Key[];
  halfCheckedKeys: Key[];
  keyEntities: Record<Key, DataEntity>;

  dragging: boolean;
  dragOverNodeKey: Key | null;
  dropPosition: number | null;

  // Virtual list
  height?: number;
  itemHeight?: number;
  virtual?: boolean;

  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onActiveChange: (key: Key | null) => void;

  onListChangeStart: () => void;
  onListChangeEnd: () => void;
}

/**
 * We only need get visible content items to play the animation.
 */
export function getMinimumRangeTransitionRange(
  list: FlattenNode[],
  virtual: boolean | undefined,
  height: number,
  itemHeight: number,
) {
  if (virtual === false || !height) {
    return list;
  }

  return list.slice(0, Math.ceil(height / itemHeight) + 1);
}

function itemKey(item: FlattenNode) {
  const {
    data: { key },
    pos,
  } = item;
  return getKey(key, pos);
}

function getAccessibilityPath(item: FlattenNode): string {
  let path = String(item.data.key);
  let current = item;

  while (current.parent) {
    current = current.parent;
    path = `${current.data.key} > ${path}`;
  }

  return path;
}

const RefNodeList: React.RefForwardingComponent<NodeListRef, NodeListProps> = (props, ref) => {
  const {
    prefixCls,
    data,
    expandedKeys,
    selectedKeys,
    checkedKeys,
    loadedKeys,
    loadingKeys,
    halfCheckedKeys,
    keyEntities,
    disabled,

    dragging,
    dragOverNodeKey,
    dropPosition,
    motion,

    height,
    itemHeight,
    virtual,

    focusable,
    activeItem,
    focused,
    tabIndex,

    onKeyDown,
    onFocus,
    onBlur,
    onActiveChange,

    onListChangeStart,
    onListChangeEnd,

    selectable,
    ...domProps
  } = props;

  // =============================== Ref ================================
  const listRef = React.useRef<ListRef>(null);
  const indentMeasurerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => ({
    scrollTo: scroll => {
      const { current } = listRef;
      if (current) {
        current.scrollTo(scroll);
      }
    },
    getIndentWidth: () => indentMeasurerRef.current ? indentMeasurerRef.current.offsetWidth : 0,
  }));

  // ============================== Motion ==============================
  const [prevExpandedKeys, setPrevExpandedKeys] = React.useState(expandedKeys);
  const [prevData, setPrevData] = React.useState(data);
  const [transitionData, setTransitionData] = React.useState(data);
  const [transitionRange, setTransitionRange] = React.useState<FlattenNode[]>([]);
  const [motionType, setMotionType] = React.useState<'show' | 'hide' | null>(null);

  const onMotionEnd = () => {
    setPrevData(data);
    setTransitionData(data);
    setTransitionRange([]);
    setMotionType(null);

    onListChangeEnd();
  }

  // Do animation if expanded keys changed
  React.useEffect(() => {
    setPrevExpandedKeys(expandedKeys);

    const diffExpanded = findExpandedKeys(prevExpandedKeys, expandedKeys);

    if (diffExpanded.key !== null) {
      if (diffExpanded.add) {
        const keyIndex = prevData.findIndex(({ data: { key } }) => key === diffExpanded.key);

        const rangeNodes = getMinimumRangeTransitionRange(
          getExpandRange(prevData, data, diffExpanded.key!),
          virtual,
          height!,
          itemHeight!,
        );

        const newTransitionData: FlattenNode[] = prevData.slice();
        newTransitionData.splice(keyIndex + 1, 0, MotionFlattenData);

        setTransitionData(newTransitionData);
        setTransitionRange(rangeNodes);
        setMotionType('show');
      } else {
        const keyIndex = data.findIndex(({ data: { key } }) => key === diffExpanded.key);

        const rangeNodes = getMinimumRangeTransitionRange(
          getExpandRange(data, prevData, diffExpanded.key!),
          virtual,
          height!,
          itemHeight!,
        );

        const newTransitionData: FlattenNode[] = data.slice();
        newTransitionData.splice(keyIndex + 1, 0, MotionFlattenData);

        setTransitionData(newTransitionData);
        setTransitionRange(rangeNodes);
        setMotionType('hide');
      }
    } else if (prevData !== data) {
      // If whole data changed, we just refresh the list
      setPrevData(data);
      setTransitionData(data);
    }
  }, [expandedKeys, data]);

  // We should clean up motion if is changed by dragging
  React.useEffect(() => {
    if (!dragging) {
      onMotionEnd();
    }
  }, [dragging]);

  const mergedData = motion ? transitionData : data;

  const treeNodeRequiredProps: TreeNodeRequiredProps = React.useMemo(() => ({
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  }), [
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  ]) as TreeNodeRequiredProps;

  const renderFunction = React.useCallback((treeNode: FlattenNode): React.ReactElement<MotionTreeNodeProps> => {
    const {
      pos,
      data: { key, ...restProps },
      isStart,
      isEnd,
    } = treeNode;
    const mergedKey = getKey(key, pos);
    delete restProps.children;

    // When the tree property selectable is false, the title cannot be selected.
    // Clicking on the title triggers the onCheck event, and the ds associated record triggers the select event
    if (selectable === false) {
      restProps.selectable = selectable;
    }

    const treeNodeProps = getTreeNodeProps(mergedKey, treeNodeRequiredProps);

    return (
      <MotionTreeNode
        {...restProps}
        {...treeNodeProps}
        active={!!activeItem && key === activeItem.data.key}
        pos={pos}
        data={treeNode.data}
        isStart={isStart}
        isEnd={isEnd}
        motion={motion}
        motionNodes={key === MOTION_KEY ? transitionRange : null}
        motionType={motionType}
        onMotionStart={onListChangeStart}
        onMotionEnd={onMotionEnd}
        treeNodeRequiredProps={treeNodeRequiredProps}
        onMouseMove={() => {
          onActiveChange(null);
        }}
      />
    );
  }, [treeNodeRequiredProps, activeItem]);

  return (
    <>
      {focused && activeItem && (
        <span style={HIDDEN_STYLE} aria-live="assertive">
          {getAccessibilityPath(activeItem)}
        </span>
      )}

      <div role="tree">
        <input
          style={HIDDEN_STYLE}
          disabled={focusable === false || disabled}
          tabIndex={focusable !== false ? tabIndex : undefined}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          value=""
          onChange={noop}
        />
      </div>

      <div
        className={`${prefixCls}-treenode`}
        aria-hidden
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          visibility: 'hidden',
          height: 0,
          overflow: 'hidden',
        }}
      >
        <div className={`${prefixCls}-indent`}>
          <div ref={indentMeasurerRef} className={`${prefixCls}-indent-unit`} />
        </div>
      </div>
      {
        virtual === false ? (
          <List ref={listRef} data={mergedData || []} prefixCls={`${prefixCls}-list`} height={height} itemKey={itemKey}>
            {renderFunction}
          </List>
        ) : (
          <VirtualList<FlattenNode>
            {...omit(domProps, ['selectable', 'checkable'])}
            data={mergedData}
            itemKey={itemKey}
            height={height}
            fullHeight={false}
            virtual={virtual}
            itemHeight={itemHeight}
            prefixCls={`${prefixCls}-list`}
            ref={listRef}
          >
            {renderFunction}
          </VirtualList>
        )
      }
    </>
  );
};

const NodeList = React.forwardRef(RefNodeList);
NodeList.displayName = 'NodeList';

export default NodeList;
