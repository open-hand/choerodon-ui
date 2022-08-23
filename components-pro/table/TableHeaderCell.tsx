import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  isValidElement,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import raf from 'raf';
import omit from 'lodash/omit';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { IconProps } from 'choerodon-ui/lib/icon';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { minColumnWidth } from './Column';
import TableContext from './TableContext';
import Icon from '../icon';
import EventManager, { stopEvent } from '../_util/EventManager';
import { getColumnLock, getHeader, getMaxClientWidth, isStickySupport } from './utils';
import { ColumnAlign, ColumnLock, TableColumnResizeTriggerType, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';
import transform from '../_util/transform';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import { CUSTOMIZED_KEY } from './TableStore';
import ColumnGroup from './ColumnGroup';
import { AggregationTreeProps, groupedAggregationTree } from './AggregationTree';
import TableCellInner from './TableCellInner';
import { TableVirtualHeaderCellProps } from './TableVirtualHeaderCell';

export interface TableHeaderCellProps extends TableVirtualHeaderCellProps {
  intersectionRef?: (node?: Element | null) => void;
}

const TableHeaderCell: FunctionComponent<TableHeaderCellProps> = function TableHeaderCell(props) {
  const {
    columnGroup,
    rowSpan,
    colSpan,
    className,
    rowIndex,
    getHeaderNode = noop,
    scope,
    children: expandIcon,
    isSearchCell,
    intersectionRef,
  } = props;
  const { column, key, prev } = columnGroup;
  const { tooltipProps } = column;
  const { rowHeight, border, prefixCls, tableStore, dataSet, aggregation, autoMaxWidth } = useContext(TableContext);
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const { columnResizable, headerRowHeight } = tableStore;
  const {
    headerClassName,
    headerStyle = {},
    name,
    align,
    children,
    command,
    lock,
  } = column;
  const field = dataSet.getField(name);
  const aggregationTree = useMemo((): ReactElement<AggregationTreeProps>[] | undefined => {
    if (aggregation) {
      const { column: $column, headerGroup } = columnGroup;
      if (headerGroup) {
        const { tableGroup } = columnGroup;
        if (tableGroup) {
          const { columnProps } = tableGroup;
          const { totalRecords } = headerGroup;
          if (columnProps && totalRecords.length) {
            const { children } = columnProps;
            if (children && children.length) {
              const renderer = ({ colGroup, style }) => {
                return (
                  <TableCellInner
                    record={totalRecords[0]}
                    column={colGroup.column}
                    style={style}
                    inAggregation
                  />
                );
              };
              return groupedAggregationTree({
                columns: children,
                headerGroup,
                column: { ...$column, ...columnProps },
                renderer,
              });
            }
          }
        }
      }
    }
  }, [columnGroup, aggregation]);
  const header = getHeader({ ...column, dataSet, aggregation, group: columnGroup.headerGroup, groups: columnGroup.headerGroups, aggregationTree });
  const globalRef = useRef<{
    bodyLeft: number;
    resizeBoundary: number;
    resizePosition?: number | undefined;
    resizeColumnGroup?: ColumnGroup | undefined;
    tooltipShown?: boolean | undefined;
  }>({
    bodyLeft: 0,
    resizeBoundary: 0,
  });
  const resizeEvent: EventManager = useMemo(() => new EventManager(), []);

  const setSplitLineHidden = useCallback((hidden: boolean) => {
    const {
      node: { resizeLine },
    } = tableStore;
    if (resizeLine) {
      resizeLine.style.display = hidden ? 'none' : 'block';
    }
  }, [tableStore]);

  const setSplitLinePosition = useCallback(action<(left: number) => number | undefined>((left) => {
    const {
      node: { resizeLine },
    } = tableStore;
    const { bodyLeft } = globalRef.current;
    left -= bodyLeft;
    if (left < 0) {
      left = 0;
    }
    if (resizeLine) {
      transform(`translateX(${pxToRem(left, true) || 0})`, resizeLine.style);
    }
    return left + bodyLeft;
  }), [tableStore, globalRef]);

  const resize = useCallback((e): void => {
    const { current } = globalRef;
    const { resizeColumnGroup } = current;
    if (resizeColumnGroup) {
      const limit = current.resizeBoundary + minColumnWidth(resizeColumnGroup.column, tableStore);
      let left = e.touches ? e.touches[0].clientX : e.clientX;
      if (left < limit) {
        left = limit;
      }
      current.resizePosition = setSplitLinePosition(left);
    }
  }, [globalRef, setSplitLinePosition]);

  const resizeEnd = useCallback(action<() => void>(() => {
    tableStore.columnResizing = false;
    setSplitLineHidden(true);
    resizeEvent
      .removeEventListener('mousemove')
      .removeEventListener('touchmove')
      .removeEventListener('mouseup')
      .removeEventListener('touchend');
    const { node: { tableBodyWrap } } = tableStore;
    if (tableBodyWrap) {
      tableBodyWrap.removeEventListener('scroll', stopEvent);
    }
    const { resizePosition, resizeColumnGroup } = globalRef.current;
    if (resizePosition !== undefined && resizeColumnGroup) {
      const { column: resizeColumn } = resizeColumnGroup;
      const newWidth = Math.round(Math.max(resizePosition - globalRef.current.resizeBoundary, minColumnWidth(resizeColumn, tableStore)));
      if (newWidth !== resizeColumn.width) {
        const { width } = resizeColumn;
        let group: ColumnGroup | undefined = resizeColumnGroup;
        const { node: { element } } = tableStore;
        while (group) {
          const { column: col } = group;
          if (col.width === undefined) {
            const th = element.querySelector(`.${prefixCls}-thead .${prefixCls}-cell[data-index="${col.name}"]`);
            if (th) {
              tableStore.setColumnWidth(group, th.offsetWidth);
            }
          }
          group = group.prev;
        }
        if (width === undefined) {
          raf(() => {
            tableStore.setColumnWidth(resizeColumnGroup, newWidth);
          });
        } else {
          tableStore.setColumnWidth(resizeColumnGroup, newWidth);
        }
      }
    }
  }), [globalRef, tableStore, setSplitLineHidden, resizeEvent]);

  const resizeStart = useCallback(action<(e) => void>((e) => {
    tableStore.columnResizing = true;
    delete globalRef.current.resizePosition;
    setSplitLineHidden(false);
    const { node: { element, tableBodyWrap }, tableColumnResizeTrigger } = tableStore;
    if (tableColumnResizeTrigger !== TableColumnResizeTriggerType.hover) {
      const left = Math.round(element.getBoundingClientRect().left);
      globalRef.current.bodyLeft = border ? left + 1 : left;
    }
    setSplitLinePosition(e.clientX);
    resizeEvent
      .setTarget(element.ownerDocument)
      .addEventListener('mousemove', resize)
      .addEventListener('touchmove', resize)
      .addEventListener('mouseup', resizeEnd)
      .addEventListener('touchend', resizeEnd);
    e.stopPropagation();
    if (tableBodyWrap) {
      tableBodyWrap.addEventListener('scroll', stopEvent, { passive: true });
    }
  }), [tableStore, globalRef, setSplitLineHidden, setSplitLinePosition, resizeEvent]);

  const delayResizeStart = useCallback(debounce(
    resizeStart,
    300,
    {
      leading: true,
      trailing: false,
    },
  ), [resizeStart]);

  const prevColumnGroup: ColumnGroup | undefined = columnResizable ? prev && prev.lastLeaf : undefined;

  const currentColumnGroup: ColumnGroup | undefined = columnResizable ? columnGroup.lastLeaf : undefined;

  const handleClick = useCallback(() => {
    if (name) {
      dataSet.sort(name);
    }
  }, [dataSet, name]);

  const handleMouseEnter = useCallback((e) => {
    const tooltip = tableStore.getColumnTooltip(column);
    const { currentTarget } = e;
    if (!tableStore.columnResizing && (tooltip === TableColumnTooltip.always || (tooltip === TableColumnTooltip.overflow && isOverflow(currentTarget)))) {
      const tooltipConfig: TooltipProps = isObject(tooltipProps) ? tooltipProps : {};
      show(currentTarget, {
        title: header,
        placement: getTooltipPlacement('table-cell') || 'right',
        theme: getTooltipTheme('table-cell'),
        ...tooltipConfig,
      });
      globalRef.current.tooltipShown = true;
    }
  }, [tableStore, column, globalRef, getTooltipTheme, getTooltipPlacement]);

  const handleMouseLeave = useCallback(() => {
    if (globalRef.current.tooltipShown) {
      hide();
      delete globalRef.current.tooltipShown;
    }
  }, [globalRef]);

  const setResizeGroup = useCallback((group: ColumnGroup) => {
    globalRef.current.resizeColumnGroup = group;
    const headerDom: Element | null = getHeaderNode();
    const node = headerDom && headerDom.querySelector(`[data-index="${group.key}"]`);
    if (node) {
      globalRef.current.resizeBoundary = Math.round(node.getBoundingClientRect().left);
    }
  }, [globalRef, getHeaderNode]);

  const handleLeftResize = useCallback((e) => {
    if (prevColumnGroup) {
      setResizeGroup(prevColumnGroup);
      if (autoMaxWidth) {
        e.persist();
        delayResizeStart(e);
      } else {
        resizeStart(e);
      }
    }
  }, [prevColumnGroup, setResizeGroup, autoMaxWidth, delayResizeStart, resizeStart]);

  const handleRightResize = useCallback((e) => {
    if (currentColumnGroup) {
      setResizeGroup(currentColumnGroup);
      if (autoMaxWidth) {
        e.persist();
        delayResizeStart(e);
      } else {
        resizeStart(e);
      }
    }
  }, [currentColumnGroup, setResizeGroup, autoMaxWidth, delayResizeStart, resizeStart]);

  const showSplitLine = useCallback((e, type) => {
    const { columnResizing } = tableStore;
    if (columnResizing) return;
    setSplitLineHidden(false);
    const { node: { element } } = tableStore;
    const left = Math.round(element.getBoundingClientRect().left);
    const rect = e.target.getBoundingClientRect();
    const width = Math.round(rect.width);
    const resizerLeft = Math.round(rect.left);
    const newLeft = resizerLeft + (type === 'pre' ? 0 : width);
    globalRef.current.bodyLeft = border ? left + 1 : left;
    setSplitLinePosition(newLeft);
  }, []);

  const delayShowSplitLine = useCallback(debounce(showSplitLine, 300, { leading: true, trailing: false }), []);

  const handleShowSplitLine = useCallback((e, type) => {
    const { tableColumnResizeTrigger } = tableStore;
    if (tableColumnResizeTrigger !== TableColumnResizeTriggerType.hover) return;
    e.persist();
    delayShowSplitLine(e, type);
  }, []);

  const handleHideSplitLine = useCallback(() => {
    const { tableColumnResizeTrigger } = tableStore;
    if (tableColumnResizeTrigger !== TableColumnResizeTriggerType.hover) return;
    const { columnResizing } = tableStore;
    if (columnResizing) return;
    setSplitLineHidden(true);
  }, []);

  const resizeDoubleClick = useCallback(action((): void => {
    const { resizeColumnGroup } = globalRef.current;
    if (resizeColumnGroup) {
      const { column: col } = resizeColumnGroup;
      const { node: { element } } = tableStore;
      const maxWidth = Math.max(
        ...[
          ...element.querySelectorAll(`[data-index="${resizeColumnGroup.key}"] > .${prefixCls}-cell-inner`),
        ].map((node) => node.parentNode.offsetWidth + getMaxClientWidth(node) - node.clientWidth + 1),
        minColumnWidth(col, tableStore),
        col.width ? col.width : 0,
      );
      if (maxWidth !== col.width) {
        tableStore.setColumnWidth(resizeColumnGroup, maxWidth);
      } else if (col.minWidth) {
        tableStore.setColumnWidth(resizeColumnGroup, col.minWidth);
      }
    }
  }), [globalRef, prefixCls, tableStore]);

  const handleLeftDoubleClick = useCallback(() => {
    resizeDoubleClick();
  }, [delayResizeStart, resizeDoubleClick]);

  const handleRightDoubleClick = useCallback(() => {
    resizeDoubleClick();
  }, [delayResizeStart, resizeDoubleClick]);

  const renderResizer = () => {
    const { rightColumnGroups: { columns }, overflowX } = tableStore;
    const { columnGroup } = props;
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const pre = prevColumnGroup && prevColumnGroup.column.resizable && (
      <div
        key="pre"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-left`}
        onDoubleClick={autoMaxWidth ? handleLeftDoubleClick : undefined}
        onPointerDown={handleLeftResize}
        onMouseEnter={(e) => handleShowSplitLine(e, 'pre')}
        onMouseLeave={handleHideSplitLine}
      />
    );
    const next = currentColumnGroup && currentColumnGroup.column.resizable && (
      <div
        key="next"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-right`}
        onDoubleClick={autoMaxWidth ? handleRightDoubleClick : undefined}
        onPointerDown={handleRightResize}
        onMouseEnter={(e) => handleShowSplitLine(e, 'next')}
        onMouseLeave={handleHideSplitLine}
      />
    );
    if (columns.length && overflowX && columns[0].key === columnGroup.key) return next;
    return [pre, next];
  };

  const getHelpIcon = () => {
    if (column.showHelp !== ShowHelp.none && !isSearchCell) {

      const fieldHelp = defaultTo(column.help, field && field.get('help'));
      if (fieldHelp) {
        return (
          <Tooltip
            title={fieldHelp}
            placement={getTooltipPlacement('help')}
            theme={getTooltipTheme('help')}
            key="help"
          >
            <span className={`${prefixCls}-help-icon`} />
          </Tooltip>
        );
      }
    }
  };

  useEffect(() => () => {
    resizeEvent.clear();
    delayResizeStart.cancel();
    if (globalRef.current.tooltipShown) {
      hide();
      delete globalRef.current.tooltipShown;
    }
  }, []);

  const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
  const classList: string[] = [`${prefixCls}-cell`];
  const cellStyle: CSSProperties = {
    textAlign: align ||
      (command || (children && children.length) ? ColumnAlign.center : tableStore.getConfig('tableColumnAlign')(column, field)),
    ...headerStyle,
  };
  if (columnLock) {
    classList.push(`${prefixCls}-cell-fix-${columnLock}`);
    if (columnLock === ColumnLock.left) {
      cellStyle.left = pxToRem(columnGroup.left, true)!;
    } else if (columnLock === ColumnLock.right) {
      cellStyle.right = pxToRem(columnGroup.right + (rowIndex === 0 && tableStore.overflowY ? measureScrollbar() : 0), true)!;
    }
  }
  if (className) {
    classList.push(className);
  }
  if (headerClassName) {
    classList.push(headerClassName);
  }

  const headerNode = !isSearchCell ? (isValidElement(header) ? (
    cloneElement(header, { key: 'text' })
  ) : isString(header) ? (
    <span key="text">{header}</span>
  ) : (
    header
  )) : null;

  // 帮助按钮
  const helpIcon: ReactElement<TooltipProps> | undefined = getHelpIcon();
  // 排序按钮
  const sortIcon: ReactElement<IconProps> | undefined = !column.aggregation && column.sortable && name && !isSearchCell ? (
    <Icon key="sort" type="arrow_upward" className={`${prefixCls}-sort-icon`} />
  ) : undefined;
  const childNodes = [
    headerNode,
  ];
  const innerClassNames = [`${prefixCls}-cell-inner`];
  const innerProps: any = {
    children: childNodes,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
  if (helpIcon) {
    if (cellStyle.textAlign === ColumnAlign.right) {
      childNodes.unshift(helpIcon);
    } else {
      childNodes.push(helpIcon);
    }
  }
  if (sortIcon) {
    if (field && field.order) {
      classList.push(`${prefixCls}-sort-${field.order}`);
    }
    innerProps.onClick = handleClick;
    if (cellStyle.textAlign === ColumnAlign.right) {
      childNodes.unshift(sortIcon);
    } else {
      childNodes.push(sortIcon);
    }
  }
  if (expandIcon) {
    childNodes.unshift(
      <span key="prefix" className={!isSearchCell ? `${prefixCls}-header-expand-icon` : undefined}>
        {expandIcon}
      </span>,
    );
  }
  if (!isSearchCell) {
    const $rowHeight = headerRowHeight === undefined ? rowHeight : headerRowHeight;
    if ($rowHeight !== 'auto') {
      const height: number = Number(cellStyle.height) || ($rowHeight * (rowSpan || 1));
      innerProps.style = {
        height: pxToRem(height),
        lineHeight: pxToRem(height - 2),
      };
      innerClassNames.push(`${prefixCls}-cell-inner-row-height-fixed`);
    }
  }

  if (isSearchCell) {
    innerClassNames.push(`${prefixCls}-cell-search-header`);
  }

  if (key === CUSTOMIZED_KEY && isStickySupport() && tableStore.stickyRight && tableStore.overflowX && tableStore.columnGroups.rightLeafs.length === 1) {
    classList.push(`${prefixCls}-cell-sticky-shadow`);
  }

  const thProps: any = {
    className: classList.join(' '),
    rowSpan,
    colSpan,
    'data-index': key,
    style: omit(cellStyle, ['width', 'height']),
    scope,
  };
  if (intersectionRef) {
    thProps.ref = intersectionRef;
  }
  return (
    <th {...thProps}>
      <div
        {...innerProps}
        className={innerClassNames.join(' ')}
      />
      {columnResizable && renderResizer()}
    </th>
  );
};

TableHeaderCell.displayName = 'TableHeaderCell';

export default observer(TableHeaderCell);
