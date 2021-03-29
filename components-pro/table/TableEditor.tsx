import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
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

export interface TableEditorProps extends ElementProps {
  column: ColumnProps;
}

function isTextArea(editor: ReactElement<FormFieldProps>): editor is ReactElement<TextAreaProps> {
  return (editor.type as any).__PRO_TEXTAREA;
}

@observer
export default class TableEditor extends Component<TableEditorProps> {
  static displayName = 'TableEditor';

  static propTypes = {
    column: PropTypes.object.isRequired,
  };

  static contextType = TableContext;

  editorProps?: any;

  editor: FormField<FormFieldProps> | null;

  wrap: HTMLDivElement | null;

  @observable observableProps: any;

  @computed
  get cellNode(): HTMLSpanElement | undefined {
    const { tableStore } = this.context;
    const { column } = this.observableProps;
    if (tableStore.currentEditorName === column.name || tableStore.currentEditRecord) {
      return findCell(tableStore, tableStore.prefixCls, getColumnKey(column), !isStickySupport() && column.lock);
    }
    return undefined;
  }

  @computed
  get editing(): boolean {
    return !!this.cellNode;
  }

  @computed
  get currentEditorName(): string | undefined {
    if (this.cellNode) {
      const { column: { name } } = this.observableProps;
      return name;
    }
    return undefined;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.setObservableProps(props, context);
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.updateObservableProps(nextProps, nextContext);
  }


  getObservableProps(props, _context: any) {
    return {
      column: props.column,
    };
  }

  @action
  setObservableProps(props, context: any) {
    this.observableProps = this.getObservableProps(props, context);
  }

  @action
  updateObservableProps(props, context: any) {
    Object.assign(
      this.observableProps,
      this.getObservableProps(props, context),
    );
  }

  @autobind
  onWindowResize() {
    this.forceUpdate();
  }

  /**
   * 触发多行编辑器失焦切换编辑/只读模式
   * @param e
   */
  @autobind
  onWindowClick(e) {
    const { tableStore: { prefixCls } } = this.context;
    if (e.target.className !== `${prefixCls}-content` && e.target.className !== `${prefixCls}-body`) {
      this.handleEditorBlur(e);
    }
  }

  componentDidMount() {
    const { column: { name } } = this.props;
    const {
      tableStore: { dataSet, currentEditRecord },
    } = this.context;
    const record = currentEditRecord || dataSet.current;
    const field = record?.getField(name) || dataSet.getField(name);
    if (field?.get('multiLine')) {
      window.addEventListener('click', this.onWindowClick);
    }
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('click', this.onWindowClick);
  }

  @autobind
  saveRef(node) {
    this.editor = node;
    if (node) {
      node.focus();
    }
  }

  @autobind
  saveWrap(node) {
    this.wrap = node;
  }

