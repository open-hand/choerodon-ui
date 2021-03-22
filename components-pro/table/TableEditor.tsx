import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { runInAction } from 'mobx';
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
import { findCell, findIndexedSibling, getColumnKey, getEditorByColumnAndRecord, getEditorByField, isRadio, isStickySupport } from './utils';
import { stopEvent } from '../_util/EventManager';
import { ShowHelp } from '../field/enum';
import autobind from '../_util/autobind';

export interface TableEditorProps extends ElementProps {
  column: ColumnProps;
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

  // find this parent tr node
  parentTrNode?: (Node & ParentNode) | null | undefined;

  editing: boolean = false;

  currentEditorName?: string;

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
    const { prefixCls } = this.props;
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
    const { parentTrNode: currentElementSibling, context: { tableStore } } = this;
    const { column: { name } } = this.props;
    const { dataSet } = tableStore;
    if (currentElementSibling && tableStore && dataSet) {
      const previousElementSibling = findIndexedSibling(currentElementSibling, -1);
      if (previousElementSibling) {
        const { index } = previousElementSibling.dataset;
        const { index: currentIndex } = (currentElementSibling as HTMLTableRowElement).dataset;
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
          const { prefixCls, column } = this.props;
          const cell = findCell(tableStore, prefixCls, getColumnKey(column));
          if (cell) {
            cell.focus();
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
    const { column: { name }, prefixCls } = this.props;
    const {
      tableStore: { dataSet, currentEditRecord, rowHeight, inlineEdit },
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
                ref: index === 0 ? this.saveRef : '',
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
    const { column } = this.props;
    const {
      tableStore: { dataSet, currentEditRecord, rowHeight, pristine, inlineEdit },
    } = this.context;
    const record = currentEditRecord || dataSet.current;
    const field = record?.getField(column.name);
    // 多行编辑拦截返回渲染器
    if (!pristine && field && field.get('multiLine')) {
      return this.renderMultiLineEditor();
    }
    const cellEditor = getEditorByColumnAndRecord(column, record);
    if (!pristine && isValidElement(cellEditor) && !isRadio(cellEditor)) {
      this.editorProps = cellEditor.props;
      const { style = {}, ...otherProps } = this.editorProps;
      if (rowHeight !== 'auto') {
        style.height = pxToRem(rowHeight);
      }
      const newEditorProps = {
        ...otherProps,
        style,
        ref: this.saveRef,
        record,
        name: column.name,
        onKeyDown: this.handleEditorKeyDown,
        onEnterDown: this.handleEditorKeyEnterDown,
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
        prefixCls,
        column,
        column: { lock, name },
      } = this.props;
      const props: any = {
        className: classNames(`${prefixCls}-editor`, { [`${prefixCls}-editor-lock`]: isStickySupport() && lock }),
      };
      const editorProps: any = {};
      const { tableStore } = this.context;
      if (tableStore.currentEditorName === name || tableStore.currentEditRecord) {
        this.currentEditorName = name;
        const cell: HTMLTableCellElement | undefined = findCell(tableStore, prefixCls, getColumnKey(column), !isStickySupport() && lock);
        if (cell) {
          this.editing = true;
          const parentNode: HTMLTableRowElement | null = cell.parentNode as (HTMLTableRowElement | null);
          this.parentTrNode = parentNode && parentNode.parentNode;
          const { offsetLeft, offsetTop, offsetWidth, offsetHeight, offsetParent } = cell;
          const left = parentNode && offsetParent === parentNode ? parentNode.offsetLeft : offsetLeft;
          const top = parentNode && offsetParent === parentNode ? parentNode.offsetTop : offsetTop;
          props.style = {
            left: pxToRem(left),
            top: pxToRem(top),
          };
          editorProps.style = {
            ...editor.props.style,
            width: pxToRem(offsetWidth),
            height: pxToRem(offsetHeight),
          };
        }
      } else if (this.editing) {
        this.editing = false;
        editorProps.onFocus = this.handleEditorFocus;
      }
      return <div {...props}>{cloneElement(editor, editorProps)}</div>;
    }
    return null;
  }

  componentDidUpdate() {
    const {
      column: { name },
    } = this.props;
    const { tableStore } = this.context;
    if (this.editor && this.editing && tableStore.currentEditorName === name) {
      this.editor.focus();
    }
  }
}
