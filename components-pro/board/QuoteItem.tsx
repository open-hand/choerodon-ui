import React, { FunctionComponent, CSSProperties, useMemo, useEffect, useRef } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import ResizeObserver from 'resize-observer-polyfill';
import { observer } from 'mobx-react-lite'
import noop from 'lodash/noop';
import CardCommand from './CardCommand';
import DataSet from '../data-set';
import { ViewMode } from './enum';
import Typography from '../typography';
import Output from '../output';

type QuoteItemProps = {
  quote: any,
  command?: any,
  renderCommand?: any,
  isDragging: boolean,
  provided: DraggableProvided,
  isClone?: boolean,
  isGroupedOver?: boolean,
  style?: Object,
  index?: number,
  commandsLimit?: number,
  prefixCls: string,
  viewProps?: any,
  dataSet?: DataSet,
  displayFields?: any,
  onResize?: Function,
};


function getStyle(provided: DraggableProvided, style?: CSSProperties) {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  };
}

// Previously this extended React.Component
// That was a good thing, because using React.PureComponent can hide
// issues with the selectors. However, moving it over does can considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent
const QuoteItem: FunctionComponent<QuoteItemProps> = function QuoteItem(props) {
  const {
    quote,
    isDragging,
    provided,
    style,
    index,
    prefixCls,
    viewProps,
    command,
    renderCommand = ({ command }) => command,
    dataSet,
    displayFields: columns,
    commandsLimit,
  } = props;

  const displayFields = useMemo(() => viewProps.displayFields, [viewProps.displayFields]);
  const firstDisplayFields = useMemo(() => columns.find(df => df.name === displayFields[0]), [columns]);
  const extraRef = useRef<any>(null);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        // 更新高度
        dataSet!.setState('__HEADHEIGHT__', entry.contentRect.height);
      }
    });

    if (extraRef.current) {
      observer.observe(extraRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        className={`${prefixCls}-quote-container`}
        // isDragging={isDragging}
        // isGroupedOver={isGroupedOver}
        // isClone={isClone}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getStyle(provided, style)}
        data-is-dragging={isDragging}
        data-testid={quote.id}
        data-index={index}
      // aria-label={`${quote.author.name} quote ${quote.content}`}
      >
        <div className={`${prefixCls}-quote-head-wrapper`} ref={extraRef}>
          {displayFields && displayFields.length ?
            (<p>
              <Typography.Paragraph
                ellipsis={{ rows: 2, tooltip: <Output name={displayFields[0]} record={quote} renderer={firstDisplayFields ? firstDisplayFields.renderer : noop} /> }}
                record={quote}
                name={displayFields[0]}
                renderer={firstDisplayFields ? firstDisplayFields.renderer : noop}
              />
            </p>)
            : <span className={`${prefixCls}-quote-content-label`}>请配置显示字段</span>}
          <CardCommand
            command={command}
            viewMode={ViewMode.kanban}
            dataSet={dataSet!}
            record={quote}
            renderCommand={renderCommand}
            prefixCls={prefixCls}
            commandsLimit={commandsLimit}
          />
        </div>
        {/* {isClone ? <div className="clone-badge">Clone</div> : null} */}
        <div className={`${prefixCls}-quote-content`}>
          {displayFields ? displayFields.map(fieldName => (
            <div key={`${fieldName}-item`} className={`${prefixCls}-quote-content-item`}>
              <span className={`${prefixCls}-quote-content-label`} hidden={!viewProps.showLabel}>
                {quote.getField(fieldName).get('label')}
              </span>
              <Typography.Text ellipsis={{ tooltip: true }} record={quote} name={fieldName} renderer={columns.find(df => df.name === fieldName) ? columns.find(df => df.name === fieldName).renderer : noop} />
            </div>
          )) : null}
        </div>
      </div>
      {/* {isLast ? <Button style={getStyle(provided, style)} funcType={FuncType.flat}>加载更多</Button> : null} */}
    </>
  );
}

QuoteItem.displayName = 'QuoteItem';

export default observer(QuoteItem);