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
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { observer } from 'mobx-react-lite';
import { isArrayLike } from 'mobx';
import raf from 'raf';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import Record from '../data-set/Record';
import { ColumnProps } from './Column';
import TableContext from './TableContext';
import { TableButtonProps } from './Table';
import { findCell, getAlignByField, getColumnKey, getEditorByColumnAndRecord, isInCellEditor, isStickySupport } from './utils';
import { FieldType, RecordStatus } from '../data-set/enum';
import { SELECTION_KEY } from './TableStore';
import { ColumnAlign, SelectionMode, TableCommandType } from './enum';
import Tooltip from '../tooltip/Tooltip';
import ObserverCheckBox from '../check-box/CheckBox';
import { FormFieldProps, Renderer } from '../field/FormField';
import { $l } from '../locale-context';
import Button, { ButtonProps } from '../button/Button';
import { LabelLayout } from '../form/enum';
import { findFirstFocusableElement } from '../_util/focusable';
import useComputed from '../use-computed';
import SelectionTreeBox from './SelectionTreeBox';
import {
  defaultOutputRenderer,
  getDateFormatByField,
  isFieldValueEmpty,
  processFieldValue,
  processValue as utilProcessValue,
  renderMultiLine,
  renderMultipleValues,
  renderRangeValue,
  renderValidationMessage as utilRenderValidationMessage,
  showValidationMessage,
  toMultipleValue,
  transformHighlightProps,
} from '../field/utils';
import ValidationResult from '../validator/ValidationResult';
import localeContext from '../locale-context/LocaleContext';
import isEmpty from '../_util/isEmpty';
import { Tooltip as TextTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';

let inTab: boolean = false;

export interface TableCellInnerProps {
  column: ColumnProps;
  record: Record;
  style?: CSSProperties;
  disabled?: boolean;
  inAggregation?: boolean;
}

const TableCellInner: FunctionComponent<TableCellInnerProps> = observer((props) => {
  const { column, record, children, style, disabled, inAggregation } = props;
  const multipleValidateMessageLengthRef = useRef<number>(0);
  const tooltipShownRef = useRef<boolean | undefined>();
  const { tableStore } = useContext(TableContext);
  const {
    dataSet,
    rowHeight,
    pristine,
    aggregation,
    inlineEdit,
    columnEditorBorder,
  } = tableStore;
  const prefixCls = `${tableStore.prefixCls}-cell`;
  const innerPrefixCls = `${prefixCls}-inner`;
  const tooltip = tableStore.getColumnTooltip(column);
  const { name, key, lock, renderer, command, align } = column;
  const columnKey = getColumnKey(column);
  const { checkField } = dataSet.props;
  const height = record.getState(`__column_resize_height_${name}`);
  const columnCommand = useMemo(() => {
    if (typeof command === 'function') {
      return command({ dataSet, record });
    }
    return command;
  }, [record, command, dataSet]);
  const canFocus = useComputed(() => !disabled && (!tableStore.inlineEdit || record === tableStore.currentEditRecord), [disabled, record, tableStore]);
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
    if (record.status === RecordStatus.add) {
      dataSet.remove(record);
    } else {
      record.reset();
      tableStore.currentEditRecord = undefined;
    }
  }, [tableStore, record, dataSet]);
  const handleCommandEdit = useCallback(() => {
    if (tableStore.inlineEdit) {
      tableStore.currentEditRecord = record;
    }
  }, [tableStore, record]);
  const handleCommandDelete = useCallback(() => {
    dataSet.delete(record);
  }, [dataSet, record]);
  const field = record.getField(name);
  const multiLine = field && field.get('multiLine');
  const rows = useComputed(() => {
    if (multiLine) {
      return [...record.fields.values()].reduce((count, dsField) => {
        const bind = dsField.get('bind');
        if (bind && bind.startsWith(`${name}.`)) {
          return count + 1;
        }
        return count;
      }, 0);
    }
    return 0;
  }, [multiLine, record]);
  const checkBox = useComputed(() => {
    if (children) {
      if (tableStore.props.selectionMode === SelectionMode.treebox) {
        return (
          <SelectionTreeBox record={record} />
        );
      }
      if (checkField && !tableStore.hasCheckFieldColumn) {
        return (
          <ObserverCheckBox
            name={checkField}
            record={record}
            disabled={disabled}
            indeterminate={record.isIndeterminate}
          />
        );
      }
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
    if (columnCommand) {
      const commands: ReactElement<ButtonProps>[] = [];
      columnCommand.forEach(button => {
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
  }, [prefixCls, record, columnCommand, aggregation, getButtonProps, handleCommandSave, handleCommandCancel]);
  const renderEditor = useCallback(() => {
    if (isValidElement(cellEditor)) {
      /**
       * 渲染多行编辑器
       */
      if (multiLine) {
        return cellEditor;
      }
      const newEditorProps = {
        ...cellEditor.props,
        record,
        name,
        pristine,
        disabled: disabled || (tableStore.inlineEdit && !record.editing),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
        labelLayout: LabelLayout.none,
      };
      return cloneElement(cellEditor, newEditorProps as FormFieldProps);
    }
  }, [disabled, cellEditor, checkField, multiLine, record, name, pristine, tableStore]);

  const cellRenderer = useComputed((): Renderer | undefined => {
    if (columnCommand) {
      return renderCommand;
    }
    if (cellEditorInCell) {
      return renderEditor;
    }
    if (aggregation && renderer) {
      return (rendererProps) => {
        return renderer({ ...rendererProps, aggregation });
      };
    }
    return renderer;
  }, [columnCommand, cellEditorInCell, renderEditor, renderCommand, renderer, field, aggregation]);
  const prefixStyle = useComputed(() => {
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
  const innerStyle = useMemo(() => inAggregation ? prefixStyle : ({ textAlign: align || (columnCommand ? ColumnAlign.center : getAlignByField(field)), ...prefixStyle }), [inAggregation, align, field, columnCommand, prefixStyle]);
  const value = name ? pristine ? record.getPristineValue(name) : record.get(name) : undefined;
  const renderValidationResult = useCallback((validationResult?: ValidationResult) => {
    if (validationResult && validationResult.validationMessage) {
      return utilRenderValidationMessage(validationResult.validationMessage);
    }
  }, []);
  const isValidationMessageHidden = useCallback((message?: ReactNode): boolean => {
    return !message || pristine;
  }, [pristine]);
  const getRenderedValue = useCallback(() => {
    const processValue = (v) => {
      if (!isNil(v)) {
        const text = isPlainObject(v) ? v : utilProcessValue(v, getDateFormatByField(field));
        return processFieldValue(text, field, {
          getProp: (propName) => field && field.get(propName),
          lang: dataSet && dataSet.lang || localeContext.locale.lang,
        }, true);
      }
      return '';
    };
    const processRenderer = (v, repeat?: number) => {
      let processedValue;
      if (field && (field.lookup || field.get('options') || field.get('lovCode'))) {
        processedValue = field.getText(v) as string;
      }
      // 值集中不存在 再去取直接返回的值
      const text = isNil(processedValue) ? processValue(v) : processedValue;
      return (cellRenderer || defaultOutputRenderer)({
        value: v,
        text,
        record,
        dataSet,
        name,
        repeat,
      });
    };
    if (field) {
      const multiple = field.get('multiple');
      const range = field.get('range');
      if (multiple) {
        const { tags, multipleValidateMessageLength } = renderMultipleValues(value, {
          disabled,
          readOnly: true,
          range,
          prefixCls,
          processRenderer,
          renderValidationResult,
          isValidationMessageHidden,
          showValidationMessage,
          validator: field.validator,
        });
        multipleValidateMessageLengthRef.current = multipleValidateMessageLength;
        return tags;
      }
      if (range) {
        return renderRangeValue(value, { processRenderer });
      }
      if (field.get('multiLine')) {
        const { lines, multipleValidateMessageLength } = renderMultiLine({
          name,
          field,
          record,
          dataSet,
          prefixCls: innerPrefixCls,
          renderer: cellRenderer,
          renderValidationResult,
          isValidationMessageHidden,
          processValue,
          tooltip,
          labelTooltip: getConfig('labelTooltip'),
        });
        multipleValidateMessageLengthRef.current = multipleValidateMessageLength;
        return lines;
      }
    }
    const textNode = processRenderer(value);
    return textNode === '' ? getConfig('tableDefaultRenderer') : textNode;
  }, [multipleValidateMessageLengthRef, renderValidationResult, isValidationMessageHidden, name, record, dataSet, field, value, disabled, prefixCls, cellRenderer, tooltip]);
  const editorBorder = !inlineEdit && hasEditor;
  const text = useComputed(() => {
    const result = getRenderedValue();
    return isEmpty(result) || (isArrayLike(result) && !result.length) ? editorBorder ? undefined : getConfig('renderEmpty')('Output') : result;
  }, [getRenderedValue, editorBorder]);

  const showTooltip = useCallback((e) => {
    if (field && !(multipleValidateMessageLengthRef.current > 0 || (!field.get('validator') && field.get('multiple') && toMultipleValue(value, field.get('range')).length))) {
      const message = renderValidationResult(field.validator.currentValidationResult);
      if (!isValidationMessageHidden(message)) {
        showValidationMessage(e, message);
        return true;
      }
    }
    const element = e.target;
    if (element && !multiLine && (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(element)))) {
      if (text) {
        show(element, {
          title: text,
          placement: 'right',
        });
        return true;
      }
    }
    return false;
  }, [renderValidationResult, isValidationMessageHidden, field, tooltip, multiLine, text]);
  const handleMouseEnter = useCallback((e) => {
    if (!tableStore.columnResizing && showTooltip(e)) {
      tooltipShownRef.current = true;
    }
  }, [tooltipShownRef, tableStore]);
  const handleMouseLeave = useCallback(() => {
    if (!tableStore.columnResizing && tooltipShownRef.current) {
      hide();
      tooltipShownRef.current = false;
    }
  }, [tooltipShownRef, tableStore]);
  useEffect(() => {
    if (name && inlineEdit && record === tableStore.currentEditRecord) {
      const currentEditor = tableStore.editors.get(name);
      if (currentEditor) {
        currentEditor.alignEditor();
      }
      return () => {
        if (currentEditor) {
          currentEditor.hideEditor();
        }
      };
    }
  }, []);
  const innerProps: any = {
    tabIndex: hasEditor && canFocus ? 0 : -1,
    onFocus: handleFocus,
    children: text,
  };
  const empty = field ? isFieldValueEmpty(value, field.get('range')) : false;
  const innerClassName: string[] = [innerPrefixCls];
  if (columnEditorBorder) {
    innerClassName.push(`${prefixCls}-inner-bordered`);
  }
  if (editorBorder) {
    innerClassName.push(`${prefixCls}-inner-editable`);
  }
  let highlight;
  let inValid;
  if (field) {
    if (cellEditor && !pristine && field.dirty) {
      innerClassName.push(`${prefixCls}-inner-dirty`);
    }
    if (!inlineEdit && editorBorder) {
      if (field.required && (empty || !getConfig('showRequiredColorsOnlyEmpty'))) {
        innerClassName.push(`${prefixCls}-inner-required`);
      }
      inValid = !field.valid;
      if (inValid) {
        innerClassName.push(`${prefixCls}-inner-invalid`);
      }
      highlight = field.get('highlight');
      if (highlight) {
        innerClassName.push(`${prefixCls}-inner-highlight`);
      }
    }
  }
  if (disabled || (field && field.get('disabled'))) {
    innerClassName.push(`${prefixCls}-inner-disabled`);
  }
  if (multiLine) {
    innerClassName.push(`${prefixCls}-inner-multiLine`);
  }
  if (!isStickySupport() && !hasEditor) {
    innerProps.onKeyDown = handleEditorKeyDown;
  }
  if (inValid || tooltip) {
    innerProps.onMouseEnter = handleMouseEnter;
    innerProps.onMouseLeave = handleMouseLeave;
  }
  if (rowHeight === 'auto') {
    innerClassName.push(`${prefixCls}-inner-auto-height`);
  } else {
    innerClassName.push(`${prefixCls}-inner-row-height-fixed`);
  }
  if (height !== undefined && rows === 0) {
    innerClassName.push(`${prefixCls}-inner-fixed-height`);
  }
  const indentText = children && (
    <span style={{ paddingLeft: pxToRem(tableStore.props.indentSize * record.level) }} />
  );

  const prefix = (indentText || children || checkBox) && (
    <span key="prefix" className={`${prefixCls}-prefix`} style={prefixStyle}>
      {indentText}
      {children}
      {checkBox}
    </span>
  );

  let output: ReactNode = (
    <span
      key="output"
      {...innerProps}
      style={innerStyle}
      className={innerClassName.join(' ')}
    />
  );
  if (highlight) {
    const { highlightRenderer = tableStore.cellHighlightRenderer } = column;
    output = highlightRenderer(transformHighlightProps(highlight, { dataSet, record, name }), output);
  }
  return (
    <>
      {prefix}
      {output}
    </>
  );
});

TableCellInner.displayName = 'TableCellInner';

export default TableCellInner;
