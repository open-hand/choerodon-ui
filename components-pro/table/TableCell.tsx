import React, {
  cloneElement,
  Component,
  CSSProperties,
  HTMLProps,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable } from 'mobx';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import {
  findCell,
  findFirstFocusableElement,
  getAlignByField,
  getColumnKey,
  getEditorByColumnAndRecord,
  isDisabledRow,
  isRadio,
} from './utils';
import { FormFieldProps, Renderer } from '../field/FormField';
import { ColumnAlign, ColumnLock, TableColumnTooltip, TableCommandType } from './enum';
import ObserverCheckBox from '../check-box/CheckBox';
import Output from '../output/Output';
import { ShowHelp } from '../field/enum';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { $l } from '../locale-context';
import Tooltip from '../tooltip/Tooltip';
import { DataSetEvents, RecordStatus } from '../data-set/enum';
import { LabelLayout } from '../form/enum';
import { Commands } from './Table';
import autobind from '../_util/autobind';

export interface TableCellProps extends ElementProps {
  column: ColumnProps;
  record: Record;
  indentSize: number;
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
  };

  static contextType = TableContext;

  element?: HTMLSpanElement | null;

  resizeObserver?: ResizeObserver;

  @observable overflow?: boolean;

  @computed
  get cellEditor() {
    const { column, record } = this.props;
    return getEditorByColumnAndRecord(column, record);
  }

  @computed
  get cellEditorInCell() {
    return isRadio(this.cellEditor);
  }

  @computed
  get hasEditor() {
    const {
      tableStore: { pristine },
    } = this.context;
    return !pristine && this.cellEditor && !this.cellEditorInCell;
  }

  @autobind
  @action
  saveOutput(node) {
    if (node) {
      this.disconnect();
      const {
        column: { tooltip },
      } = this.props;
      const element = node.element;
      this.element = element;
      if (tooltip === TableColumnTooltip.overflow) {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(element.parentNode);
      }
      const {
        tableStore: { dataSet },
      } = this.context;
      dataSet.addEventListener(DataSetEvents.update, this.handleOutputChange);
      this.handleResize();
    }
  }

  disconnect() {
    this.handleResize.cancel();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.removeEventListener(DataSetEvents.update, this.handleOutputChange);
  }

  handleResize = debounce(() => {
    const { element } = this;
    const { tableStore } = this.context;
    if (element && !tableStore.hidden) {
      this.syncSize();
    }
  }, 30);

  @autobind
  handleOutputChange({ record, name }) {
    const { record: thisRecord, column } = this.props;
    if (record === thisRecord && column.name === name) {
      this.handleResize();
    }
  }

  @action
  syncSize() {
    const { element } = this;
    if (element && element.textContent) {
      const {
        column: { tooltip },
      } = this.props;
      if (tooltip === TableColumnTooltip.overflow) {
        const { offsetWidth: minWidth } = element;
        element.style.position = 'absolute';
        const { offsetWidth } = element;
        element.style.position = '';
        this.overflow = minWidth !== 0 && offsetWidth > minWidth;
      } else {
        this.overflow = true;
      }
    } else {
      this.overflow = false;
    }
  }

  @autobind
  handleEditorKeyDown(e) {
    switch (e.keyCode) {
      case KeyCode.TAB: {
        const { prefixCls, column } = this.props;
        const { tableStore } = this.context;
        const cell = findCell(tableStore, prefixCls, getColumnKey(column));
        if (cell) {
          if (cell.contains(document.activeElement)) {
            inTab = true;
          } else {
            const node = findFirstFocusableElement(cell);
            if (node) {
              inTab = true;
              node.focus();
            }
          }
        }
        break;
      }
      default:
    }
  }

  @autobind
  handleFocus(e) {
    const { tableStore } = this.context;
    const { currentEditorName, dataSet, inlineEdit } = tableStore;
    const {
      prefixCls,
      record,
      column,
      column: { lock },
    } = this.props;
    if (!currentEditorName && !isDisabledRow(record) && (!inlineEdit || record.editing)) {
      dataSet.current = record;
      this.showEditor(e.currentTarget, lock);
      if (!this.cellEditor || isRadio(this.cellEditor)) {
        const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
        if (cell && !cell.contains(document.activeElement)) {
          const node = findFirstFocusableElement(cell);
          if (node && !inTab) {
            node.focus();
          }
        }
      }
    }
    inTab = false;
  }

  @autobind
  handleCommandEdit() {
    const { record } = this.props;
    const { tableStore } = this.context;
    if (tableStore.inlineEdit) {
      tableStore.currentEditRecord = record;
    }
  }

  @autobind
  handleCommandDelete() {
    const { record } = this.props;
    const { tableStore } = this.context;
    const { dataSet } = tableStore;
    dataSet.delete(record);
  }

  @autobind
  async handleCommandSave() {
    const { tableStore } = this.context;
    const { dataSet } = tableStore;
    if ((await dataSet.submit()) !== false) {
      tableStore.currentEditRecord = undefined;
    }
  }

  @autobind
  handleCommandCancel() {
    const { record } = this.props;
    const { tableStore } = this.context;
    if (record.status === RecordStatus.add) {
      const { dataSet } = tableStore;
      dataSet.remove(record);
    } else {
      record.reset();
      tableStore.currentEditRecord = undefined;
    }
  }

  getButtonProps(
    type: TableCommandType,
    record: Record,
  ): ButtonProps & { children?: ReactNode } | undefined {
    const disabled = isDisabledRow(record);
    switch (type) {
      case TableCommandType.edit:
        return {
          icon: 'mode_edit',
          onClick: this.handleCommandEdit,
          disabled,
          title: $l('Table', 'edit_button'),
        };
      case TableCommandType.delete:
        return {
          icon: 'delete',
          onClick: this.handleCommandDelete,
          disabled,
          title: $l('Table', 'delete_button'),
        };
      default:
    }
  }

  @autobind
  renderCommand() {
    const { record } = this.props;
    const command = this.getCommand();
    if (record.editing) {
      return [
        <Tooltip key="save" title={$l('Table', 'save_button')}>
          <Button
            color={ButtonColor.primary}
            funcType={FuncType.flat}
            icon="finished"
            onClick={this.handleCommandSave}
          />
        </Tooltip>,
        <Tooltip key="cancel" title={$l('Table', 'cancel_button')}>
          <Button
            color={ButtonColor.primary}
            funcType={FuncType.flat}
            icon="cancle_a"
            onClick={this.handleCommandCancel}
          />
        </Tooltip>,
      ];
    }
    if (command) {
      const children: ReactElement<ButtonProps>[] = [];

      command.forEach(button => {
        let props = {};
        if (isArrayLike(button)) {
          props = button[1];
          button = button[0];
        }
        if (isString(button) && button in TableCommandType) {
          const defaultButtonProps = this.getButtonProps(button, record);
          if (defaultButtonProps) {
            const { title, ...otherProps } = defaultButtonProps;
            children.push(
              <Tooltip key={button} title={title}>
                <Button
                  color={ButtonColor.primary}
                  funcType={FuncType.flat}
                  {...otherProps}
                  {...props}
                />
              </Tooltip>,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(button);
        }
      });
      return children;
    }
  }

  @autobind
  renderEditor() {
    const { cellEditor } = this;
    if (isValidElement(cellEditor)) {
      const {
        tableStore: { dataSet, pristine },
      } = this.context;
      const {
        column: { name },
        record,
      } = this.props;
      const { checkField } = dataSet.props;
      const newEditorProps = {
        ...cellEditor.props,
        record,
        name,
        pristine,
        disabled: isDisabledRow(record),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
        labelLayout: LabelLayout.none,
      };
      return cloneElement(cellEditor, newEditorProps as FormFieldProps);
    }
  }

  getCheckBox() {
    const { record } = this.props;
    const {
      tableStore: { dataSet },
    } = this.context;
    const { checkField } = dataSet.props;
    if (checkField) {
      return (
        <ObserverCheckBox
          name={checkField}
          record={record}
          disabled={isDisabledRow(record)}
          indeterminate={record.isIndeterminate}
        />
      );
    }
  }

  getCommand(): Commands[] | undefined {
    const {
      column: { command },
      record,
    } = this.props;
    const {
      tableStore: { dataSet },
    } = this.context;
    if (typeof command === 'function') {
      return command({ dataSet, record });
    }
    return command;
  }

  getCellRenderer(command?: Commands[]): Renderer | undefined {
    const { column } = this.props;
    const { renderer } = column;
    if (command) {
      return this.renderCommand;
    }
    if (this.cellEditorInCell) {
      return this.renderEditor;
    }
    return renderer;
  }

  getInnerNode(prefixCls, command?: Commands[]) {
    const {
      context: {
        tableStore: { rowHeight, expandIconAsCell, hasCheckFieldColumn, pristine },
      },
      props: { children },
    } = this;
    if (expandIconAsCell && children) {
      return children;
    }
    const { column, record, indentSize } = this.props;
    const { name, tooltip } = column;
    const { hasEditor } = this;
    const innerProps: any = {
      className: `${prefixCls}-inner`,
      tabIndex: hasEditor && !isDisabledRow(record) ? 0 : -1,
      onFocus: this.handleFocus,
      pristine,
    };
    if (!hasEditor) {
      innerProps.onKeyDown = this.handleEditorKeyDown;
    }
    if (rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem(rowHeight),
      };
      if (tooltip && tooltip !== TableColumnTooltip.none) {
        innerProps.ref = this.saveOutput;
      }
    }
    const indentText = children && (
      <span style={{ paddingLeft: pxToRem(indentSize * record.level) }} />
    );

    const checkBox = children && !hasCheckFieldColumn && this.getCheckBox();

    const prefix = (indentText || children || checkBox) && (
      <span key="prefix" className={`${prefixCls}-prefix`} style={innerProps.style}>
        {indentText}
        {children}
        {checkBox}
      </span>
    );
    const output = (
      <Output
        key="output"
        {...innerProps}
        record={record}
        renderer={this.getCellRenderer(command)}
        name={name}
        disabled={isDisabledRow(record)}
        showHelp={ShowHelp.none}
      />
    );
    const text = this.overflow ? (
      <Tooltip key="tooltip" title={cloneElement(output, { ref: null, className: null })}>
        {output}
      </Tooltip>
    ) : (
      output
    );
    return [prefix, text];
  }

  componentWillUnmount(): void {
    this.disconnect();
  }

  render() {
    const { column, prefixCls, record } = this.props;
    const {
      tableStore: { inlineEdit, pristine },
    } = this.context;
    const { className, style, align, name, onCell } = column;
    const command = this.getCommand();
    const field = name ? record.getField(name) : undefined;
    const cellPrefix = `${prefixCls}-cell`;
    const cellExternalProps: HTMLProps<HTMLTableCellElement> =
      typeof onCell === 'function'
        ? onCell({
            dataSet: record.dataSet!,
            record,
            column,
          })
        : {};
    const cellStyle: CSSProperties = {
      textAlign: align || (command ? ColumnAlign.center : getAlignByField(field)),
      ...style,
      ...cellExternalProps.style,
    };
    const classString = classNames(
      cellPrefix,
      {
        [`${cellPrefix}-dirty`]: field && !pristine && field.dirty,
        [`${cellPrefix}-required`]: field && !inlineEdit && field.required,
        [`${cellPrefix}-editable`]: !inlineEdit && this.hasEditor,
      },
      className,
      cellExternalProps.className,
    );
    return (
      <td
        {...cellExternalProps}
        className={classString}
        style={omit(cellStyle, ['width', 'height'])}
        data-index={getColumnKey(column)}
      >
        {this.getInnerNode(cellPrefix, command)}
      </td>
    );
  }

  showEditor(cell, lock?: ColumnLock | boolean) {
    const {
      column: { name },
    } = this.props;
    const { tableStore } = this.context;
    const { cellEditor } = this;
    if (name && cellEditor && !isRadio(cellEditor)) {
      if (!lock) {
        const { node, overflowX } = tableStore;
        if (overflowX) {
          const tableBodyWrap = cell.offsetParent;
          if (tableBodyWrap) {
            const { leftLeafColumnsWidth, rightLeafColumnsWidth } = tableStore;
            const { offsetLeft, offsetWidth } = cell;
            const { scrollLeft } = tableBodyWrap;
            const { width } = tableBodyWrap.getBoundingClientRect();
            const leftSide = offsetLeft - leftLeafColumnsWidth;
            const rightSide =
              offsetLeft + offsetWidth - width + rightLeafColumnsWidth + measureScrollbar();
            let sl = scrollLeft;
            if (sl < rightSide) {
              sl = rightSide;
            }
            if (sl > leftSide) {
              sl = leftSide;
            }
            if (sl !== scrollLeft) {
              tableBodyWrap.scrollLeft = sl;
              node.handleBodyScrollLeft({
                target: tableBodyWrap,
                currentTarget: tableBodyWrap,
              });
            }
          }
        }
      }
      tableStore.showEditor(name);
    }
  }
}
