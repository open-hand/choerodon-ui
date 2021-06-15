import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  isValidElement,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { observer, useComputed } from 'mobx-react-lite';
import { isArrayLike } from 'mobx';
import raf from 'raf';
import classNames from 'classnames';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import Record from '../data-set/Record';
import { ColumnProps } from './Column';
import TableContext from './TableContext';
import { Commands, TableButtonProps } from './Table';
import { findCell, getColumnKey, getEditorByColumnAndRecord, isDisabledRow, isInCellEditor, isStickySupport } from './utils';
import { FieldType } from '../data-set/enum';
import { SELECTION_KEY } from './TableStore';
import { TableColumnTooltip, TableCommandType } from './enum';
import Output from '../output/Output';
import { ShowHelp } from '../field/enum';
import Tooltip from '../tooltip/Tooltip';
import ObserverCheckBox from '../check-box/CheckBox';
import { FormFieldProps, Renderer } from '../field/FormField';
import { $l } from '../locale-context';
import Button, { ButtonProps } from '../button/Button';
import { LabelLayout } from '../form/enum';
import findFirstFocusableElement from '../_util/findFirstFocusableElement';

let inTab: boolean = false;

export interface TableCellInnerProps {
  inView: boolean;
  column: ColumnProps;
  record: Record;
  command?: Commands[];
  style?: CSSProperties;
}

