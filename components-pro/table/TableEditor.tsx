import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import { action, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import raf from 'raf';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Row, { RowProps } from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import { FormField, FormFieldProps } from '../field/FormField';
import TableContext, { TableContextValue } from './TableContext';
import {
  findCell,
  findIndexedSibling,
  findRow,
  getColumnKey,
  getEditorByColumnAndRecord,
  getEditorByField,
  isInCellEditor,
  isStickySupport,
} from './utils';
import { stopEvent } from '../_util/EventManager';
import { ShowHelp } from '../field/enum';
import autobind from '../_util/autobind';
import { TextAreaProps } from '../text-area/TextArea';
import { ResizeType } from '../text-area/enum';
import { ColumnLock } from './enum';
import transform from '../_util/transform';
import { LabelLayout, ShowValidation } from '../form/enum';

export interface TableEditorProps extends ElementProps {
  column: ColumnProps;
}

function isTextArea(editor: ReactElement<FormFieldProps>): editor is ReactElement<TextAreaProps> {
  return (editor.type as any).__PRO_TEXTAREA;
}

function isHTMLElement(el): el is HTMLElement {
  return el;
}

function offset(node: HTMLElement, topNode: HTMLElement | null, initialize: [number, number] = [node.offsetLeft, node.offsetTop]): [number, number] {
  if (topNode) {
    const { offsetParent } = node;
    if (isHTMLElement(offsetParent)) {
      if (offsetParent === topNode) {
        return initialize;
      }
      return offset(offsetParent, topNode, [offsetParent.offsetLeft + initialize[0], offsetParent.offsetTop + initialize[1]]);
    }
  }
  return initialize;
}

@observer
export default class TableEditor extends Component<TableEditorProps> {
  static displayName = 'TableEditor';

  static get contextType(): typeof TableContext {
    return TableContext;
  }

  context: TableContextValue;

  editorProps?: any;

  width?: any;

  @observable height?: number;

  @observable rendered?: boolean;

  inTab = false;

  keep?: boolean;

  editor: FormField<FormFieldProps> | null;

  wrap: HTMLDivElement | null;

  originalCssText: string | undefined;

  reaction: IReactionDisposer | undefined;

  cellNode: HTMLSpanElement | undefined;

  tdNode: HTMLTableDataCellElement | null | undefined;

  get lock(): ColumnLock | boolean | undefined {
    const { column } = this.props;
    return column.lock;
  }

  @autobind
  handleWindowResize() {
    if (this.cellNode) {
      this.alignEditor();
    }
  }

  /**
   * 触发多行编辑器失焦切换编辑/只读模式
   * @param e
   */
  @autobind
  handleWindowClick(e) {
    const { prefixCls } = this.context;
    if (e.target.className !== `${prefixCls}-content` && e.target.className !== `${prefixCls}-body`) {
      this.handleEditorBlur(e);
    }
  }

  connect() {
    this.disconnect();
    const {
      tableStore,
    } = this.context;
    const { dataSet, virtual } = tableStore;
    if (virtual) {
      this.reaction = reaction(() => [tableStore.virtualVisibleStartIndex, tableStore.virtualVisibleEndIndex], () => {
        const { current } = dataSet;
        if (current && findRow(tableStore, current)) {
          const { cellNode, keep } = this;
          if (cellNode || keep) {
            raf(() => {
              this.alignEditor(cellNode);
              if (keep) {
                delete this.keep;
              }
            });
          }
        } else if (!this.keep) {
          this.hideEditor(true);
        }
      });
    } else {
      this.reaction = reaction(() => dataSet.current, r => (
        r && this.cellNode ? raf(() => this.alignEditor()) : this.hideEditor()
      ));
    }
  }

  disconnect() {
    if (this.reaction) {
      this.reaction();
    }
  }

  componentDidMount() {
    const { column: { name } } = this.props;
    if (name) {
      const {
        tableStore,
      } = this.context;
      const { dataSet, currentEditRecord, editors } = tableStore;
      const record = currentEditRecord || dataSet.current;
      const field = dataSet.getField(name);
      if (field && field.get('multiLine', record)) {
        window.addEventListener('click', this.handleWindowClick);
      }
      window.addEventListener('resize', this.handleWindowResize);
      if (tableStore.inlineEdit) {
        this.reaction = reaction(() => tableStore.currentEditRecord, r => r ? raf(() => this.alignEditor()) : this.hideEditor());
      }
      editors.set(name, this);
    }
  }

  componentWillUnmount() {
    const { column: { name } } = this.props;
    if (name) {
      const { tableStore: { editors } } = this.context;
      editors.delete(name);
      window.removeEventListener('resize', this.handleWindowResize);
      window.removeEventListener('click', this.handleWindowClick);
      this.disconnect();
    }
  }

  @autobind
  saveRef(node) {
    this.editor = node;
  }

  @autobind
  saveWrap(node) {
    this.wrap = node;
    const { tableStore: {
      inlineEdit,
      currentEditRecord,
    } } = this.context;
    if (node && (!inlineEdit || currentEditRecord)) {
      this.alignEditor(this.cellNode);
    }
  }

  @autobind
  handleEditorKeyEnterDown(e) {
    const { tableStore } = this.context;
    const editorNextKeyEnterDown = tableStore.editorNextKeyEnterDown;
    if (!e.isDefaultPrevented() && editorNextKeyEnterDown) {
      this.showNextEditor(e.shiftKey);
    }
  }

  // copy the previous tr value to to this cell value
  @autobind
  handleKeyDownCTRLD(e) {
    e.preventDefault();
    const { cellNode, context: { tableStore } } = this;
    const { column: { name } } = this.props;
    const { dataSet } = tableStore;
    if (cellNode && tableStore && dataSet) {
      const parentTdNode = cellNode.parentNode;
      if (parentTdNode) {
        const parentTrNode = parentTdNode.parentNode;
        if (parentTrNode) {
          const previousElementSibling = findIndexedSibling(parentTrNode, -1);
          if (previousElementSibling) {
            const { index } = previousElementSibling.dataset;
            const { index: currentIndex } = (parentTrNode as HTMLTableRowElement).dataset;
            if (index && currentIndex) {
              const record = dataSet.findRecordById(index);
              const currentRecord = dataSet.findRecordById(currentIndex);
              if (record && currentRecord && tableStore) {
                const cloneRecordData = record.clone().toData() || {};
                const dealCloneRecordData = {};
                if (name) {
                  dealCloneRecordData[name] = cloneRecordData[name];
                  currentRecord.set(dealCloneRecordData);
                }
              }
            }
          }
        }
      }
    }
  }

  @autobind
  handleKeyDownCTRLS(e) {
    e.preventDefault();
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.submit();
  }

  @autobind
  handleEditorKeyDown(e) {
    if (![KeyCode.ESC, KeyCode.TAB].includes(e.keyCode) || !e.isDefaultPrevented()) {
      const ctrlKey = e.ctrlKey || e.metaKey;
      const { tableStore } = this.context;
      const { keyboard } = tableStore;
      switch (e.keyCode) {
        case KeyCode.ESC:
          this.blur();
          break;
        case KeyCode.TAB: {
          this.inTab = true;
          const { column } = this.props;
          const cellNode = !isStickySupport() && column.lock ? findCell(tableStore, getColumnKey(column), undefined, undefined, true) : this.cellNode;
          if (cellNode && cellNode.parentElement) {
            cellNode.focus();
          } else {
            const { tdNode } = this;
            if (tdNode) {
              tdNode.focus();
              this.hideEditor();
            }
          }
          break;
        }
        case KeyCode.PAGE_UP:
        case KeyCode.PAGE_DOWN:
          stopEvent(e);
          break;
        case KeyCode.D:
          if (ctrlKey === true && keyboard) this.handleKeyDownCTRLD(e);
          break;
        case KeyCode.S:
          if (ctrlKey === true && keyboard) this.handleKeyDownCTRLS(e);
          break;
        default:
      }
    }
    const { editorProps } = this;
    if (editorProps) {
      const { onKeyDown = noop } = editorProps;
      onKeyDown(e);
    }
  }

  @autobind
  handleEditorBlur(e) {
    const { editorProps, inTab, context: { tableStore: { inlineEdit } } } = this;
    if (!inTab && !inlineEdit) {
      this.hideEditor();
    }
    if (editorProps) {
      const { onBlur = noop } = editorProps;
      onBlur(e);
    }
  }

  /**
   * 多行编辑切换编辑器阻止冒泡
   * @param e
   */
  @autobind
  handleEditorClick(e) {
    const { editorProps } = this;
    if (editorProps) {
      const { onClick = noop } = editorProps;
      onClick(e);
    }
    stopEvent(e);
  }

  @autobind
  handleEditorResize(width, height, target) {
    const { editorProps, cellNode } = this;
    const { column: { name } } = this.props;
    if (editorProps) {
      const { tableStore, dataSet, inlineEdit, rowHeight } = this.context;
      const { currentEditRecord } = tableStore;
      const { onResize = noop } = editorProps;
      onResize(width, height, target);
      const current = currentEditRecord || dataSet.current;
      if (current && name && (rowHeight !== height || current.getState(`__column_resize_height_${name}`) !== undefined)) {
        current.setState(`__column_resize_height_${name}`, height);
      }
      if (inlineEdit) {
        raf(() => {
          tableStore.editors.forEach((editor) => {
            const editorCellNode = editor.cellNode;
            if (editorCellNode) {
              editor.alignEditor(editorCellNode, editor === this ? height : undefined);
            }
          });
        });
      } else if (cellNode) {
        this.alignEditor(cellNode, height);
      }
    }
  }

  blur() {
    const { editor } = this;
    if (editor && editor.blur) {
      editor.blur();
    }
  }

  focus() {
    const { editor } = this;
    if (editor && editor.focus) {
      editor.focus();
    }
  }

  @action
  alignEditor(cellNode?: HTMLSpanElement | undefined, height?: number) {
    const { wrap, editor } = this;
    const { tableStore } = this.context;
    if (!cellNode || !cellNode.offsetParent) {
      const { column } = this.props;
      cellNode = findCell(tableStore, getColumnKey(column), undefined, undefined, true);
    }
    if (!this.cellNode && !tableStore.inlineEdit) {
      this.connect();
    }
    this.cellNode = undefined;
    if (cellNode) {
      const { parentElement } = cellNode;
      this.tdNode = parentElement as HTMLTableDataCellElement | null;
      if (parentElement) {
        this.cellNode = cellNode;
        if (height === undefined) {
          const { offsetHeight } = cellNode;
          if (offsetHeight !== this.height) {
            this.height = offsetHeight;
          }
        } else {
          this.height = height;
        }
        if (!this.rendered) {
          this.rendered = true;
        } else if (wrap) {
          const { offsetWidth } = cellNode;
          const [left, top] = offset(cellNode, wrap.parentElement);
          if (this.originalCssText === undefined) {
            this.originalCssText = wrap.style.cssText;
          }
          const width = pxToRem(offsetWidth, true);
          if (width !== this.width) {
            this.width = width;
          }
          wrap.style.cssText = `width:${width};${transform(`translate(${pxToRem(left, true)}, ${pxToRem(top, true)})`)}`;
          if (editor && editor.forcePositionChanged) {
            editor.forcePositionChanged();
          }
        }
      }
    }
  }

  @autobind
  hideEditor(keep?: boolean) {
    this.inTab = false;
    if (keep) {
      this.keep = true;
    }
    if (this.cellNode) {
      const { tableStore } = this.context;
      tableStore.hideEditor();
      const { wrap } = this;
      if (wrap) {
        if (this.originalCssText !== undefined) {
          wrap.style.cssText = `width:${this.width};${this.originalCssText}`;
          this.originalCssText = undefined;
        }
      }
      this.cellNode = undefined;
      if (!keep && !tableStore.inlineEdit) {
        this.disconnect();
      }
    }
  }

  showNextEditor(reserve: boolean) {
    const { column: { name } } = this.props;
    if (name) {
      this.blur();
      const { tableStore } = this.context;
      if (tableStore.showNextEditor(name, reserve)) {
        this.alignEditor();
        this.focus();
      }
    }
  }

  /**
   * 渲染多行编辑单元格
   */
  renderMultiLineEditor(): ReactElement<FormFieldProps> | undefined {
    const { column: { name } } = this.props;
    if (name) {
      const {
        prefixCls,
        dataSet,
        inlineEdit,
        rowHeight,
        tableStore: { currentEditRecord },
      } = this.context;
      const record = currentEditRecord || dataSet.current;
      if (record) {
        const multiLineFields: ReactElement<RowProps>[] = [];
        let ref = true;
        dataSet.fields.forEach((dsField, fieldName) => {
          const bind = dsField.get('bind', record);
          if (bind && bind.split('.')[0] === name) {
            const field = record.fields.get(fieldName) || dsField;
            const editor = getEditorByField(field, record);
            this.editorProps = editor.props;
            const { style = {}, ...otherProps } = this.editorProps;
            if (rowHeight !== 'auto') {
              style.height = pxToRem(rowHeight);
            }
            const newEditorProps = {
              ...otherProps,
              style,
              ref: ref ? this.saveRef : undefined,
              record,
              name: fieldName,
              onKeyDown: this.handleEditorKeyDown,
              onEnterDown: this.handleEditorKeyEnterDown,
              onClick: this.handleEditorClick,
              tabIndex: -1,
              showHelp: ShowHelp.none,
              showValidation: ShowValidation.tooltip,
              labelLayout: LabelLayout.none,
              // 目前测试inline时候需要放开限制
              _inTable: !inlineEdit,
              preventRenderer: true,
            };
            ref = false;
            const label = field.get('label', record);
            const key = `${record.index}-multi-${fieldName}`;
            multiLineFields.push(
              <Row key={key} className={`${prefixCls}-multi`}>
                {label && <Col span={8} className={`${prefixCls}-multi-label`}>{label}</Col>}
                <Col span={label ? 16 : 24} className={`${prefixCls}-multi-value`}>{cloneElement<FormFieldProps>(editor, newEditorProps)}</Col>
              </Row>,
            );
          }
        });
        if (multiLineFields.length) {
          return <div>{multiLineFields}</div>;
        }
      }
    }
  }

  renderEditor(): ReactElement<FormFieldProps> | undefined {
    const { column } = this.props;
    const { name } = column;
    if (name) {
      const {
        dataSet,
        pristine,
        inlineEdit,
        tableStore: { currentEditRecord, currentEditorName, getColumnTagRenderer },
        rowHeight,
      } = this.context;
      const record = currentEditRecord || dataSet.current;
      const field = dataSet.getField(name);
      // 多行编辑拦截返回渲染器
      if (!pristine && field && field.get('multiLine', record)) {
        return this.renderMultiLineEditor();
      }
      const cellEditor = getEditorByColumnAndRecord(column, record);
      if (!pristine && isValidElement(cellEditor) && !isInCellEditor(cellEditor)) {
        this.editorProps = cellEditor.props;
        const { height } = this;
        const { style = {}, tagRenderer: editorTagRenderer, ...otherProps } = this.editorProps;
        const tagRenderer = editorTagRenderer || getColumnTagRenderer(column);
        if (height !== undefined) {
          style.height = pxToRem(height, true);
        }
        const newEditorProps = {
          ...otherProps,
          style,
          ref: this.saveRef,
          record,
          name,
          tagRenderer,
          onKeyDown: this.handleEditorKeyDown,
          onEnterDown: isTextArea(cellEditor) ? undefined : this.handleEditorKeyEnterDown,
          onBlur: this.handleEditorBlur,
          tabIndex: currentEditorName ? 0 : -1,
          showHelp: ShowHelp.none,
          showValidation: ShowValidation.tooltip,
          labelLayout: LabelLayout.none,
          // 目前测试inline时候需要放开限制
          _inTable: !inlineEdit,
          preventRenderer: true,
        };
        if (isTextArea(cellEditor)) {
          const resize = newEditorProps.resize || cellEditor.props.resize || ResizeType.vertical;
          newEditorProps.resize = resize;
          if (resize !== ResizeType.none) {
            newEditorProps.onResize = this.handleEditorResize;
            if (rowHeight === 'auto' && !newEditorProps?.autoSize) {
              newEditorProps.autoSize = true;
            }
          }
        }
        return cloneElement<FormFieldProps>(cellEditor, newEditorProps);
      }
    }
    this.cellNode = undefined;
  }

  render() {
    if (this.rendered) {
      const editor = this.renderEditor();
      if (editor) {
        const {
          column: { lock },
        } = this.props;
        const { prefixCls } = this.context;
        const props: any = {
          className: classNames(`${prefixCls}-editor`, { [`${prefixCls}-editor-lock`]: isStickySupport() && lock }),
        };
        return <div {...props} ref={this.saveWrap}>{editor}</div>;
      }
      const { tableStore } = this.context;
      if (!tableStore.inlineEdit) {
        runInAction(() => {
          this.rendered = false;
        });
      }
    }
    return null;
  }
}
