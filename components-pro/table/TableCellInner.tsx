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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Record from '../data-set/Record';
import { ColumnProps, ColumnRenderProps } from './Column';
import TableContext from './TableContext';
import { TableButtonProps } from './Table';
import { findCell, getColumnKey, getEditorByColumnAndRecord, isInCellEditor, isStickySupport } from './utils';
import { FieldType, RecordStatus } from '../data-set/enum';
import { COMBOBAR_KEY, SELECTION_KEY } from './TableStore';
import { ColumnAlign, SelectionMode, TableCommandType } from './enum';
import ObserverCheckBox from '../check-box/CheckBox';
import { FormFieldProps, Renderer } from '../field/FormField';
import { $l } from '../locale-context';
import Button, { ButtonProps } from '../button/Button';
import { FuncType } from '../button/enum';
import { LabelLayout } from '../form/enum';
import { findFirstFocusableElement } from '../_util/focusable';
import SelectionTreeBox from './SelectionTreeBox';
import {
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
  toRangeValue,
  transformHighlightProps,
} from '../field/utils';
import ValidationResult from '../validator/ValidationResult';
import localeContext from '../locale-context/LocaleContext';
import isEmpty from '../_util/isEmpty';
import { Tooltip as TextTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { hide, show } from '../tooltip/singleton';
import useComputed from '../use-computed';
import { ShowHelp } from '../field/enum';
import { defaultOutputRenderer } from '../output/utils';
import { iteratorReduce } from '../_util/iteratorUtils';
import { Group } from '../data-set/DataSet';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';

let inTab = false;

export interface TableCellInnerProps {
  column: ColumnProps;
  record: Record;
  style?: CSSProperties;
  disabled?: boolean;
  inAggregation?: boolean;
  prefixCls?: string;
  colSpan?: number;
  headerGroup?: Group;
  rowGroup?: Group;
}

const TableCellInner: FunctionComponent<TableCellInnerProps> = function TableCellInner(props) {
  const { column, record, children, style, disabled, inAggregation, prefixCls, colSpan, headerGroup, rowGroup } = props;
  const multipleValidateMessageLengthRef = useRef<number>(0);
  const tooltipShownRef = useRef<boolean | undefined>();
  const { getTooltip, getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const {
    pristine,
    aggregation,
    inlineEdit,
    rowHeight,
    tableStore,
    dataSet,
    columnEditorBorder,
    indentSize,
    checkField,
    selectionMode,
  } = useContext(TableContext);
  const innerPrefixCls = `${prefixCls}-inner`;
  const tooltip = tableStore.getColumnTooltip(column);
  const { name, key, lock, renderer, command, align, tooltipProps } = column;
  const columnKey = getColumnKey(column);
  const height = record.getState(`__column_resize_height_${name}`);
  const { currentEditRecord } = tableStore;
  const field = dataSet.getField(name);
  const fieldDisabled = disabled || (field && field.get('disabled', record));
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const prefixRef = useRef<HTMLSpanElement | null>(null);
  const [paddingLeft, setPaddingLeft] = useState<number>(children ? indentSize * record.level : 0);
  const columnCommand = useComputed(() => {
    if (typeof command === 'function') {
      return command({ dataSet, record, aggregation });
    }
    return command;
  }, [record, command, dataSet, aggregation]);
  const canFocus = useMemo(() => !fieldDisabled && (!inlineEdit || record === currentEditRecord), [fieldDisabled, record, currentEditRecord, inlineEdit]);
  const cellEditor = getEditorByColumnAndRecord(column, record);
  const cellEditorInCell = isInCellEditor(cellEditor);
  const hasEditor = !pristine && cellEditor && !cellEditorInCell;
  const showEditor = useCallback((cell) => {
    if (name) {
      if (!lock && tableStore.overflowX) {
        const tableBodyWrap = tableStore.virtual ? cell.offsetParent.parentNode.parentNode : cell.offsetParent;
        if (tableBodyWrap) {
          const { leftLeafColumnsWidth, rightLeafColumnsWidth } = tableStore.columnGroups;
          const { offsetLeft, offsetWidth } = cell;
          const { scrollLeft } = tableBodyWrap;
          const width = Math.round(tableBodyWrap.getBoundingClientRect().width);
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
            editor.alignEditor(!isStickySupport() && lock ? findCell(tableStore, columnKey, lock, undefined, true) : cell);
            editor.focus();
          });
        }
      }
    }
  }, [column, name, columnKey, tableStore]);
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
  const multiLine = field && field.get('multiLine', record);
  const fieldType = !aggregation && rowHeight !== 'auto' && field && field.get('type', record);
  const rows = multiLine ? iteratorReduce(dataSet.fields.values(), (count, dsField) => {
    const bind = dsField.get('bind', record);
    if (bind && bind.startsWith(`${name}.`)) {
      return count + 1;
    }
    return count;
  }, 0) : 0;
  const checkBox = (() => {
    if (children) {
      if (selectionMode === SelectionMode.treebox) {
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
  })();

  const renderCommand = useCallback(() => {
    const tableCommandProps = tableStore.getConfig('tableCommandProps');
    const classString = classNames(`${prefixCls}-command`, tableCommandProps && tableCommandProps.className);
    if (record.editing) {
      return [
        <Button
          {...tableCommandProps}
          key="save"
          className={classString}
          onClick={handleCommandSave}
          funcType={FuncType.link}
        >
          {$l('Table', 'save_button')}
        </Button>,
        <Button
          {...tableCommandProps}
          key="cancel"
          className={classString}
          onClick={handleCommandCancel}
          funcType={FuncType.link}
        >
          {$l('Table', 'cancel_button')}
        </Button>,
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
          const getButtonProps = (
            type: TableCommandType,
          ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined => {
            switch (type) {
              case TableCommandType.edit:
                return {
                  funcType: FuncType.link,
                  onClick: handleCommandEdit,
                  disabled,
                  children: $l('Table', 'edit_button'),
                };
              case TableCommandType.delete:
                return {
                  funcType: FuncType.link,
                  onClick: handleCommandDelete,
                  disabled,
                  children: $l('Table', 'delete_button'),
                };
              default:
            }
          };
          const defaultButtonProps = getButtonProps(button as TableCommandType);
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
            const { ...otherProps } = defaultButtonProps;
            commands.push(
              <Button
                {...tableCommandProps}
                {...otherProps}
                {...buttonProps}
                className={classNames(classString, otherProps.className, buttonProps.className)}
              />,
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
  }, [tableStore, prefixCls, record, columnCommand, aggregation, disabled, handleCommandEdit, handleCommandDelete, handleCommandSave, handleCommandCancel]);
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
        disabled: disabled || (inlineEdit && !record.editing),
        indeterminate: checkField && checkField === name && record.isIndeterminate,
        labelLayout: LabelLayout.none,
        showHelp: ShowHelp.none,
      };
      return cloneElement(cellEditor, newEditorProps as FormFieldProps);
    }
  }, [disabled, cellEditor, checkField, multiLine, record, name, pristine, inlineEdit]);

  const cellRenderer = useMemo((): Renderer | undefined => {
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
  const prefixStyle = useMemo(() => {
    if (!aggregation || !tableStore.hasAggregationColumn) {
      if (height !== undefined && rows === 0) {
        return {
          height: pxToRem(height),
          lineHeight: 1.5,
          ...style,
        };
      }
      if (rowHeight !== 'auto') {
        const isComboQueryColumn = key === COMBOBAR_KEY;
        const isCheckBox = fieldType === FieldType.boolean || key === SELECTION_KEY;
        const multiple = field && field.get('multiple', record);
        const borderPadding = isCheckBox || multiple || isComboQueryColumn ? 4 : 2;
        const heightPx = rows > 0 ? (rowHeight + 2) * rows + 1 : rowHeight;
        const lineHeightPx = hasEditor || isCheckBox || multiple || isComboQueryColumn ? rowHeight - borderPadding : rowHeight;
        return {
          height: pxToRem(heightPx),
          lineHeight: rows > 0 ? 'inherit' : pxToRem(lineHeightPx),
          ...style,
        };
      }
    }
    return style;
  }, [fieldType, key, rows, rowHeight, height, style, aggregation, hasEditor]);
  const textAlign = useMemo(() => (align || (columnCommand ? ColumnAlign.center : tableStore.getConfig('tableColumnAlign')(column, field, record))), [columnCommand, align, column, field, record]);
  const colSpanStyle = useMemo(() => (colSpan && colSpan > 1 && (textAlign === ColumnAlign.right || textAlign === ColumnAlign.center)) ? { width: `calc(100% - ${pxToRem(30)})` } : {}, [colSpan, textAlign]);
  const innerStyle = useMemo(() => {
    if (inAggregation) {
      return { ...prefixStyle, ...colSpanStyle };
    }
    return { textAlign, ...prefixStyle, ...colSpanStyle };
  }, [inAggregation, textAlign, prefixStyle, colSpanStyle]);
  const value = name ? pristine ? record.getPristineValue(name) : record.get(name) : undefined;
  const renderValidationResult = useCallback((validationResult?: ValidationResult) => {
    if (validationResult && validationResult.validationMessage) {
      return utilRenderValidationMessage(validationResult.validationMessage, true, tableStore.getProPrefixCls);
    }
  }, []);
  const isValidationMessageHidden = useCallback((message?: ReactNode): boolean | undefined => {
    return !message || pristine;
  }, [pristine]);
  const editorBorder = !inlineEdit && hasEditor;
  const getRenderedValue = () => {
    const processValue = (v) => {
      if (!isNil(v)) {
        const text = isPlainObject(v) ? v : utilProcessValue(v, {
          dateFormat: getDateFormatByField(field, undefined, record),
          showInvalidDate: tableStore.getConfig('showInvalidDate'),
          isNumber: [FieldType.number, FieldType.currency, FieldType.bigNumber].includes(fieldType),
        });
        return processFieldValue(text, field, {
          getProp: (propName) => field && field.get(propName, record),
          lang: dataSet && dataSet.lang || localeContext.locale.lang,
        }, true, record, tableStore.getConfig);
      }
      return '';
    };
    const processRenderer = (value, repeat?: number) => {
      let processedValue;
      if (field && (field.getLookup(record) || field.get('options', record) || field.get('lovCode', record))) {
        if (isArrayLike(value)) {
          const isCascader = !field.get('multiple', record) || value.some(v => isArrayLike(v));
          processedValue = value.map(v => field.getText(v, undefined, record)).join(isCascader ? '/' : '、');
        } else {
          processedValue = field.getText(value, undefined, record) as string;
        }
      }
      // 值集中不存在 再去取直接返回的值
      const text = isNil(processedValue) ? processValue(value) : processedValue;
      return (cellRenderer || defaultOutputRenderer)({
        value,
        text,
        record,
        dataSet,
        name,
        repeat,
        headerGroup,
        rowGroup,
      } as ColumnRenderProps);
    };
    if (field) {
      if (!cellEditorInCell) {
        const multiple = field.get('multiple', record);
        const range = field.get('range', record);
        const tagRenderer = tableStore.getColumnTagRenderer(column);
        if (multiple) {
          const { tags, multipleValidateMessageLength, isOverflowMaxTagCount } = renderMultipleValues(value, {
            disabled,
            readOnly: true,
            range,
            prefixCls,
            tagRenderer,
            processRenderer,
            renderValidationResult,
            isValidationMessageHidden,
            showValidationMessage: (e, message?: ReactNode) => showValidationMessage(e, message, getTooltipTheme('validation'), getTooltipPlacement('validation'), tableStore.getConfig),
            validationResults: field.getValidationErrorValues(record),
          });
          multipleValidateMessageLengthRef.current = multipleValidateMessageLength;
          if (isOverflowMaxTagCount) {
            return (<Tooltip title={processRenderer(value)}>{tags}</Tooltip>)
          }
          return tags;
        }
        if (range) {
          return renderRangeValue(toRangeValue(value, range), { processRenderer });
        }
      }
      if (field.get('multiLine', record)) {
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
          labelTooltip: getTooltip('label'),
        });
        multipleValidateMessageLengthRef.current = multipleValidateMessageLength;
        return lines;
      }
    }
    const textNode = processRenderer(value);
    return textNode === '' ? tableStore.getConfig('tableDefaultRenderer') : textNode;
  };
  const result = getRenderedValue();
  const text = isEmpty(result) || (isArrayLike(result) && !result.length) ? editorBorder ? undefined : tableStore.getConfig('renderEmpty')('Output') : result;

  const handleFocus = useCallback((e) => {
    if (canFocus) {
      handleMouseEnter(e);
      if (key !== SELECTION_KEY) {
        dataSet.current = record;
      }
      if (hasEditor) {
        showEditor(e.currentTarget);
      }
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
  }, [tableStore, dataSet, record, lock, columnKey, canFocus, hasEditor, showEditor, text]);

  const showTooltip = useCallback((e) => {
    if (field && !(multipleValidateMessageLengthRef.current > 0 || (!field.get('validator', record) && field.get('multiple', record) && toMultipleValue(value, field.get('range', record)).length))) {
      const validationResults = field.getValidationErrorValues(record);
      const message = validationResults && !!validationResults.length && renderValidationResult(validationResults[0]);
      if (!isValidationMessageHidden(message)) {
        showValidationMessage(e, message, getTooltipTheme('validation'), getTooltipPlacement('validation'), tableStore.getConfig);
        return true;
      }
    }
    const element = e.currentTarget;
    if (element && !multiLine && (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(element)))) {
      const { current } = innerRef;
      if (text && current && current.contains(element)) {
        const tooltipConfig: TooltipProps = isObject(tooltipProps) ? tooltipProps : {};
        const duration: number = (tooltipConfig.mouseEnterDelay || 0.1) * 1000;
        show(element, {
          title: text,
          placement: getTooltipPlacement('table-cell') || 'right',
          theme: getTooltipTheme('table-cell'),
          ...tooltipConfig,
        }, duration);
        return true;
      }
    }
    return false;
  }, [getTooltipTheme, getTooltipPlacement, renderValidationResult, isValidationMessageHidden, field, record, tooltip, multiLine, text, innerRef]);
  const handleMouseEnter = useCallback((e) => {
    if (!tableStore.columnResizing && !tooltipShownRef.current && showTooltip(e)) {
      tooltipShownRef.current = true;
    }
  }, [tooltipShownRef, tableStore, showTooltip]);
  const handleMouseLeave = useCallback(() => {
    if (!tableStore.columnResizing && tooltipShownRef.current) {
      const tooltipConfig: TooltipProps = isObject(tooltipProps) ? tooltipProps : {};
      const duration: number = (tooltipConfig.mouseLeaveDelay || 0.1) * 1000;
      hide(duration);
      tooltipShownRef.current = false;
    }
  }, [tooltipShownRef, tableStore]);
  useEffect(() => {
    if (name && inlineEdit && record === currentEditRecord) {
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
  useEffect(() => () => {
    if (tooltipShownRef.current) {
      hide();
      tooltipShownRef.current = false;
    }
  }, [tooltipShownRef]);
  useLayoutEffect(() => {
    const { current } = innerRef;
    const { activeEmptyCell } = tableStore;
    if (current && activeEmptyCell && activeEmptyCell.dataset.index === name && tableStore.dataSet.current === record) {
      delete tableStore.activeEmptyCell;
      if (current.tabIndex === -1) {
        const firstFocusableElement = findFirstFocusableElement(current);
        if (firstFocusableElement) {
          firstFocusableElement.focus();
        }
      } else {
        current.focus();
      }
    }
  }, [record]);
  const innerProps: any = {
    tabIndex: hasEditor && canFocus ? 0 : -1,
    onFocus: handleFocus,
    children: text,
    ref: innerRef,
  };
  const empty = field ? isFieldValueEmpty(
    value,
    field.get('range', record),
    field.get('multiple', record),
    field.get('type', record) === FieldType.object ? field.get('valueField', record) : undefined,
    field.get('type', record) === FieldType.object ? field.get('textField', record) : undefined,
  ) : false;
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
    if (!pristine && field.isDirty(record)) {
      innerClassName.push(`${prefixCls}-inner-dirty`);
    }
    if (!inlineEdit && !cellEditorInCell) {
      inValid = !field.isValid(record);
      field.get('required', record);
      if (inValid) {
        innerClassName.push(`${prefixCls}-inner-invalid`);
      }
    }
    if (editorBorder) {
      if (field.get('required', record) && (empty || !tableStore.getConfig('showRequiredColorsOnlyEmpty'))) {
        innerClassName.push(`${prefixCls}-inner-required`);
      }
      highlight = field.get('highlight', record);
      if (highlight) {
        innerClassName.push(`${prefixCls}-inner-highlight`);
      }
    }
  }
  if (fieldDisabled) {
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
  if (isString(innerProps.children) && innerProps.children.includes('\n') && (rowHeight === 'auto' || height !== undefined && rows === 0)) {
    innerClassName.push(`${prefixCls}-inner-pre`);
  }

  useEffect(() => {
    // 兼容Table Tree模式嵌套过深样式
    const { current } = prefixRef;
    if (current && paddingLeft !== 0) {
      const { parentElement, offsetWidth: prefixWidth } = current;
      if (parentElement) {
        const parentWidth = parentElement.clientWidth;
        if (prefixWidth > parentWidth) {
          setPaddingLeft(Math.max(paddingLeft - (prefixWidth - parentWidth), 0));
        }
      }
    }
  }, [prefixRef, paddingLeft, setPaddingLeft]);

  const indentText = children && (
    <span style={{ paddingLeft: pxToRem(paddingLeft) }} />
  );

  const prefix = children && (
    <span key="prefix" className={`${prefixCls}-prefix`} style={prefixStyle} ref={prefixRef}>
      {indentText}
      {children}
      {checkBox}
    </span>
  );

  const output: ReactNode = (
    <span
      key="output"
      {...innerProps}
      style={innerStyle}
      className={innerClassName.join(' ')}
    />
  );
  return (
    <>
      {prefix}
      {
        highlight ? (column.highlightRenderer || tableStore.cellHighlightRenderer)(transformHighlightProps(highlight, {
          dataSet,
          record,
          name,
        }), output) : output
      }
    </>
  );
};

TableCellInner.displayName = 'TableCellInner';

export default observer(TableCellInner);
