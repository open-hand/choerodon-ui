import React, { FunctionComponent, useContext, CSSProperties, useMemo, useEffect, useCallback } from 'react';
import { findDOMNode } from 'react-dom';
import { List, AutoSizer } from 'react-virtualized';
import { observer } from 'mobx-react-lite';
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableRubric,
  Draggable,
  Droppable,
  DraggableProps,
} from 'react-beautiful-dnd';
import isFunction from 'lodash/isFunction';
// import noop from 'lodash/noop';
import { Col } from 'choerodon-ui/lib/grid';
import classnames from 'classnames';
import QuoteItem from './QuoteItem';
import DataSet from '../data-set';
import BoardContext from './BoardContext';
import { ViewField } from './enum';
import Button from '../button';
import { FuncType } from '../button/interface';
import { KanbanProps } from './Board';


export const getBackgroundColor = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean,
): string => {
  if (isDraggingOver) {
    return 'rgb(222, 235, 255)';
  }
  if (isDraggingFrom) {
    return "rgb(255, 250, 230)";
  }
  return "white";
};

export const getDraggingStyle = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean,
): object => {
  if (isDraggingOver) {
    return {
      background: 'rgba(8,64,248,0.02)',
      border: '1px dashed #82ACFF',
      borderRadius: '2px',
    };
  }
  if (isDraggingFrom) {
    return {
      background: 'rgba(8,64,248,0.02)',
      border: '1px dashed #82ACFF',
      borderRadius: '2px',
    };
  }
  return {
    background: 'white',
  };
};


type RowProps = {
  index: number,
  style: CSSProperties,
};

// Using a higher order function so that we can look up the quotes data to retrieve
// our quote from within the rowRender function
const getRowRender = (quotes: any, columnId, prefixCls: string, viewProps, listDragging, command, renderCommand, commandsLimit, dataSet, kanbanDS, displayFields, isDragDropDisabled, draggableProps?: DraggableProps) => ({ index, style }: RowProps) => {
  const quote: any = quotes.get(index);
  const isLast = quotes && quotes.length === (index + 1);

  // We are rendering an extra item for the placeholder
  // Do do this we increased our data set size to include one 'fake' item
  if (!quote) {
    return null;
  }

  // Faking some nice spacing around the items
  const patchedStyle = {
    ...style,
    left: Number(style.left) + 8,
    top: Number(style.top) + 8,
    width: `calc(${style.width} - ${8 * 2}px)`,
    height: Number(style.height) - (isLast && !listDragging ? 46 : 8),
  };

  const btnStyle = {
    ...style,
    left: Number(style.left) + 8,
    top: Number(style.top) + Number(style.height) - 28,
    width: `calc(${style.width} - ${8 * 2}px)`,
    maxWidth: 'unset',
    height: 28,
  };

  const restDraggableProps = () => {
    if (isFunction(draggableProps)) {
      return draggableProps({ columnDS: quotes, dataSet });
    }
    return draggableProps;
  }

  return (
    <Draggable draggableId={String(quote.id)} index={index} key={quote.id} isDragDisabled={isDragDropDisabled && true} {...restDraggableProps()}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <>
          <QuoteItem
            command={command}
            renderCommand={renderCommand}
            commandsLimit={commandsLimit}
            provided={provided}
            quote={quote}
            isDragging={snapshot.isDragging}
            style={patchedStyle}
            prefixCls={prefixCls}
            viewProps={viewProps}
            displayFields={displayFields}
            index={index}
            dataSet={quotes}
          // onResize={onResize}
          />
          {(isLast && (kanbanDS.getState(`${columnId}_totalCount`) || quotes.totalCount) > quotes.length) ? (
            <Button
              onClick={async () => {
                await quotes.queryMore(quotes.currentPage + 1, undefined);
                kanbanDS.setState(`${columnId}_totalCount`, undefined);
              }
              }
              style={{
                ...btnStyle,
                maxWidth: 'unset',
              }}
              hidden={listDragging}
              funcType={FuncType.flat}
            >
              加载更多
            </Button>
          ) : null}
        </>
      )}
    </Draggable>
  );
};


export interface KanbanColumnProps {
  prefixCls: string,
  columnId: string,
  className?: string,
  kanbanProps: KanbanProps,
  kanbanDS?: DataSet,
  quotes?: any[],
  header: string,
  groupingBy: string,
  style?: CSSProperties,
}