const TableCellInner: FunctionComponent<TableCellInnerProps> = observer((props) => {
  const { column, record, command, children, style, inView } = props;
  const { tableStore } = useContext(TableContext);
  const outputRef = useRef<Output | null>(null);
  const {
    dataSet,
    rowHeight,
    pristine,
    inlineEdit,
    aggregation,
    props: { indentSize },
  } = tableStore;
  const prefixCls = `${tableStore.prefixCls}-cell`;
  const tooltip = tableStore.getColumnTooltip(column);
  const { name, key, lock, highlightRenderer = tableStore.cellHighlightRenderer } = column;
  const columnKey = getColumnKey(column);
  const { checkField } = dataSet.props;
  const height = record.getState(`__column_resize_height_${name}`);
  const disabled = useComputed(() => isDisabledRow(record), [record]);
  const canFocus = useComputed(() => !disabled && (!inlineEdit || record === tableStore.currentEditRecord), [disabled, record, inlineEdit, tableStore]);
  const cellEditor = useComputed(() => getEditorByColumnAndRecord(column, record), [record, column]);
  const cellEditorInCell = useMemo(() => isInCellEditor(cellEditor), [cellEditor]);
  const hasEditor = useMemo(() => !pristine && cellEditor && !cellEditorInCell, [pristine, cellEditor, cellEditorInCell]);
  const showEditor = useCallback((cell) => {
    if (name && hasEditor) {
      if (!lock) {
        const { node, overflowX, virtual } = tableStore;
        if (overflowX) {
          const tableBodyWrap = virtual ? cell.offsetParent.parentNode.parentNode : cell.offsetParent;
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
      const editor = tableStore.editors.get(name);
      if (editor) {
        if (editor.cellNode) {
          if (tableStore.inlineEdit) {
            if (editor.inTab) {
              editor.inTab = false;
            } else {
              editor.focus();
            }
          } else {
            editor.hideEditor();
          }
        } else if (tableStore.inlineEdit) {
          editor.focus();
        } else {
          raf(() => {
            editor.alignEditor(!isStickySupport() && lock ? findCell(tableStore, columnKey, lock) : cell);
            editor.focus();
          });
        }
      }
    }
  }, [column, name, hasEditor, columnKey, tableStore]);
  const handleFocus = useCallback((e) => {
    if (canFocus) {
      if (key !== SELECTION_KEY) {
        dataSet.current = record;
      }
      showEditor(e.currentTarget);
      if (!isStickySupport() && (key === SELECTION_KEY || !hasEditor)) {
        const cell = findCell(tableStore, columnKey, lock);
        if (cell && !cell.contains(document.activeElement)) {
          const node = findFirstFocusableElement(cell);
          if (node && !inTab) {
            node.focus();
          }
        }
      }
    }
    inTab = false;
  }, [tableStore, dataSet, record, lock, columnKey, canFocus, hasEditor, showEditor]);
  const handleEditorKeyDown = useCallback((e) => {
    switch (e.keyCode) {
      case KeyCode.TAB: {
        const cell = findCell(tableStore, columnKey);
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
  }, [tableStore, columnKey]);
  const handleCommandSave = useCallback(() => {
    return dataSet.submit().then((result) => {
      if (result !== false) {
        tableStore.currentEditRecord = undefined;
      }
    });
  }, [tableStore, dataSet]);
  const handleCommandCancel = useCallback(() => {
    if (inlineEdit) {
      tableStore.currentEditRecord = record;
    }
  }, [tableStore, record, inlineEdit]);
  const handleCommandEdit = useCallback(() => {
    if (inlineEdit) {
      tableStore.currentEditRecord = record;
    }
  }, [tableStore, record, inlineEdit]);
  const handleCommandDelete = useCallback(() => {
    dataSet.delete(record);
  }, [dataSet, record]);
  const field = record.getField(name);
  const rows = useComputed(() => {
    if (field && field.get('multiLine')) {
      return [...record.fields.values()].reduce((count, dsField) => {
        const bind = dsField.get('bind');
        if (bind && bind.startsWith(`${name}.`)) {
          return count + 1;
        }
        return count;
      }, 0);
    }
    return 0;
  }, [field, record]);
  const checkBox = useComputed(() => {
    if (children && checkField && !tableStore.hasCheckFieldColumn) {
      return (
        <ObserverCheckBox
          name={checkField}
          record={record}
          disabled={disabled}
          indeterminate={record.isIndeterminate}
        />
      );
    }
  }, [disabled, children, tableStore, record, checkField]);

  const getButtonProps = useCallback((
    type: TableCommandType,
  ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined => {
    switch (type) {
      case TableCommandType.edit:
        return {
          icon: 'mode_edit',
          onClick: handleCommandEdit,
          disabled,
          title: $l('Table', 'edit_button'),
        };
      case TableCommandType.delete:
        return {
          icon: 'delete',
          onClick: handleCommandDelete,
          disabled,
          title: $l('Table', 'delete_button'),
        };
      default:
    }
  }, [disabled, handleCommandEdit, handleCommandDelete]);
  const renderCommand = useCallback(() => {
    const tableCommandProps = getConfig('tableCommandProps');
    const classString = classNames(`${prefixCls}-command`, tableCommandProps && tableCommandProps.className);
    if (record.editing) {
      return [
        <Tooltip key="save" title={$l('Table', 'save_button')}>
          <Button {...tableCommandProps} className={classString} icon="finished" onClick={handleCommandSave} />
        </Tooltip>,
        <Tooltip key="cancel" title={$l('Table', 'cancel_button')}>
          <Button {...tableCommandProps} className={classString} icon="cancle_a" onClick={handleCommandCancel} />
        </Tooltip>,
      ];
    }
    if (command) {
      const commands: ReactElement<ButtonProps>[] = [];
      command.forEach(button => {
        let tableButtonProps: TableButtonProps = {};
        if (isArrayLike(button)) {
          tableButtonProps = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableCommandType) {
          const defaultButtonProps = getButtonProps(button);
          if (defaultButtonProps) {
            const { afterClick, ...buttonProps } = tableButtonProps;
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
            commands.push(
              <Tooltip key={button} title={title}>
                <Button
                  {...tableCommandProps}
                  {...otherProps}
                  {...buttonProps}
                  className={classNames(classString, otherProps.className, buttonProps.className)}
                />
              </Tooltip>,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          commands.push(cloneElement(button, {
            ...tableCommandProps,
            ...button.props,
            className: classNames(classString, button.props.className),
          }));
        } else if (isObject(button)) {
          commands.push(
            <Button
              {...tableCommandProps}
              {...button}
              className={classNames(classString, (button as ButtonProps).className)}
            />,
          );
        }
      });
      return commands;
    }
  }, [prefixCls, record, command, aggregation, getButtonProps, handleCommandSave, handleCommandCancel]);
  const renderEditor = useCallback(() => {
    if (isValidElement(cellEditor)) {
      const newEditorProps = {
        ...cellEditor.props,
        record,
        name,
        pristine,
        disabled: disabled || (inlineEdit && !record.editing),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
        labelLayout: LabelLayout.none,
        _inTable: true,
      };
      /**
       * 渲染多行编辑器
       */
      if (field && field.get('multiLine')) {
        return cellEditor;
      }
      return cloneElement(cellEditor, newEditorProps as FormFieldProps);
    }
  }, [disabled, cellEditor, checkField, field, record, name, pristine, inlineEdit]);

  const cellRenderer = useComputed((): Renderer | undefined => {
    if (command) {
      return renderCommand;
    }
    if (cellEditorInCell) {
      return renderEditor;
    }
  }, [command, cellEditorInCell, renderCommand, renderEditor]);
  const innerStyle = useComputed(() => {
    if (!aggregation) {
      if (height !== undefined && rows === 0) {
        return {
          height: pxToRem(height),
          lineHeight: 1,
          ...style,
        };
      }
      if (rowHeight !== 'auto') {
        const isCheckBox = field && field.type === FieldType.boolean || key === SELECTION_KEY;
        const borderPadding = isCheckBox ? 4 : 2;
        const heightPx = rows > 0 ? (rowHeight + 2) * rows + 1 : rowHeight;
        const lineHeightPx = hasEditor || isCheckBox ? rowHeight - borderPadding : rowHeight;
        return {
          height: pxToRem(heightPx),
          lineHeight: rows > 0 ? 'inherit' : pxToRem(lineHeightPx),
          ...style,
        };
      }
    }
    return style;
  }, [field, key, rows, rowHeight, height, style, aggregation, hasEditor]);
  const innerProps: any = {
    tabIndex: hasEditor && canFocus ? 0 : -1,
    onFocus: handleFocus,
    pristine,
    highlightRenderer,
  };
  if (!inView) {
    if (rowHeight === 'auto') {
      innerProps.style = {
        minHeight: 30,
      };
    } else {
      innerProps.style = {
        height: pxToRem(rowHeight),
      };
      innerProps.style = {
        minHeight: 30,
      };
    }
    return (
      <span
        key="output"
        {...innerProps}
        className={`${prefixCls}-inner`}
      />
    );
  }
  const innerClassName: string[] = [`${prefixCls}-inner`];
  if (!isStickySupport() && !hasEditor) {
    innerProps.onKeyDown = handleEditorKeyDown;
  }
  if (rowHeight !== 'auto') {
    if (tooltip === TableColumnTooltip.overflow) {
      innerProps.ref = outputRef;
    }
  } else {
    innerClassName.push(`${prefixCls}-inner-auto-height`);
  }
  if (height !== undefined && rows === 0) {
    innerClassName.push(`${prefixCls}-inner-fixed-height`);
  }
  const indentText = children && (
    <span style={{ paddingLeft: pxToRem(indentSize * record.level) }} />
  );

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
      style={innerStyle}
      className={innerClassName.join(' ')}
      record={record}
      renderer={cellRenderer || column.renderer}
      name={name}
      disabled={disabled}
      showHelp={ShowHelp.none}
      tooltip={tooltip}
    />
  );
  return (
    <>
      {prefix}
      {output}
    </>
  );
});

TableCellInner.displayName = 'TableCellInner';

export default TableCellInner;
