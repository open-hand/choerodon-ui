import React, { cloneElement, Component, CSSProperties, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { findCell, findFirstFocusableElement, getAlignByField, getColumnKey, getEditorByColumnAndRecord, isDisabledRow, isRadio } from './utils';
import { FormFieldProps } from '../field/FormField';
import { ColumnLock } from './enum';
import CheckBox from '../check-box/CheckBox';
import Output from '../output/Output';

export interface TableCellProps extends ElementProps {
  column: ColumnProps;
  record: Record;
  indentSize: number;
  rowHeight: number | 'auto';
}

let inTab: boolean = false;

@observer
export default class TableCell extends Component<TableCellProps> {
  static displayName = 'TableCell';

  static propTypes = {
    prefixCls: PropTypes.string,
    column: PropTypes.object.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  @computed
  get cellEditor() {
    const { column, record } = this.props;
    return getEditorByColumnAndRecord(column, record);
  }

  handleEditorKeyDown = (e) => {
    switch (e.keyCode) {
      case KeyCode.TAB:
        const { prefixCls, column } = this.props;
        const cell = findCell(this.context.tableStore, prefixCls, getColumnKey(column));
        const node = findFirstFocusableElement(cell);
        if (node) {
          inTab = true;
          node.focus();
        }
        break;
      default:
    }
  };

  handleFocus = (e) => {
    const { tableStore } = this.context;
    const { editing, dataSet } = tableStore;
    if (!editing) {
      const { prefixCls, record, column, column: { lock } } = this.props;
      if (!isDisabledRow(record)) {
        dataSet.current = record;
        this.showEditor(e.currentTarget, lock);
        if (!this.cellEditor || isRadio(this.cellEditor)) {
          const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
          const node = findFirstFocusableElement(cell);
          if (node && !inTab) {
            node.focus();
          }
        }
      }
    }
    inTab = false;
  };

  renderEditor = () => {
    const { cellEditor } = this;
    if (isValidElement(cellEditor)) {
      const { dataSet } = this.context.tableStore;
      const { column: { name }, record } = this.props;
      const { checkField } = dataSet.props;
      const newEditorProps = {
        ...cellEditor.props,
        record,
        name,
        disabled: isDisabledRow(record),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
      };
      return cloneElement(cellEditor, newEditorProps as FormFieldProps);
    }
  };

  getCheckBox() {
    const { record } = this.props;
    const { dataSet } = this.context.tableStore;
    const { checkField } = dataSet.props;
    if (checkField) {
      return (
        <CheckBox
          name={checkField}
          record={record}
          disabled={isDisabledRow(record)}
          indeterminate={record.isIndeterminate}
        />
      );
    }
  }

  render() {
    const { column, prefixCls, record, children, indentSize, rowHeight } = this.props;
    const { tableStore } = this.context;
    const { className, style, align, name, renderer } = column;
    const field = name && record.getField(name);
    const cellPrefix = `${prefixCls}-cell`;
    const classString = classNames(cellPrefix, {
      [`${cellPrefix}-dirty`]: field && field.dirty,
    }, className);
    const { cellEditor } = this;
    const isBoolean = isRadio(cellEditor);
    const hasEditor = cellEditor && !isBoolean;
    const innerProps: any = {
      className: `${cellPrefix}-inner`,
      tabIndex: hasEditor && !isDisabledRow(record) ? 0 : -1,
      onFocus: this.handleFocus,
    };
    if (!hasEditor) {
      innerProps.onKeyDown = this.handleEditorKeyDown;
    }
    if (rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem(rowHeight),
      };
    }
    const indentText = children && (
      <span style={{ paddingLeft: pxToRem(indentSize * record.level) }} />
    );

    const checkBox = children && !tableStore.hasCheckFieldColumn && this.getCheckBox();

    const cellStyle: CSSProperties = style ? omit(style, ['width', 'height']) : {};
    cellStyle.textAlign = align || getAlignByField(record.getField(name));

    const prefix = (indentText || children || checkBox) && (
      <span className={`${prefixCls}-cell-prefix`} style={innerProps.style}>
        {indentText}
        {children}
        {checkBox}
      </span>
    );

    return (
      <td
        className={classString}
        style={cellStyle}
        data-index={getColumnKey(column)}
      >
        {prefix}
        <Output
          {...innerProps}
          record={record}
          renderer={isBoolean ? this.renderEditor : renderer}
          name={name}
          disabled={isDisabledRow(record)}
        />
      </td>
    );
  }

  showEditor(cell, lock?: ColumnLock | boolean) {
    const { name } = this.props.column;
    const { cellEditor } = this;
    if (name && cellEditor && !isRadio(cellEditor)) {
      if (!lock) {
        const { tableStore } = this.context;
        const { node, overflowX } = tableStore;
        if (overflowX) {
          const tableBodyWrap = cell.offsetParent;
          if (tableBodyWrap) {
            const { leftLeafColumnsWidth, rightLeafColumnsWidth } = tableStore;
            const { offsetLeft, offsetWidth } = cell;
            const { scrollLeft } = tableBodyWrap;
            const { width } = tableBodyWrap.getBoundingClientRect();
            const leftSide = offsetLeft - leftLeafColumnsWidth;
            const rightSide = offsetLeft + offsetWidth - width + rightLeafColumnsWidth + measureScrollbar();
            let _scrollLeft = scrollLeft;
            if (_scrollLeft < rightSide) {
              _scrollLeft = rightSide;
            }
            if (_scrollLeft > leftSide) {
              _scrollLeft = leftSide;
            }
            if (_scrollLeft !== scrollLeft) {
              tableBodyWrap.scrollLeft = _scrollLeft;
              node.handleBodyScrollLeft({
                target: tableBodyWrap,
                currentTarget: tableBodyWrap,
              });
            }
          }
        }
      }
      this.context.tableStore.showEditor(name);
    }
  }
}
