import React, { cloneElement, Component, CSSProperties, HTMLProps, isValidElement, MouseEventHandler, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import classNames from 'classnames';
import raf from 'raf';
import { DraggableProvided } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import max from 'lodash/max';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { getConfig } from 'choerodon-ui/lib/configure';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import {
  findCell,
  findFirstFocusableElement,
  getAlignByField,
  getColumnKey,
  getColumnLock,
  getEditorByColumnAndRecord,
  getPlacementByAlign,
  isDisabledRow,
  isRadio,
  isStickySupport,
} from './utils';
import { FormFieldProps, Renderer } from '../field/FormField';
import { ColumnAlign, ColumnLock, TableColumnTooltip, TableCommandType } from './enum';
import ObserverCheckBox from '../check-box/CheckBox';
import Output from '../output/Output';
import { ShowHelp } from '../field/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import Tooltip from '../tooltip/Tooltip';
import { DataSetEvents, FieldType, RecordStatus } from '../data-set/enum';
import { LabelLayout } from '../form/enum';
import { Commands, TableButtonProps } from './Table';
import autobind from '../_util/autobind';
import { DRAG_KEY, SELECTION_KEY } from './TableStore';

export interface TableCellProps extends ElementProps {
  column: ColumnProps;
  record: Record;
  indentSize: number;
  colSpan: number;
  isDragging: boolean;
  lock?: ColumnLock | boolean;
  provided?: DraggableProvided;
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

  nextFrameActionId?: number;

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

  componentDidMount(): void {
    this.connect();
  }

  componentDidUpdate(): void {
    this.disconnect();
    this.connect();
  }

  componentWillUnmount(): void {
    this.disconnect();
  }


  @autobind
  @action
  saveOutput(node) {
    if (node) {
      this.element = node.element;
    } else {
      this.element = null;
    }
  }

  connect() {
    const { column: { tooltip } } = this.props;
    if (tooltip === TableColumnTooltip.overflow) {
      const {
        tableStore: { dataSet },
      } = this.context;
      dataSet.addEventListener(DataSetEvents.update, this.handleOutputChange);
      this.handleResize();
    }
  }

  disconnect() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.removeEventListener(DataSetEvents.update, this.handleOutputChange);
  }

  @autobind
  handleResize() {
    const { element } = this;
    const { tableStore } = this.context;
    if (element && !tableStore.hidden) {
      if (this.nextFrameActionId !== undefined) {
        raf.cancel(this.nextFrameActionId);
      }
      this.nextFrameActionId = raf(this.syncSize);
    }
  }

  @autobind
  handleOutputChange({ record, name }) {
    const {
      record: thisRecord,
      column: { name: thisName },
    } = this.props;
    if (thisRecord && thisName) {
      const field = thisRecord.getField(thisName);
      const bind = field ? field.get('bind') : undefined;
      if (
        record === thisRecord &&
        (thisName === name || (isString(bind) && bind.startsWith(`${name}.`)))
      ) {
        this.handleResize();
      }
    }
  }

  @autobind
  @action
  syncSize() {
    this.overflow = this.computeOverFlow();
  }

  computeOverFlow(): boolean {
    const { element } = this;
    if (element && element.textContent) {
      const {
        column: { tooltip },
      } = this.props;
      if (tooltip === TableColumnTooltip.overflow) {
        const { clientWidth, scrollWidth } = element;
        return scrollWidth > clientWidth;
      }
    }
    return false;
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
    const { dataSet, inlineEdit } = tableStore;
    const {
      prefixCls,
      record,
      column,
      column: { lock },
    } = this.props;
    if (column.key !== SELECTION_KEY && !isDisabledRow(record) && (!inlineEdit || record.editing)) {
      dataSet.current = record;
      this.showEditor(e.currentTarget, lock);
      if (!isStickySupport() && (!this.cellEditor || isRadio(this.cellEditor))) {
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
  ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined {
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
    const tableCommandProps = getConfig('tableCommandProps');
    if (record.editing) {
      return [
        <Tooltip key="save" title={$l('Table', 'save_button')}>
          <Button {...tableCommandProps} icon="finished" onClick={this.handleCommandSave} />
        </Tooltip>,
        <Tooltip key="cancel" title={$l('Table', 'cancel_button')}>
          <Button {...tableCommandProps} icon="cancle_a" onClick={this.handleCommandCancel} />
        </Tooltip>,
      ];
    }
    if (command) {
      const children: ReactElement<ButtonProps>[] = [];
      command.forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableCommandType) {
          const defaultButtonProps = this.getButtonProps(button, record);
          if (defaultButtonProps) {
            const { afterClick, ...buttonProps } = props;
            if (afterClick) {
              const { onClick } = defaultButtonProps;
              defaultButtonProps.onClick = async e => {
                e.persist();
                try {
                  await onClick(e);
                } finally {
                  afterClick(e);
                }
              };
            }
            const { title, ...otherProps } = defaultButtonProps;
            children.push(
              <Tooltip key={button} title={title}>
                <Button {...tableCommandProps} {...otherProps} {...buttonProps} />
              </Tooltip>,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(cloneElement(button, { ...tableCommandProps, ...button.props }));
        } else if (isObject(button)) {
          children.push(<Button {...tableCommandProps} {...button} />);
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
        tableStore: { dataSet, pristine, inlineEdit },
      } = this.context;
      const {
        column: { name },
        record,
      } = this.props;
      const field = record.getField(name);
      const { checkField } = dataSet.props;
      const newEditorProps = {
        ...cellEditor.props,
        record,
        name,
        pristine,
        disabled: isDisabledRow(record) || (inlineEdit && !record.editing),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
        labelLayout: LabelLayout.none,
        _inTable: true,
      };
      /**
       * 渲染多行编辑器
       */
      if (field?.get('multiLine')) {
        return cellEditor;
      }
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

  getInnerNode(prefixCls, command?: Commands[], textAlign?: ColumnAlign) {
    const {
      context: {
        tableStore: {
          dataSet,
          rowHeight,
          expandIconAsCell,
          hasCheckFieldColumn,
          pristine,
        },
        tableStore,
      },
      props: { children },
    } = this;
    if (expandIconAsCell && children) {
      return children;
    }
    const { column, record, indentSize, lock } = this.props;
    const { name, tooltip, key } = column;
    const { hasEditor } = this;
    // 计算多行编辑单元格高度
    const field = record.getField(name);
    const innerProps: any = {
      className: `${prefixCls}-inner`,
      tabIndex: hasEditor && !isDisabledRow(record) ? 0 : -1,
      onFocus: this.handleFocus,
      pristine,
    };
    let rows = 0;
    if (field?.get('multiLine')) {
      rows = dataSet.props.fields?.map(fields => {
        if (fields.bind && fields.bind.split('.')[0] === name) {
          return record.getField(fields.name) || dataSet.getField(fields.name);
        }
      }).filter(f => f).length;
      const multiLineHeight = rows > 0 ? (rowHeight + 2) * rows + 1 : rowHeight;
      if (multiLineHeight > Number((max(tableStore.multiLineHeight) || 0))) {
        runInAction(() => {
          tableStore.setMultiLineHeight(multiLineHeight);
        });
      }
    }

    if (!isStickySupport() && !hasEditor) {
      innerProps.onKeyDown = this.handleEditorKeyDown;
    }
    if (rowHeight !== 'auto') {
      const isCheckBox = field && field.type === FieldType.boolean || key === SELECTION_KEY;
      const borderPadding = isCheckBox ? 4 : 2;
      const heightPx = rows > 0 ? (rowHeight + 2) * rows + 1 : rowHeight;
      const lineHeightPx = hasEditor ? rowHeight - borderPadding :
        isCheckBox ? rowHeight - borderPadding : rowHeight;
      innerProps.style = {
        height: pxToRem(heightPx),
        lineHeight: rows > 0 ? 'inherit' : pxToRem(lineHeightPx),
      };
      // 处理多行横向滚动lock列高度
      if (tableStore.multiLineHeight.length && lock) {
        innerProps.style = {
          height: pxToRem(max(tableStore.multiLineHeight) || 0),
          lineHeight: pxToRem(max(tableStore.multiLineHeight) || 0),
        };
      }
      if (tooltip === TableColumnTooltip.overflow || (key === DRAG_KEY)) {
        innerProps.ref = this.saveOutput;
      }
      // 如果为拖拽结点强制给予焦点
      if (key === DRAG_KEY) {
        innerProps.onMouseDown = () => {
          if (this.element) {
            this.element.focus();
          }
        };
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
    const text = tooltip === TableColumnTooltip.always || this.overflow ? (
      <Tooltip key="tooltip" title={cloneElement(output, { ref: null, className: null })} placement={getPlacementByAlign(textAlign)}>
        {output}
      </Tooltip>
    ) : (
      output
    );
    return [prefix, text];
  }

  render() {
    const { column, prefixCls, record, isDragging, provided, colSpan, style: propsStyle, className: propsClassName } = this.props;
    const {
      tableStore,
    } = this.context;
    const { inlineEdit, pristine, node } = tableStore;
    const { className, style, align, name, onCell, tooltip, lock } = column;
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
      ...(provided && { cursor: 'move' }),
    };
    const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
    const classString = classNames(
      cellPrefix,
      {
        [`${cellPrefix}-dirty`]: field && !pristine && field.dirty,
        [`${cellPrefix}-required`]: field && !inlineEdit && field.required,
        [`${cellPrefix}-editable`]: !inlineEdit && this.hasEditor,
        [`${cellPrefix}-multiLine`]: field && field.get('multiLine'),
        [`${cellPrefix}-fix-${columnLock}`]: columnLock,
      },
      className,
      propsClassName,
      cellExternalProps.className,
    );
    const widthDraggingStyle = (): React.CSSProperties => {
      const draggingStyle: React.CSSProperties = {};
      if (isDragging) {
        const dom = node.element.querySelector(`.${prefixCls}-tbody .${prefixCls}-cell[data-index=${getColumnKey(column)}]`);
        if (dom) {
          draggingStyle.width = dom.clientWidth;
          draggingStyle.whiteSpace = 'nowrap';
        }
      }
      return draggingStyle;
    };
    const td = (
      <td
        colSpan={colSpan}
        {...cellExternalProps}
        className={classString}
        data-index={getColumnKey(column)}
        {...(provided && provided.dragHandleProps)}
        style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle(), ...propsStyle }}
      >
        {this.getInnerNode(cellPrefix, command, cellStyle.textAlign as ColumnAlign)}
      </td>
    );
    return tooltip === TableColumnTooltip.overflow ? (
      <ReactResizeObserver onResize={this.handleResize} resizeProp="width">
        {td}
      </ReactResizeObserver>
    ) : (
      td
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
