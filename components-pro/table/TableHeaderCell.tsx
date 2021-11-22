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
import { useInView } from 'react-intersection-observer';
import { observer } from 'mobx-react-lite';
import raf from 'raf';
import omit from 'lodash/omit';
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
import { ElementProps } from '../core/ViewComponent';
import Icon from '../icon';
import EventManager from '../_util/EventManager';
import { getColumnLock, getHeader, getMaxClientWidth, isStickySupport } from './utils';
import { ColumnAlign, ColumnLock, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';
import transform from '../_util/transform';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import { CUSTOMIZED_KEY } from './TableStore';
import ColumnGroup from './ColumnGroup';

export interface TableHeaderCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  rowSpan?: number;
  colSpan?: number;
  rowIndex?: number;
  getHeaderNode?: () => HTMLTableSectionElement | null;
}

const TableHeaderCell: FunctionComponent<TableHeaderCellProps> = function TableHeaderCell(props) {
  const { columnGroup, rowSpan, colSpan, className, rowIndex, getHeaderNode = noop } = props;
  const { column, key, prev } = columnGroup;
  const { rowHeight, border, prefixCls, tableStore, dataSet, aggregation, autoMaxWidth, onColumnResize = noop } = useContext(TableContext);
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const { columnResizable } = tableStore;
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
  const needIntersection = tableStore.virtualCell && tableStore.overflowX;
  const { ref, inView } = useInView({
    root: needIntersection ? tableStore.node.wrapper : undefined,
    rootMargin: '100px',
  });
  const header = getHeader(column, dataSet, aggregation);
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
      transform(`translateX(${pxToRem(left) || 0})`, resizeLine.style);
    }
    return left + bodyLeft;
  }), [tableStore, globalRef]);

  const resize = useCallback((e): void => {
    const { current } = globalRef;
    const { resizeColumnGroup } = current;
    if (resizeColumnGroup) {
      const limit = current.resizeBoundary + minColumnWidth(resizeColumnGroup.column, tableStore);
      let left = e.clientX;
      if (left < limit) {
        left = limit;
      }
      current.resizePosition = setSplitLinePosition(left);
    }
  }, [globalRef, setSplitLinePosition]);

  const resizeEnd = useCallback(action<() => void>(() => {
    tableStore.columnResizing = false;
    setSplitLineHidden(true);
    resizeEvent.removeEventListener('mousemove').removeEventListener('mouseup');
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
              tableStore.changeCustomizedColumnValue(col, {
                width: th.offsetWidth,
              });
            }
          }
          group = group.prev;
        }
        if (width === undefined) {
          raf(() => {
            tableStore.changeCustomizedColumnValue(resizeColumn, {
              width: newWidth,
            });
          });
        } else {
          tableStore.changeCustomizedColumnValue(resizeColumn, {
            width: newWidth,
          });
        }
      }
      /**
       * onColumnResize 事件回调
       * 回调参数：
       * @param column
       * @param width
       */
      onColumnResize({ column: resizeColumn, width: newWidth });
    }
  }), [globalRef, tableStore, setSplitLineHidden, resizeEvent]);

  const resizeStart = useCallback(action<(e) => void>((e) => {
    tableStore.columnResizing = true;
    delete globalRef.current.resizePosition;
    setSplitLineHidden(false);
    const { node: { element } } = tableStore;
    const { left } = element.getBoundingClientRect();
    globalRef.current.bodyLeft = border ? left + 1 : left;
    setSplitLinePosition(e.clientX);
    resizeEvent
      .setTarget(element.ownerDocument)
      .addEventListener('mousemove', resize)
      .addEventListener('mouseup', resizeEnd);
  }), [tableStore, globalRef, setSplitLineHidden, setSplitLinePosition, resizeEvent]);

  const delayResizeStart = useCallback(debounce(resizeStart, 300), [resizeStart]);

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
      show(currentTarget, {
        title: header,
        placement: getTooltipPlacement('table-cell') || 'right',
        theme: getTooltipTheme('table-cell'),
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

  const handleStopResize = useCallback(() => {
    delayResizeStart.cancel();
  }, [delayResizeStart]);

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
        tableStore.changeCustomizedColumnValue(col, {
          width: maxWidth,
        });
      } else if (col.minWidth) {
        tableStore.changeCustomizedColumnValue(col, {
          width: col.minWidth,
        });
      }
    }
  }), [globalRef, prefixCls, tableStore]);

  const handleLeftDoubleClick = useCallback(() => {
    delayResizeStart.cancel();
    resizeDoubleClick();
  }, [delayResizeStart, resizeDoubleClick]);

  const handleRightDoubleClick = useCallback(() => {
    delayResizeStart.cancel();
    resizeDoubleClick();
  }, [delayResizeStart, resizeDoubleClick]);

  const renderResizer = () => {
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const pre = prevColumnGroup && prevColumnGroup.column.resizable && (
      <div
        key="pre"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-left`}
        onDoubleClick={autoMaxWidth ? handleLeftDoubleClick : undefined}
        onMouseDown={handleLeftResize}
        onMouseUp={autoMaxWidth ? handleStopResize : undefined}
      />
    );
    const next = currentColumnGroup && currentColumnGroup.column.resizable && (
      <div
        key="next"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-right`}
        onDoubleClick={autoMaxWidth ? handleRightDoubleClick : undefined}
        onMouseDown={handleRightResize}
        onMouseUp={autoMaxWidth ? handleStopResize : undefined}
      />
    );

    return [pre, next];
  };

  const getHelpIcon = () => {
    if (column.showHelp !== ShowHelp.none) {
      const fieldHelp = defaultTo(field && field.get('help'), column.help);
      if (fieldHelp) {
        return (
          <Tooltip title={fieldHelp} placement="bottom" key="help">
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

  useEffect(() => {
    if (needIntersection) {
      columnGroup.setInView(inView);
    } else if (columnGroup.inView !== undefined) {
      columnGroup.setInView(undefined);
    }
  }, [needIntersection, columnGroup, inView]);

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
      cellStyle.left = pxToRem(columnGroup.left)!;
    } else if (columnLock === ColumnLock.right) {
      cellStyle.right = pxToRem(columnGroup.right + (rowIndex === 0 && tableStore.overflowY ? measureScrollbar() : 0))!;
    }
  }
  if (className) {
    classList.push(className);
  }
  if (headerClassName) {
    classList.push(headerClassName);
  }

  const headerNode = isValidElement(header) ? (
    cloneElement(header, { key: 'text' })
  ) : isString(header) ? (
    <span key="text">{header}</span>
  ) : (
    header
  );

  // 帮助按钮
  const helpIcon: ReactElement<TooltipProps> | undefined = getHelpIcon();
  // 排序按钮
  const sortIcon: ReactElement<IconProps> | undefined = !column.aggregation && column.sortable && name ? (
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
  if (rowHeight !== 'auto') {
    const height: number = Number(cellStyle.height) || (rowHeight * (rowSpan || 1));
    innerProps.style = {
      height: pxToRem(height),
      lineHeight: pxToRem(height - 2),
    };
    innerClassNames.push(`${prefixCls}-cell-inner-row-height-fixed`);
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
  };
  if (needIntersection) {
    thProps.ref = ref;
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
