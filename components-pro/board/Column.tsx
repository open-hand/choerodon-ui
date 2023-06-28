import React, { FunctionComponent, CSSProperties } from 'react';
import { findDOMNode } from 'react-dom';
import { List } from 'react-virtualized';
import { observer } from 'mobx-react-lite';
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableRubric,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';
import classnames from 'classnames';
import QuoteItem from './QuoteItem';


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
const getRowRender = (quotes: any[], prefixCls: string) => ({ index, style }: RowProps) => {
  const quote: any = quotes[index];

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
    height: Number(style.height) - 8,
  };

  return (
    <Draggable draggableId={String(quote.id)} index={index} key={quote.id}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <QuoteItem
          provided={provided}
          quote={quote}
          isDragging={snapshot.isDragging}
          style={patchedStyle}
          prefixCls={prefixCls}
        />
      )}
    </Draggable>
  );
};


export interface ColumnProps {
  prefixCls: string,
  columnId: string,
  className?: string,
  quotes?: any[],
  header: string,
}

const Column: FunctionComponent<ColumnProps> = function Column(props) {
  const { columnId, quotes, prefixCls, className, header } = props;

  // console.log('quotes', quotes)
  const cls = classnames(
    `${prefixCls}-column-container`,
    {
    },
    className,
  );

  return (
    <div className={cls}>
      <div
        className={`${prefixCls}-column-header`}
      >
        <span>{header}</span>
        <span className={`${prefixCls}-column-header-count`}>
          ({quotes ? quotes.length : 0})
        </span>
      </div>
      <Droppable
        droppableId={columnId}
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
            quote={quotes && quotes[rubric.source.index]}
            style={{ margin: 0 }}
          />
        )}
      >
        {(
          droppableProvided: DroppableProvided,
          snapshot: DroppableStateSnapshot,
        ) => {
          const itemCount: number = quotes ? snapshot.isUsingPlaceholder
            ? quotes.length + 1
            : quotes.length : 0;

          return (
            <List
              className={`${prefixCls}-column-list`}
              height={500}
              rowCount={itemCount}
              rowHeight={122}
              width={332}
              ref={(ref) => {
                // react-virtualized has no way to get the list's ref that I can so
                // So we use the `ReactDOM.findDOMNode(ref)` escape hatch to get the ref
                if (ref) {
                  // eslint-disable-next-line react/no-find-dom-node
                  const whatHasMyLifeComeTo = findDOMNode(ref);
                  if (whatHasMyLifeComeTo instanceof HTMLElement) {
                    droppableProvided.innerRef(whatHasMyLifeComeTo);
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
              rowRenderer={quotes ? getRowRender(quotes, prefixCls) : null}
            />
          );
        }}
      </Droppable>
    </div>
  );
};

Column.displayName = 'Column';

export default observer(Column);