  alignEditor() {
    const { editing, wrap, cellNode } = this;
    if (editing && wrap && cellNode) {
      const { offsetTop, offsetParent } = cellNode;
      const parentNode: HTMLTableCellElement | null = cellNode.parentNode as (HTMLTableCellElement | null);
      wrap.style.top = pxToRem(parentNode && offsetParent === parentNode ? parentNode.offsetTop + offsetTop : offsetTop)!;
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
    const ctrlKey = e.ctrlKey || e.metaKey;
    if (e.keyCode !== KeyCode.ESC || !e.isDefaultPrevented()) {
      const { tableStore } = this.context;
      const { keyboard } = tableStore;
      switch (e.keyCode) {
        case KeyCode.ESC:
        case KeyCode.TAB: {
          const { cellNode } = this;
          if (cellNode) {
            cellNode.focus();
          }
          this.hideEditor();
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
  handleEditorFocus() {
    const {
      currentEditorName,
      context: { tableStore },
    } = this;
    if (!tableStore.currentEditorName && currentEditorName) {
      runInAction(() => {
        tableStore.currentEditorName = currentEditorName;
      });
    }
  }

  @autobind
  handleEditorBlur(e) {
    this.hideEditor();
    const { editorProps } = this;
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
    const { editorProps } = this;
    const { column: { name } } = this.props;
    const { tableStore: { currentEditRecord, dataSet, rowHeight } } = this.context;
    if (editorProps) {
      const { onResize = noop } = editorProps;
      onResize(width, height, target);
      const current = currentEditRecord || dataSet.current;
      if (current && name && (rowHeight !== height || current.getState(`__column_resize_height_${name}`) !== undefined)) {
        current.setState(`__column_resize_height_${name}`, height);
      }
      if (currentEditRecord) {
        currentEditRecord.setState('__column_resize_height', height);
      }
      this.alignEditor();
    }
  }

  @autobind
  hideEditor() {
    if (this.editing) {
      const { tableStore } = this.context;
      tableStore.hideEditor();
    }
  }

  showNextEditor(reserve: boolean) {
    if (this.editor) {
      this.editor.blur();
    }
    const { tableStore } = this.context;
    const { column } = this.props;
    tableStore.showNextEditor(column.name, reserve);
  }

  /**
   * 渲染多行编辑单元格
   */
  renderMultiLineEditor(): ReactElement<FormFieldProps> | undefined {
    const { column: { name } } = this.props;
    const {
      tableStore: { dataSet, currentEditRecord, rowHeight, inlineEdit, prefixCls },
    } = this.context;
    const record = currentEditRecord || dataSet.current;
    const multiLineFields = dataSet.props.fields.map(field => {
      if (field.bind && field.bind.split('.')[0] === name) {
        return record.getField(field.name) || dataSet.getField(field.name);
      }
      return null;
    }).filter(f => f);
    if (multiLineFields && multiLineFields.length) {
      return (
        <div>
          {multiLineFields.map((fields, index) => {
            if (fields) {
              const editor = getEditorByField(fields);
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
                name: fields.get('name'),
                onKeyDown: this.handleEditorKeyDown,
                onEnterDown: this.handleEditorKeyEnterDown,
                onClick: this.handleEditorClick,
                tabIndex: -1,
                showHelp: ShowHelp.none,
                // 目前测试inline时候需要放开限制
                _inTable: !inlineEdit,
              };
              const label = fields.get('label');
              return (
                <Row key={`${record?.index}-multi-${fields.get('name')}`} className={`${prefixCls}-multi`}>
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
    const { column } = this.observableProps;
    const {
      tableStore: { dataSet, currentEditRecord, currentEditorName, rowHeight, pristine, inlineEdit },
    } = this.context;
    const { name } = column;
    const record = currentEditRecord || dataSet.current;
    const field = record?.getField(name);
    // 多行编辑拦截返回渲染器
    if (!pristine && field && field.get('multiLine')) {
      return this.renderMultiLineEditor();
    }
    const cellEditor = getEditorByColumnAndRecord(column, record);
    if (!pristine && isValidElement(cellEditor) && !isInCellEditor(cellEditor)) {
      this.editorProps = cellEditor.props;
      const { style = {}, ...otherProps } = this.editorProps;
      if (rowHeight !== 'auto') {
        style.height = pxToRem(rowHeight);
      }
      const newEditorProps = {
        ...otherProps,
        style,
        ref: currentEditorName === name ? this.saveRef : undefined,
        record,
        name,
        onKeyDown: this.handleEditorKeyDown,
        onEnterDown: isTextArea(cellEditor) ? undefined : this.handleEditorKeyEnterDown,
        onBlur: this.handleEditorBlur,
        tabIndex: -1,
        showHelp: ShowHelp.none,
        // 目前测试inline时候需要放开限制
        _inTable: !inlineEdit,
      };
      return cloneElement<FormFieldProps>(cellEditor, newEditorProps);
    }
  }

  render() {
    const editor = this.renderEditor();
    if (editor) {
      const {
        column: { lock, name },
      } = this.observableProps;
      const { tableStore } = this.context;
      const { prefixCls, currentEditRecord, currentEditorName } = tableStore;
      const props: any = {
        className: classNames(`${prefixCls}-editor`, { [`${prefixCls}-editor-lock`]: isStickySupport() && lock }),
      };
      const editorProps: any = {};
      const { cellNode } = this;
      if (cellNode) {
        if (isTextArea(editor) && !editor.props.resize) {
          const { rowHeight } = tableStore;
          editorProps.resize = ResizeType.vertical;
          if (rowHeight !== 'auto') {
            editorProps.style = {
              ...editor.props.style,
              minHeight: pxToRem(rowHeight),
            };
          }
          editorProps.onResize = this.handleEditorResize;
        }
        const parentNode: HTMLTableCellElement | null = cellNode.parentNode as (HTMLTableCellElement | null);
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight, offsetParent } = cellNode;
        const left = parentNode && offsetParent === parentNode ? parentNode.offsetLeft + offsetLeft : offsetLeft;
        const top = parentNode && offsetParent === parentNode ? parentNode.offsetTop + offsetTop : offsetTop;
        props.style = {
          left: pxToRem(left),
          top: pxToRem(top),
        };
        // reposition in inline-edit
        if (currentEditRecord && currentEditorName !== name && currentEditRecord.getState('__column_resize_height')) {
          editorProps.style = {};
        }
        editorProps.style = {
          ...editor.props.style,
          width: pxToRem(offsetWidth),
          height: pxToRem(offsetHeight),
        };
      } else {
        editorProps.onFocus = this.handleEditorFocus;
      }
      return <div {...props} ref={this.saveWrap}>{cloneElement(editor, editorProps)}</div>;
    }
    return null;
  }
}
