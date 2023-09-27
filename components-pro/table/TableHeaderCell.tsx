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
  useState,
} from 'react';
import classNames from 'classnames';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import raf from 'raf';
import omit from 'lodash/omit';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import isUndefined from 'lodash/isUndefined';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { IconProps } from 'choerodon-ui/lib/icon';
import Popover from 'choerodon-ui/lib/popover';
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
import { transformZoomData } from '../_util/DocumentUtils';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import { CUSTOMIZED_KEY } from './TableStore';
import ColumnGroup from './ColumnGroup';
import { AggregationTreeProps, groupedAggregationTree } from './AggregationTree';
import TableCellInner from './TableCellInner';
import { TableVirtualHeaderCellProps } from './TableVirtualHeaderCell';
import TextField from '../text-field';
import Button from '../button/Button';
import { SortOrder } from '../data-set/interface';
import { ButtonColor } from '../button/enum';
import { ValueChangeAction } from '../text-field/enum';
import { $l } from '../locale-context';

export interface TableHeaderCellProps extends TableVirtualHeaderCellProps {
  intersectionRef?: (node?: Element | null) => void;
  isRenderCell?: boolean;
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
    isRenderCell,
  } = props;
  const { column, key, prev } = columnGroup;
  const { tooltipProps } = column;
  const { rowHeight, border, prefixCls, tableStore, dataSet, aggregation, autoMaxWidth } = useContext(TableContext);
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const { columnResizable, headerRowHeight, headerFilter } = tableStore;
  const {
    headerClassName,
    headerStyle = {},
    name,
    align,
    children,
    command,
    lock,
    filter,
  } = column;
  const field = dataSet.getField(name);
  const [filterText, setFilterText] = useState<any>();
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
      let left = e.touches ? transformZoomData(e.touches[0].clientX) : transformZoomData(e.clientX);
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
    setSplitLinePosition(transformZoomData(e.clientX));
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
      const { sortable } = column;
      if (typeof sortable === 'function') {
        const fieldProps = dataSet.props.fields ? dataSet.props.fields.find(f => f.name === name) : undefined;
        if (field && fieldProps) {
          const unOrder = field.order || fieldProps.order;
          runInAction(() => {
            const { combineSort: nowCombineSort } = dataSet;
            dataSet.fields.forEach(current => {
              if (current.order && (current !== field || nowCombineSort)) {
                current.order = undefined;
              }
            });
            dataSet.combineSort = false;
            switch (unOrder) {
              case SortOrder.asc:
                field.order = SortOrder.desc;
                break;
              case SortOrder.desc:
                field.order = undefined;
                break;
              default:
                field.order = SortOrder.asc;
            }
          })
        }
        runInAction(() => {
          dataSet.records = dataSet.records.sort((record1, record2) => sortable(record1, record2, field!.order as SortOrder));
        })
      } else {
        dataSet.sort(name);
      }
    }
  }, [dataSet, name]);

  const handleMouseEnter = useCallback((e) => {
    const tooltip = tableStore.getColumnTooltip(column);
    const { currentTarget } = e;
    const measureElement = currentTarget.getElementsByClassName(`${prefixCls}-cell-inner-right-has-other`)[0] || currentTarget;
    if (!tableStore.columnResizing && (tooltip === TableColumnTooltip.always || (tooltip === TableColumnTooltip.overflow && isOverflow(measureElement)))) {
      const tooltipConfig: TooltipProps = isObject(tooltipProps) ? tooltipProps : {};
      show(currentTarget, {
        title: header,
        placement: getTooltipPlacement('table-cell') || 'right',
        theme: getTooltipTheme('table-cell'),
        ...tooltipConfig,
      });
      globalRef.current.tooltipShown = true;
    }
  }, [tableStore, column, globalRef, getTooltipTheme, getTooltipPlacement, header]);

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

  const onReset = useCallback(() => {
    setFilterText('');
    runInAction(() => {
      tableStore.headerFilter = undefined;
    })
  }, [setFilterText, tableStore]);

  const doFilter = useCallback(() => {
    if (!isUndefined(filterText)) {
      runInAction(() => {
        tableStore.headerFilter = {
          fieldName: name,
          filterText: filterText === null ? '' : filterText,
          filter,
        };
      })
    }
  }, [filterText, tableStore, name, filter]);

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

  const getConstSortIcon = () => {
    const { combineSort } = dataSet;
    const tableShowSortIcon = tableStore.getConfig('tableShowSortIcon');
    const combineSortField = combineSort && field && field.order;
    const type = combineSortField
      ? (field && field.order === 'asc' ? 'paixu-shang' : 'paixu-xia')
      : ((tableShowSortIcon || combineSort) && !(field && field.order) ? 'sort-all' : 'arrow_upward');
    const className = classNames(`${prefixCls}-sort-icon`, {
      [`${prefixCls}-sort-icon-temp`]: tableShowSortIcon || (combineSort && !combineSortField),
      [`${prefixCls}-sort-icon-combine`]: combineSortField,
    });
    return <Icon key="sort" type={type} className={className} />;
  };

  const getFilterIcon = () => {
    if (column.filter) {
      let popoverContent: React.ReactNode;
      const footer: React.ReactNode = (
        <div className={`${prefixCls}-sort-popup-footer`}>
          <Button onClick={onReset} key='reset'>
            {$l('Table', 'reset_button')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={doFilter}
            key='filter'
          >
            {$l('Table', 'search')}
          </Button>
        </div>
      );
      const columnFilterPopover = column.filterPopover || tableStore.getConfig('tableColumnFilterPopover');
      if (typeof columnFilterPopover === 'function') {
        popoverContent = (
          <div onClick={(e) => e.stopPropagation()}>
            {columnFilterPopover({
              setFilterText: (filterText: any) => setFilterText(filterText),
              dataSet,
              field,
              filterText,
              clearFilters: onReset,
              confirm: doFilter,
              footer,
            })}
          </div>
        )
      } else {
        popoverContent = (
          <div onClick={(e) => e.stopPropagation()}>
            <TextField autoFocus onEnterDown={doFilter} style={{ width: '100%' }} valueChangeAction={ValueChangeAction.input} value={filterText} onChange={(value) => setFilterText(value)} />
            {footer}
          </div>
        );
      }
      return (
        <Popover
          content={popoverContent}
          overlayClassName={`${prefixCls}-sort-popup-content`}
          trigger="click"
          onVisibleChange={() => {
            if (headerFilter) {
              setFilterText(headerFilter.fieldName === name ? String(headerFilter.filterText) : '');
            }
          }}
          key='filter'
        >
          <Icon key="filter" className={filterText && String(headerFilter && headerFilter.fieldName) === name ? `${prefixCls}-filter-icon ${prefixCls}-filter-icon-active` : `${prefixCls}-filter-icon`} type="search" onClick={(e) => e.stopPropagation()} />
        </Popover>
      );
    }
    return undefined;
  };

  // 过滤按钮
  const filterIcon: ReactElement<IconProps> | undefined = getFilterIcon();

  // 帮助按钮
  const helpIcon: ReactElement<TooltipProps> | undefined = getHelpIcon();

  // 排序按钮
  const sortIcon: ReactElement<IconProps> | undefined = !column.aggregation && column.sortable && name && !isSearchCell ? getConstSortIcon() : undefined;
  
  const headerNodePlaceholder = Symbol('headerNodePlaceholder');
  const childNodes: any[] = [
    headerNodePlaceholder,
  ];
  const innerClassNames = [`${prefixCls}-cell-inner`];
  const innerProps: any = {
    children: childNodes,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
  const labelClassNames: string[] = [];
  if (helpIcon) {
    childNodes.push(helpIcon);
    labelClassNames.push(`${prefixCls}-cell-inner-right-has-help`);
  }

  if (sortIcon) {
    if (field && field.order) {
      classList.push(`${prefixCls}-sort-${field.order}`);
      const { combineSort } = dataSet;
      if (combineSort) {
        classList.push(`${prefixCls}-sort-${field.order}-combine`);
      } else {
        classList.push(`${prefixCls}-sort-${field.order}-temp`);
      }
    }
    innerProps.onClick = handleClick;
    childNodes.push(sortIcon);
    labelClassNames.push(`${prefixCls}-cell-inner-right-has-sort`);
  }

  if (filterIcon) {
    childNodes.push(filterIcon);
    labelClassNames.push(`${prefixCls}-cell-inner-right-has-filter`);
  }

  if (expandIcon) {
    childNodes.unshift(
      <span key="prefix" className={!isSearchCell ? `${prefixCls}-header-expand-icon` : undefined}>
        {expandIcon}
      </span>,
    );
  }
  // 兼容 label 超长
  if (labelClassNames.length > 0) {
    labelClassNames.push(`${prefixCls}-cell-inner-right-has-other`);
  }
  const labelClassNamesStr = labelClassNames.length > 0 ? labelClassNames.join(' ') : undefined;
  const headerNode = !isSearchCell ? (isValidElement(header) ? (
    cloneElement<any>(header, {
      key: 'text',
      className: classNames(header.props && header.props.className, labelClassNamesStr),
    })
  ) : isString(header) ? (
    <span key="text" className={labelClassNamesStr} >{header}</span>
  ) : (
    header
  )) : null;
  childNodes[childNodes.findIndex(item => item === headerNodePlaceholder)] = headerNode;
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

  if (!tableStore.tableColumnResizeTransition) {
    classList.push(`${prefixCls}-cell-no-transition`);
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
  if (!isRenderCell) {
    return <th {...thProps} />
  }

  const handleResize = useCallback(() => {
    const { clipboard, startChooseCell, endChooseCell, drawCopyBorder } = tableStore;
    if (clipboard && startChooseCell && endChooseCell) {
      drawCopyBorder();
    }
  }, [column.width])
  return (
    <ReactResizeObserver onResize={handleResize}>
      <th {...thProps}>
        <div
          {...innerProps}
          className={innerClassNames.join(' ')}
        />
        {columnResizable && renderResizer()}
      </th>
    </ReactResizeObserver>

  );
};

TableHeaderCell.displayName = 'TableHeaderCell';

export default observer(TableHeaderCell);
