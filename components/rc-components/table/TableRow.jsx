import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'mini-store';
import ResizeObserver from 'resize-observer-polyfill';
import TableCell from './TableCell';
import warning from '../../_util/warning';
import TableRowContext, { InnerRowCtx } from './TableRowContext';

class TableRow extends Component {
  static defaultProps = {
    onRow() {
    },
    expandIconColumnIndex: 0,
    expandRowByClick: false,
    onHover() {
    },
    hasExpandIcon() {
    },
    renderExpandIcon() {
    },
    renderExpandIconCell() {
    },
  };

  constructor(props) {
    super(props);

    this.shouldRender = props.visible;
    this.resizeObserver = null;
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.visible || (!prevState.visible && nextProps.visible)) {
      return {
        shouldRender: true,
        visible: nextProps.visible,
      };
    }
    return {
      visible: nextProps.visible,
    };
  }

  componentDidMount() {
    if (this.state.shouldRender) {
      this.saveRowRef();
      if (this.rowRef) {
        this.resizeObserver = new ResizeObserver(this.syncRowHeight);
        const dom = ReactDOM.findDOMNode(this);
        this.resizeObserver.observe(dom);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return !!(this.props.visible || nextProps.visible);
  }

  componentDidUpdate() {
    if (this.state.shouldRender && !this.rowRef) {
      this.saveRowRef();
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      delete this.resizeObserver;
    }
  }

  onRowClick = (event) => {
    const { record, index, onRowClick } = this.props;
    if (onRowClick) {
      onRowClick(record, index, event);
    }
  };

  onRowDoubleClick = (event) => {
    const { record, index, onRowDoubleClick } = this.props;
    if (onRowDoubleClick) {
      onRowDoubleClick(record, index, event);
    }
  };

  onContextMenu = (event) => {
    const { record, index, onRowContextMenu } = this.props;
    if (onRowContextMenu) {
      onRowContextMenu(record, index, event);
    }
  };

  onMouseEnter = (event) => {
    const { record, index, onRowMouseEnter, onHover, rowKey } = this.props;
    onHover(true, rowKey);
    if (onRowMouseEnter) {
      onRowMouseEnter(record, index, event);
    }
  };

  onMouseLeave = (event) => {
    const { record, index, onRowMouseLeave, onHover, rowKey } = this.props;
    onHover(false, rowKey);
    if (onRowMouseLeave) {
      onRowMouseLeave(record, index, event);
    }
  };

  setExpanedRowHeight() {
    const { store, rowKey } = this.props;
    let { expandedRowsHeight } = store.getState();
    const height = this.rowRef.getBoundingClientRect().height;
    const oldHeight = expandedRowsHeight && expandedRowsHeight[rowKey];
    if (height && oldHeight !== height) {
      expandedRowsHeight = {
        ...expandedRowsHeight,
        [rowKey]: height,
      };
      store.setState({ expandedRowsHeight });
    }
  }

  setRowHeight() {
    const { store, rowKey } = this.props;
    const { fixedColumnsBodyRowsHeight } = store.getState();
    const height = this.rowRef.getBoundingClientRect().height;
    const oldHeight = fixedColumnsBodyRowsHeight && fixedColumnsBodyRowsHeight[rowKey];
    if (height && oldHeight !== height) {
      store.setState({
        fixedColumnsBodyRowsHeight: {
          ...fixedColumnsBodyRowsHeight,
          [rowKey]: height,
        },
      });
    }
  }

  getStyle() {
    const { height, visible } = this.props;

    if (height && height !== this.style.height) {
      this.style = { ...this.style, height };
    }

    if (!visible && !this.style.display) {
      this.style = { ...this.style, display: 'none' };
    }

    return this.style;
  }

  saveRowRef() {
    this.rowRef = ReactDOM.findDOMNode(this);
    this.syncRowHeight();
  }

  syncRowHeight = () => {
    const { isAnyColumnsFixed, fixed, expandedRow, ancestorKeys } = this.props;

    if (!isAnyColumnsFixed) {
      return;
    }

    if (!fixed && expandedRow) {
      this.setExpanedRowHeight();
    }

    if (!fixed && ancestorKeys.length >= 0) {
      this.setRowHeight();
    }
  };

  render() {
    if (!this.state.shouldRender) {
      return null;
    }

    const {
      prefixCls,
      columns,
      record,
      rowKey,
      index,
      onRow,
      indent,
      indentSize,
      hovered,
      height,
      visible,
      fixed,
      components,
      hasExpandIcon,
      renderExpandIcon,
      renderExpandIconCell,
    } = this.props;

    const BodyRow = components.body.row;
    const BodyCell = components.body.cell;

    let { className } = this.props;

    if (hovered) {
      className += ` ${prefixCls}-hover`;
    }

    const cells = [];

    renderExpandIconCell(cells);

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      warning(
        column.onCellClick === undefined,
        'column[onCellClick] is deprecated, please use column[onCell] instead.',
      );

      cells.push(
        <TableRowContext.Consumer key={column.key || column.dataIndex}>
          {(form) => (
            <TableCell
              prefixCls={prefixCls}
              record={record}
              indentSize={indentSize}
              indent={indent}
              form={form}
              index={index}
              column={column}
              key={column.key || column.dataIndex}
              expandIcon={hasExpandIcon(i) && renderExpandIcon()}
              component={BodyCell}
            />
          )}
        </TableRowContext.Consumer>,
      );
    }

    const rowClassName =
      `${prefixCls} ${className} ${prefixCls}-level-${indent}`.trim();

    const rowProps = onRow(record, index);
    const customStyle = rowProps ? rowProps.style : {};
    let style = { height };

    if (!visible) {
      style.display = 'none';
    }

    style = { ...style, ...customStyle };

    return (
      <InnerRowCtx.Provider value={{ syncRowHeight: this.syncRowHeight }}>
        <BodyRow
          onClick={this.onRowClick}
          onDoubleClick={this.onRowDoubleClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onContextMenu={this.onContextMenu}
          className={rowClassName}
          fixed={fixed}
          record={record}
          {...rowProps}
          style={style}
          data-row-key={rowKey}
        >
          {cells}
        </BodyRow>
      </InnerRowCtx.Provider>
    );
  }
}

function getRowHeight(state, props) {
  const { expandedRowsHeight, fixedColumnsBodyRowsHeight } = state;
  const { fixed, rowKey } = props;

  if (!fixed) {
    return null;
  }

  if (expandedRowsHeight[rowKey]) {
    return expandedRowsHeight[rowKey];
  }

  if (fixedColumnsBodyRowsHeight[rowKey]) {
    return fixedColumnsBodyRowsHeight[rowKey];
  }

  return null;
}

export default connect((state, props) => {
  const { currentHoverKey, expandedRowKeys } = state;
  const { rowKey, ancestorKeys } = props;
  const visible = ancestorKeys.length === 0 || ancestorKeys.every(k => ~expandedRowKeys.indexOf(k));

  return {
    visible,
    hovered: currentHoverKey === rowKey,
    height: getRowHeight(state, props),
  };
})(TableRow);
