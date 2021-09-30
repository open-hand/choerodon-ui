import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import { action, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import raf from 'raf';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Row from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import { FormField, FormFieldProps } from '../field/FormField';
import TableContext from './TableContext';
import { findCell, findIndexedSibling, getColumnKey, getEditorByColumnAndRecord, getEditorByField, isInCellEditor, isStickySupport } from './utils';
import { stopEvent } from '../_util/EventManager';
import { ShowHelp } from '../field/enum';
import autobind from '../_util/autobind';
import { TextAreaProps } from '../text-area/TextArea';
import { ResizeType } from '../text-area/enum';
import { ColumnLock } from './enum';
import transform from '../_util/transform';

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

  static contextType = TableContext;

  editorProps?: any;

  width?: any;

  @observable height?: number;

  @observable rendered?: boolean;

  inTab: boolean = false;

  editor: FormField<FormFieldProps> | null;

  wrap: HTMLDivElement | null;

  originalCssText: string | undefined;

  reaction: IReactionDisposer | undefined;

  cellNode: HTMLSpanElement | undefined;

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

  componentDidMount() {
    const { column } = this.props;
    const {
      tableStore,
    } = this.context;
    const { name } = column;
    const { dataSet, currentEditRecord, editors, inlineEdit, virtual } = tableStore;
    const record = currentEditRecord || dataSet.current;
    const field = dataSet.getField(name);
    if (field && field.get('multiLine', record)) {
      window.addEventListener('click', this.handleWindowClick);
    }
    window.addEventListener('resize', this.handleWindowResize);
    editors.set(name, this);
    if (inlineEdit) {
      this.reaction = reaction(() => tableStore.currentEditRecord, r => r ? raf(() => this.alignEditor()) : this.hideEditor());
    } else if (virtual) {
      this.reaction = reaction(() => tableStore.virtualData, (records) => (
        records.includes(dataSet.current) && this.cellNode ? raf(() => this.alignEditor(this.cellNode)) : this.hideEditor()
      ));
    } else {
      this.reaction = reaction(() => dataSet.current, r => (
        r && this.cellNode ? raf(() => this.alignEditor()) : this.hideEditor()
      ));
    }
  }

  componentWillUnmount() {
    const { column: { name } } = this.props;
    const {
      tableStore: { editors },
    } = this.context;
    editors.delete(name);
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('click', this.handleWindowClick);
    if (this.reaction) {
      this.reaction();
    }
  }

  @autobind
  saveRef(node) {
    this.editor = node;
  }

  @autobind
  saveWrap(node) {
    this.wrap = node;
    if (node) {
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
          const cellNode = !isStickySupport() && column.lock ? findCell(tableStore, getColumnKey(column)) : this.cellNode;
          if (cellNode) {
            cellNode.focus();
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
    if (cellNode && editorProps) {
      const { tableStore, dataSet, inlineEdit, rowHeight } = this.context;
      const { currentEditRecord } = tableStore;
      const { onResize = noop } = editorProps;
      onResize(width, height, target);
      const current = currentEditRecord || dataSet.current;
      if (current && name && (rowHeight !== height || current.getState(`__column_resize_height_${name}`) !== undefined)) {
        current.setState(`__column_resize_height_${name}`, height);
      }
      if (inlineEdit) {
        [...tableStore.editors.values()].forEach((editor) => {
          const editorCellNode = editor.cellNode;
          if (editorCellNode) {
            editor.alignEditor(editorCellNode);
          }
        });
      } else {
        this.alignEditor(cellNode);
      }
    }
  }

  blur() {
    const { editor } = this;
    if (editor) {
      editor.blur();
    }
  }

  focus() {
    const { editor } = this;
    if (editor) {
      editor.focus();
    }
  }

  @action
  alignEditor(cellNode?: HTMLSpanElement | undefined) {
    const { wrap, editor } = this;
    if (!cellNode) {
      const { tableStore } = this.context;
      const { column } = this.props;
      cellNode = findCell(tableStore, getColumnKey(column));
    }
    this.cellNode = cellNode;
    if (cellNode) {
      const { offsetHeight } = cellNode;
      if (offsetHeight !== this.height) {
        this.height = offsetHeight;
      }
      if (!this.rendered) {
        this.rendered = true;
      } else if (editor && wrap) {
        const { offsetWidth } = cellNode;
        const [left, top] = offset(cellNode, wrap.parentElement);
        if (this.originalCssText === undefined) {
          this.originalCssText = wrap.style.cssText;
        }
        const width = pxToRem(offsetWidth);
        if (width !== this.width) {
          this.width = width;
        }
        wrap.style.cssText = `width:${width};${transform(`translate(${pxToRem(left)}, ${pxToRem(top)})`)}`;
        editor.forcePositionChanged();
      }
    }
  }


  @autobind
  hideEditor() {
    this.inTab = false;
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
    }
  }

  showNextEditor(reserve: boolean) {
    this.blur();
    const { tableStore } = this.context;
    const { column } = this.props;
    tableStore.showNextEditor(column.name, reserve);
    this.alignEditor();
    this.focus();
  }

  /**
   * 渲染多行编辑单元格
   */
  renderMultiLineEditor(): ReactElement<FormFieldProps> | undefined {
    const { column: { name } } = this.props;
    const {
      prefixCls,
      dataSet,
      inlineEdit,
      rowHeight,
      tableStore: { currentEditRecord },
    } = this.context;
    const record = currentEditRecord || dataSet.current;
    const multiLineFields = [...dataSet.fields.entries()].map(([key, field]) => {
      const bind = field.get('bind', record);
      if (bind && bind.split('.')[0] === name) {
        return record.fields.get(key) || field;
      }
      return null;
    }).filter(f => f);
    if (multiLineFields && multiLineFields.length) {
      return (
        <div>
          {multiLineFields.map((field, index) => {
            if (field) {
              const { name: fieldName } = field;
              const editor = getEditorByField(field, record);
              this.editorProps = editor.props;
              const { style = {}, ...otherProps } = this.editorProps;
              if (rowHeight !== 'auto') {
                style.height = pxToRem(rowHeight);
              }
              const newEditorProps = {
                ...otherProps,
                style,
                ref: index === 0 ? this.saveRef : undefined,
                record,
                name: fieldName,
                onKeyDown: this.handleEditorKeyDown,
                onEnterDown: this.handleEditorKeyEnterDown,
                onClick: this.handleEditorClick,
                tabIndex: -1,
                showHelp: ShowHelp.none,
                // 目前测试inline时候需要放开限制
                _inTable: !inlineEdit,
              };
              const label = field.get('label', record);
              return (
                <Row key={`${record?.index}-multi-${fieldName}`} className={`${prefixCls}-multi`}>
                  {label && <Col span={8} className={`${prefixCls}-multi-label`}>{label}</Col>}
                  <Col span={label ? 16 : 24} className={`${prefixCls}-multi-value`}>{cloneElement<FormFieldProps>(editor, newEditorProps)}</Col>
                </Row>
              );
            }
            return null;
          })}
        </div>
      );
    }
  }

  renderEditor(): ReactElement<FormFieldProps> | undefined {
    const { column } = this.props;
    const {
      dataSet,
      pristine,
      inlineEdit,
      tableStore: { currentEditRecord, currentEditorName },
    } = this.context;
    const { name } = column;
    const record = currentEditRecord || dataSet.current;
    const field = dataSet.getField(name);
    // 多行编辑拦截返回渲染器
    if (!pristine && field && field.get('multiLine', record)) {
      return this.renderMultiLineEditor();
    }
    const cellEditor = getEditorByColumnAndRecord(column, dataSet, record);
    if (!pristine && isValidElement(cellEditor) && !isInCellEditor(cellEditor)) {
      this.editorProps = cellEditor.props;
      const { height } = this;
      const { style = {}, ...otherProps } = this.editorProps;
      if (height !== undefined) {
        style.height = pxToRem(height);
      }
      const newEditorProps = {
        ...otherProps,
        style,
        ref: this.saveRef,
        record,
        name,
        onKeyDown: this.handleEditorKeyDown,
        onEnterDown: isTextArea(cellEditor) ? undefined : this.handleEditorKeyEnterDown,
        onBlur: this.handleEditorBlur,
        tabIndex: currentEditorName ? 0 : -1,
        showHelp: ShowHelp.none,
        // 目前测试inline时候需要放开限制
        _inTable: !inlineEdit,
        preventRenderer: true,
      };
      return cloneElement<FormFieldProps>(cellEditor, newEditorProps);
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
        const editorProps: any = {};
        if (isTextArea(editor)) {
          const { resize = ResizeType.vertical } = editor.props;
          editorProps.resize = resize;
          if (resize !== ResizeType.none) {
            editorProps.onResize = this.handleEditorResize;
          }
        }
        return <div {...props} ref={this.saveWrap}>{cloneElement(editor, editorProps)}</div>;
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