const KanbanColumn: FunctionComponent<KanbanColumnProps> = function KanbanColumn(props) {
  const { columnId, quotes = [], prefixCls, className, header, style, kanbanProps, kanbanDS, groupingBy } = props;
  const { droppableProps, draggableProps, isDragDropDisabled } = kanbanProps;
  const { displayFields, customizedDS, command, renderCommand, dataSet, commandsLimit } = useContext(BoardContext);
  const viewProps = useMemo(() => customizedDS!.current!.get(ViewField.viewProps) || {}, [customizedDS!.current]);
  const columnDS = useMemo(() => new DataSet({
    ...dataSet!.props,
    queryParameter: {
      [groupingBy]: columnId === '_empty' ? 'null' : columnId,
    },
    data: quotes.slice(),
    autoQuery: false,
    ...kanbanProps.columnDsProps,
  }), [quotes]);

  const headHeight = useMemo(() => {
    return columnDS.getState('__HEADHEIGHT__') || 30;
  }, [columnDS, columnDS.getState('__HEADHEIGHT__'), commandsLimit, command, renderCommand]);
  const defaultRowHeight = useMemo(() => (viewProps[ViewField.displayFields] ? viewProps[ViewField.displayFields].length : 1) * 24 + Math.max(30, headHeight) + 24, [viewProps[ViewField.displayFields] && viewProps[ViewField.displayFields].length, headHeight]);
  const totalCount = useMemo(() => Math.max(kanbanDS!.getState(`${columnId}_totalCount`) || 0, columnDS.totalCount), [columnId, columnDS.totalCount]);


  useEffect(() => {
    if (kanbanDS) {
      kanbanDS.setState(`${columnId.toString().toLocaleUpperCase()}_COLUMNDS`, columnDS);
    }
  }, [kanbanDS, columnDS]);

  const restDroppableProps = useCallback(() => {
    if (isFunction(droppableProps)) {
      return droppableProps({ columnDS, dataSet });
    }
    return droppableProps;
  }, []);

  const cls = classnames(
    `${prefixCls}-column-container`,
    {
    },
    className,
  );

  return (
    <Col span={viewProps[ViewField.cardWidth] || 6} data-key={viewProps[ViewField.displayFields] && viewProps[ViewField.displayFields].length} style={style} className={cls}>
      <div
        className={`${prefixCls}-column-header`}
      >
        <span>{header}</span>
        <span className={`${prefixCls}-column-header-count`}>
          ({columnDS ? totalCount : 0})
        </span>
      </div>
      <Droppable
        droppableId={columnId.toString()}
        mode="virtual"
        renderClone={(
          provided: DraggableProvided,
          snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric,
        ) => (
          <QuoteItem
            prefixCls={prefixCls}
            provided={provided}
            isDragging={snapshot.isDragging}
            quote={columnDS.get(rubric.source.index)}
            style={{ margin: 0 }}
            viewProps={viewProps}
            displayFields={displayFields}
            command={command}
            renderCommand={renderCommand}
            commandsLimit={commandsLimit}
            dataSet={columnDS}
          // onResize={onResize}
          />
        )}
        isDropDisabled={isDragDropDisabled && true}
        {...restDroppableProps()}
      >
        {(
          droppableProvided: DroppableProvided,
          snapshot: DroppableStateSnapshot,
        ) => {
          const itemCount: number = columnDS ? snapshot.isUsingPlaceholder
            ? columnDS.length + 1
            : columnDS.length : 0;

          return (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  className={`${prefixCls}-column-list`}
                  height={viewProps.viewHeight || 366}
                  rowCount={itemCount}
                  rowHeight={({ index }) => (itemCount - 1) === index ? defaultRowHeight + 36 : defaultRowHeight}
                  width={width}
                  ref={(ref) => {
                    // react-virtualized has no way to get the list's ref that I can so
                    // So we use the `ReactDOM.findDOMNode(ref)` escape hatch to get the ref
                    // listRef = ref;
                    if (ref) {
                      ref.recomputeRowHeights();

                      // columnDS.setState('__REF__', ref);
                      // eslint-disable-next-line react/no-find-dom-node
                      const nodeRef = findDOMNode(ref);
                      if (nodeRef instanceof HTMLElement) {
                        droppableProvided.innerRef(nodeRef);
                      }
                    }
                  }}
                  style={getDraggingStyle(snapshot.isDraggingOver, Boolean(snapshot.draggingFromThisWith))}
                  // style={{
                  //   backgroundColor: getBackgroundColor(
                  //     snapshot.isDraggingOver,
                  //     Boolean(snapshot.draggingFromThisWith),
                  //   ),
                  //   transition: 'background-color 0.2s ease',
                  // }}
                  rowRenderer={columnDS ? getRowRender(columnDS, columnId, prefixCls, viewProps, snapshot.isDraggingOver || Boolean(snapshot.draggingFromThisWith), command, renderCommand, commandsLimit, dataSet, kanbanDS, displayFields, isDragDropDisabled, draggableProps) : null}
                />
              )}
            </AutoSizer>
          );
        }}
      </Droppable>
    </Col>
  );
};

KanbanColumn.displayName = 'KanbanColumn';

export default observer(KanbanColumn);