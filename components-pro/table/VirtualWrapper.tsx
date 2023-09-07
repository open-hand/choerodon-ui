import React, { CSSProperties, FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Spin from '../spin';
import TableContext from './TableContext';
import { toTransformValue } from '../_util/transform';
import mergeProps from '../_util/mergeProps';
import { isStickySupport } from './utils';
import { instance } from './Table';
import TableStore from './TableStore';
import DataSet from '../data-set/DataSet';
import { useRenderClone } from './hooks';

export interface VirtualWrapperProps {
  children: (snapshot?: DroppableStateSnapshot, dragRowHeight ?: number) => ReactNode;
}

function getRowHeight(tableStore: TableStore, dataSet: DataSet, draggableId: string): number {
  const { rowMetaData } = tableStore;
  if (rowMetaData) {
    const record = dataSet.find(r => String(r.key) === String(draggableId));
    if (record) {
      const metaData = rowMetaData.find(meta => meta.record === record);
      if (metaData) {
        return metaData.height;
      }
    }
  }
  return tableStore.virtualRowHeight;
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = function VirtualWrapper(props) {
  const { children } = props;
  const { tableStore, prefixCls, virtualSpin, spinProps, isTree, rowDragRender, dataSet } = useContext(TableContext);
  const { virtualTop, virtualHeight, scrolling = false, multiTableRowDraggable } = tableStore;
  const [height, setHeight] = useState(virtualHeight);
  useEffect(action(() => {
    if (virtualHeight !== height) {
      const { lastScrollTop, node: { tableBodyWrap } } = tableStore;
      if (lastScrollTop && tableBodyWrap) {
        const scrollTop = Math.max(0, virtualHeight - height + lastScrollTop);
        if (scrollTop === tableBodyWrap.scrollTop) {
          tableStore.setLastScrollTop(scrollTop);
        } else {
          tableBodyWrap.scrollTop = scrollTop;
        }
      }
      setHeight(virtualHeight);
    }
  }), [virtualHeight, height, tableStore]);
  useEffect(() => {
    const { lastScrollTop, node: { tableBodyWrap } } = tableStore;
    if (lastScrollTop) {
      tableStore.setLastScrollTop(tableBodyWrap ? tableBodyWrap.scrollTop : 0);
    }
  }, [tableStore]);

  const getBody = (droppableProvided?: DroppableProvided, droppableSnapshot?: DroppableStateSnapshot) => {
    const wrapperStyle: CSSProperties = { height: pxToRem(virtualHeight, true)! };
    const style: CSSProperties = {};
    if (scrolling) {
      wrapperStyle.pointerEvents = 'none';
    }
    const dragRowHeight = droppableSnapshot && droppableSnapshot.draggingFromThisWith ? getRowHeight(tableStore, dataSet, droppableSnapshot.draggingFromThisWith) : undefined;
    const top = dragRowHeight ? virtualTop + dragRowHeight : virtualTop;
    if (isStickySupport() && tableStore.hasRowGroups) {
      wrapperStyle.paddingTop = pxToRem(top, true)!;
      style.position = 'relative';
    } else {
      style.transform = toTransformValue({ translateY: pxToRem(top, true) });
    }
    return (
      <div
        className={`${prefixCls}-tbody-wrapper`}
        style={wrapperStyle}
        ref={droppableProvided && droppableProvided.innerRef}
        {...(droppableProvided && droppableProvided.droppableProps)}
      >
        <div
          style={style}
        >
          {children(droppableSnapshot, dragRowHeight)}
        </div>
      </div>
    );
  };
  const renderClone = useRenderClone();
  const content = tableStore.rowDraggable ? (
    <Droppable
      droppableId={multiTableRowDraggable ? tableStore.node.code : "table"}
      key="table"
      isCombineEnabled={isTree}
      mode="virtual"
      renderClone={renderClone}
      getContainerForClone={() => instance(tableStore.node.getClassName(), prefixCls).tbody as React.ReactElement<HTMLElement>}
      {...(rowDragRender && rowDragRender.droppableProps)}
    >
      {getBody}
    </Droppable>
  ) : getBody();

  return (
    <>
      {content}
      {
        virtualSpin && scrolling && (
          <Spin
            {
              ...mergeProps(omit(spinProps, ['dataSet']), {
                spinning: true,
                style: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: pxToRem(tableStore.lastScrollTop, true)!,
                  transform: toTransformValue({ translate: '-50% -50%' }),
                },
              })
            }
          />
        )
      }
    </>
  );
};

VirtualWrapper.displayName = 'VirtualWrapper';

export default observer(VirtualWrapper);
