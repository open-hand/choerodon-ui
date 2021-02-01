import React, { cloneElement, Component, CSSProperties, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { action, set, toJS, observable, runInAction } from 'mobx';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import isString from 'lodash/isString';
import classes from 'component-classes';
import {
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { isFunction, isNil } from 'lodash';
import { ColumnProps, minColumnWidth } from './Column';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import Icon from '../icon';
import DataSet from '../data-set/DataSet';
import EventManager from '../_util/EventManager';
import { getAlignByField, getColumnKey, getHeader } from './utils';
import { ColumnAlign, ColumnsEditType, DragColumnAlign } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip from '../tooltip';
import autobind from '../_util/autobind';
import { SELECTION_KEY, DRAG_KEY } from './TableStore';
import ObserverTextField from '../text-field/TextField';

export interface TableHeaderCellProps extends ElementProps {
  dataSet: DataSet;
  prevColumn?: ColumnProps;
  column: ColumnProps;
  resizeColumn?: ColumnProps;
  rowSpan?: number;
  colSpan?: number;
  getHeaderNode: () => HTMLTableSectionElement | null;
  snapshot: DraggableStateSnapshot,
  provided: DraggableProvided;
}

@observer
export default class TableHeaderCell extends Component<TableHeaderCellProps, any> {
  static displayName = 'TableHeaderCell';

  static propTypes = {
    column: PropTypes.object.isRequired,
  };

  static contextType = TableContext;

  resizeEvent: EventManager = new EventManager(typeof window !== 'undefined' && document);

  resizeBoundary: number = 0;

  resizePosition?: number;

  resizeColumn?: ColumnProps;

  @observable editing: boolean;

  constructor(props: TableHeaderCellProps) {
    super(props);
    runInAction(() => {
      this.editing = false;
    });
  }

  @action
  setEditing(editing: boolean) {
    this.editing = editing;
  }

  @autobind
  handleClick() {
    const { column, dataSet } = this.props;
    const { name } = column;
    if (name) {
      dataSet.sort(name);
    }
  }

  getNode(column) {
    const { getHeaderNode } = this.props;
    const headerDom: Element | null = getHeaderNode();
    if (headerDom) {
      return headerDom.querySelector(`[data-index="${getColumnKey(column)}"]`);
    }
  }

  setResizeColumn(column) {
    this.resizeColumn = column;
    const node = this.getNode(column);
    if (node) {
      this.resizeBoundary = node.getBoundingClientRect().left;
    }
  }

  @autobind
  handleLeftResize(e) {
    const { prevColumn } = this.props;
    this.setResizeColumn(prevColumn);
    e.persist();
    this.setresizeStart(e);
  }

  @autobind
  handleRightResize(e) {
    const { resizeColumn } = this.props;
    this.setResizeColumn(resizeColumn);
    e.persist();
    this.setresizeStart(e);
  }

  private setresizeStart = debounce(
    (e) => {
      this.resizeStart(e);
    },
    300,
  );

  @autobind
  handleLeftDoubleClick(_e) {
    if (this.setresizeStart) {
      this.setresizeStart.cancel();
      this.resizeDoubleClick();
    }
  }

  @autobind
  handleRightDoubleClick(_e) {
    if (this.setresizeStart) {
      this.setresizeStart.cancel();
      this.resizeDoubleClick();
    }
  }

  @autobind
  @action
  resizeDoubleClick(): void {
    const column = this.resizeColumn;
    const { prefixCls } = this.props;
    const { tableStore: { props: { autoMaxWidth }, node: { element } } } = this.context;
    if (autoMaxWidth && column) {
      const maxWidth = Math.max(
        ...[
          ...element.querySelectorAll(`td[data-index=${getColumnKey(column)}] > .${prefixCls}-cell-inner`),
        ].map(({ clientWidth, scrollWidth, parentNode: { offsetWidth } }) => offsetWidth + scrollWidth - clientWidth),
        minColumnWidth(column),
        column.width ? column.width : 0,
      );
      if (maxWidth !== column.width) {
        set(column, 'width', maxWidth);
      } else if (column.minWidth) {
        set(column, 'width', column.minWidth);
      }
    }
  }

  @action
  resizeStart(e): void {
    const { prefixCls } = this.props;
    const {
      tableStore: {
        node: { element },
      },
    } = this.context;
    classes(element).add(`${prefixCls}-resizing`);
    delete this.resizePosition;
    this.setSplitLinePosition(e.pageX);
    this.resizeEvent
      .addEventListener('mousemove', this.resize)
      .addEventListener('mouseup', this.resizeEnd);
  }

  @autobind
  resize(e): void {
    const column = this.resizeColumn;
    const limit = this.resizeBoundary + minColumnWidth(column);
    let left = e.pageX;
    if (left < limit) {
      left = limit;
    }
    this.resizePosition = this.setSplitLinePosition(left);
  }

  @autobind
  @action
  resizeEnd(): void {
    const { prefixCls } = this.props;
    const {
      tableStore: {
        node: { element },
      },
    } = this.context;
    classes(element).remove(`${prefixCls}-resizing`);
    this.resizeEvent.removeEventListener('mousemove').removeEventListener('mouseup');
    const column = this.resizeColumn;
    if (this.resizePosition && column) {
      const newWidth = Math.max(this.resizePosition - this.resizeBoundary, minColumnWidth(column));
      if (newWidth !== column.width) {
        set(column, 'width', newWidth);
      }
    }
  }

  @action
  setSplitLinePosition(left: number): number | undefined {
    const {
      tableStore: {
        node: { resizeLine },
      },
    } = this.context;
    const { left: rectLeft, width } = resizeLine.offsetParent.getBoundingClientRect();
    left -= rectLeft;
    if (left < 0) {
      left = 0;
    } else if (left >= width) {
      left = width - 1;
    }
    resizeLine.style.left = pxToRem(left) || null;
    return left + rectLeft;
  }

  renderResizer() {
    const { prevColumn, column, prefixCls } = this.props;
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const pre = prevColumn && prevColumn.resizable && (
      <div
        key="pre"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-left`}
        onDoubleClick={this.handleLeftDoubleClick}
        onMouseDown={this.handleLeftResize}
      />
    );
    const next = column.resizable && (
      <div
        key="next"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-right`}
        onDoubleClick={this.handleRightDoubleClick}
        onMouseDown={this.handleRightResize}
      />
    );

    return [pre, next];
  }


  @action
  onChangeHeader = (value) => {
    const {
      tableStore: {
        props: { columnsOnChange },
        columns,
      },
    } = this.context;
    const { column } = this.props;
    set(column, 'header', value);
    if (columnsOnChange) {
      columnsOnChange({ column: toJS(column), columns: toJS(columns), type: ColumnsEditType.header });
    }
  };


  @autobind
  @action
  onHeaderBlur() {
    this.setEditing(false);
  }


  render() {
    const { column, prefixCls, dataSet, rowSpan, colSpan, provided, snapshot } = this.props;
    const {
      tableStore: {
        rowHeight,
        columnMaxDeep,
        columnResizable,
        dragColumn,
        dragRow,
        headersEditable,
        props: { columnsDragRender = {}, dragColumnAlign },
      },
    } = this.context;
    const { renderIcon } = columnsDragRender;
    const sortPrefixCls = `${prefixCls}-sort`;
    const {
      headerClassName,
      headerStyle = {},
      sortable,
      name,
      align,
      help,
      showHelp,
      children,
      command,
      key,
    } = column;
    const classList: string[] = [`${prefixCls}-cell`];
    const field = dataSet.getField(name);
    if (headerClassName) {
      classList.push(headerClassName);
    }

    let cellStyle: CSSProperties = {
      textAlign:
        align ||
        (command || (children && children.length) ? ColumnAlign.center : getAlignByField(field)),
      ...headerStyle,
    };

    const headerNode = getHeader(column, dataSet);

    // 计数有多少个icon
    let iconQuantity = 0;
    let helpIcon;
    let sortableIcon;
    // 帮助按钮
    if (showHelp !== ShowHelp.none) {
      const fieldHelp = defaultTo(field && field.get('help'), help);
      if (fieldHelp) {
        helpIcon = (
          <Tooltip title={fieldHelp} placement="bottom" key="help">
            <Icon type="help_outline" className={`${prefixCls}-help-icon`} />
          </Tooltip>
        );
        iconQuantity += 24;
      }
    }
    // 排序按钮
    if (sortable && name) {
      const sortProps = headersEditable ? { onClick: this.handleClick } : {};
      iconQuantity += 18;
      sortableIcon = <Icon key="sort" type="arrow_upward" className={`${sortPrefixCls}-icon`} {...sortProps} />;
    }

    const headerChildren = (headerChild) => {
      if (isValidElement(headerChild)) {
        return cloneElement(headerChild, { key: 'text' });
      }
      if (isString(headerChild) || (isNil(headerChild) && headersEditable)) {
        const widthEdit = iconQuantity
          ? `calc(100% - ${pxToRem(iconQuantity)})`
          : headersEditable && !!name ? `100%` : undefined;
        const spanStyle: CSSProperties = {
          display: 'inline-block',
          maxWidth: widthEdit,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        };
        if (headersEditable && !!name) {
          const editProps = {
            defaultValue: headerChild,
            value: headerChild,
            onChange: this.onChangeHeader,
            key: 'text',
            style: { width: widthEdit },
            className: `${prefixCls}-cell-inner-edit`,
          };
          if (dragColumn) {
            return (
              <ObserverTextField
                {...editProps}
              />
            );
          }
          // 当为null 和 undefined 也可以编辑
          if (!headerChild) {
            spanStyle.height = '100%';
          }
          return (this.editing ? <ObserverTextField
            autoFocus
            onBlur={this.onHeaderBlur}
            {...editProps}
          /> : <span onClick={() => {
            this.setEditing(true);
          }} style={spanStyle} key="text">{headerChild}</span>);
        }
        // 当文字在左边无法查看到icon处理
        if (cellStyle.textAlign !== ColumnAlign.right && iconQuantity) {
          return <span key="text" style={spanStyle}>{headerChild}</span>;
        }

        return (<span key="text">{headerNode}</span>);
      }
      return headerChild;
    };

    const innerProps: any = {
      className: classNames(`${prefixCls}-cell-inner`, {
        [`${prefixCls}-cell-editor`]: headersEditable && !key && !dragColumn,
        [`${prefixCls}-header-edit`]: headersEditable && !key,
        [`${prefixCls}-cell-editing`]: this.editing,
      }),
      children: [
        headerChildren(headerNode),
      ],
    };

    if (rowHeight !== 'auto') {
      const rowHeightDIV = headersEditable ? pxToRem(rowHeight + 4) : pxToRem(rowHeight);
      innerProps.style = {
        height: rowHeightDIV,
      };
    }
    const dragIcon = () => {
      if (renderIcon && isFunction(renderIcon)) {
        return renderIcon({
          column,
          dataSet,
          snapshot,
        });
      }
      if (column && column.key === DRAG_KEY) {
        // 修复数据为空造成的th无法撑开
        cellStyle.width = pxToRem(column.width);
        return <Icon type="baseline-drag_indicator" />;
      }
      return null;
    };
    if (
      column.key !== SELECTION_KEY
      && dragRow
      && (dragColumnAlign === DragColumnAlign.left || dragColumnAlign === DragColumnAlign.right)
      && columnMaxDeep <= 1
    ) {
      innerProps.children.push(dragIcon());
    }

    if (helpIcon) {
      if (cellStyle.textAlign === ColumnAlign.right) {
        innerProps.children.unshift(helpIcon);
      } else {
        innerProps.children.push(helpIcon);
      }
    }

    if (sortableIcon) {
      if (field) {
        const { order } = field;
        if (order) {
          classList.push(`${sortPrefixCls}-${order}`);
        }
      }
      if (!headersEditable) {
        innerProps.onClick = this.handleClick;
      }
      if (cellStyle.textAlign === ColumnAlign.right) {
        innerProps.children.unshift(sortableIcon);
      } else {
        innerProps.children.push(sortableIcon);
      }
    }
    if (dragColumn && provided.draggableProps.style) {
      cellStyle = { ...omit(cellStyle, ['width', 'height']), ...provided.draggableProps.style, cursor: 'move' };
    }
    return (
      <th
        className={classList.join(' ')}
        rowSpan={rowSpan}
        ref={(ref) => {
          if (ref) {
            provided.innerRef(ref);
          }
        }}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        colSpan={colSpan}
        data-index={getColumnKey(column)}
        style={cellStyle}
      >
        <div {...innerProps} />
        {columnResizable && !dragColumn && this.renderResizer()}
      </th>
    );
  }

  componentWillUnmount() {
    this.resizeEvent.clear();
    this.setresizeStart.cancel();
  }
}
