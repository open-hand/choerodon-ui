import React, { Component, isValidElement } from 'react';
import classNames from 'classnames';
import get from 'lodash/get';

function isInvalidRenderCellText(text) {
  return (
    text &&
    !isValidElement(text) &&
    Object.prototype.toString.call(text) === '[object Object]'
  );
}

export default class TableCell extends Component {
  handleClick = (e) => {
    const { record, column: { onCellClick } } = this.props;
    if (onCellClick) {
      onCellClick(record, e);
    }
  };

  render() {
    const {
      record,
      indentSize,
      prefixCls,
      indent,
      index,
      expandIcon,
      column,
      component: BodyCell,
    } = this.props;
    const { dataIndex, render, className = '', style } = column;

    // We should return undefined if no dataIndex is specified, but in order to
    // be compatible with object-path's behavior, we return the record object instead.
    let text;
    if (typeof dataIndex === 'number') {
      text = get(record, dataIndex);
    } else if (!dataIndex || dataIndex.length === 0) {
      text = record;
    } else {
      text = get(record, dataIndex);
    }
    let tdProps = { tabIndex: -1 };
    let colSpan;
    let rowSpan;

    if (render) {
      text = render(text, record, index);
      if (isInvalidRenderCellText(text)) {
        tdProps = text.props || tdProps;
        colSpan = tdProps.colSpan;
        rowSpan = tdProps.rowSpan;
        text = text.children;
      }
    }

    if (column.onCell) {
      tdProps = { ...tdProps, ...column.onCell(record, column) };
    }
    if (isInvalidRenderCellText(text)) {
      text = null;
    }

    const indentText = expandIcon ? (
      <span
        style={{ paddingLeft: `${indentSize * indent}px` }}
        className={`${prefixCls}-indent indent-level-${indent}`}
      />
    ) : null;

    if (rowSpan === 0 || colSpan === 0) {
      return null;
    }

    if (column.align) {
      tdProps.style = { ...tdProps.style, textAlign: column.align };
    }

    return (
      <BodyCell
        onClick={this.handleClick}
        {...tdProps}
        style={{
          ...style,
          ...tdProps.style,
        }}
        className={classNames(className, tdProps.className)}
      >
        {indentText}
        {expandIcon}
        {text}
      </BodyCell>
    );
  }
}
