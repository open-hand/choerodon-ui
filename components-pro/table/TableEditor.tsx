import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import { FormField, FormFieldProps } from '../field/FormField';
import TableContext from './TableContext';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { findCell, getColumnKey, getEditorByColumnAndRecord, isRadio } from './utils';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { stopEvent } from '../_util/EventManager';
import { runInAction } from 'mobx';

export interface TableEditorProps extends ElementProps {
  column: ColumnProps;
  rowHeight: number | 'auto';
}

@observer
export default class TableEditor extends Component<TableEditorProps> {
  static displayName = 'TableEditor';

  static propTypes = {
    column: PropTypes.object.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  editorProps?: any;

  editor: FormField<FormFieldProps> | null;

  editing: boolean = false;

  currentEditorName?: string;

  saveRef = (node) => this.editor = node;

  handleEditorKeyEnterDown = (e) => {
    this.showNextEditor(e.shiftKey);
  };

  handleEditorKeyDown = (e) => {
    const { tableStore } = this.context;
    switch (e.keyCode) {
      case KeyCode.ESC:
        if (e.isDefaultPrevented()) {
          break;
        }
      case KeyCode.TAB:
        const { prefixCls, column } = this.props;
        const cell = findCell(tableStore, prefixCls, getColumnKey(column));
        if (cell) {
          cell.focus();
        }
        this.hideEditor();
        break;
      case KeyCode.PAGE_UP:
      case KeyCode.PAGE_DOWN:
        stopEvent(e);
        break;
      default:
    }
    const { editorProps } = this;
    if (editorProps) {
      const { onKeyDown = noop } = editorProps;
      onKeyDown(e);
    }
  };

  handleEditorFocus = () => {
    const { currentEditorName, context: { tableStore } } = this;
    if (!tableStore.currentEditorName && currentEditorName) {
      runInAction(() => {
        tableStore.currentEditorName = currentEditorName;
      });
    }
  };

  handleEditorBlur = (e) => {
    this.hideEditor();
    const { editorProps } = this;
    if (editorProps) {
      const { onBlur = noop } = editorProps;
      onBlur(e);
    }
  };

  hideEditor() {
    if (this.editing) {
      this.context.tableStore.hideEditor();
    }
  }

  showNextEditor(reserve: boolean) {
    if (this.editor) {
      this.editor.blur();
    }
    this.context.tableStore.showNextEditor(this.props.column.name, reserve);
  }

  renderEditor(): ReactElement<FormFieldProps> | undefined {
    const { column, rowHeight } = this.props;
    const { dataSet } = this.context.tableStore;
    const cellEditor = getEditorByColumnAndRecord(column, dataSet.current);
    if (isValidElement(cellEditor) && !isRadio(cellEditor)) {
      this.editorProps = cellEditor.props;
      const { style = {}, ...otherProps } = this.editorProps;
      if (rowHeight !== 'auto') {
        style.height = pxToRem(rowHeight);
      }
      const newEditorProps = {
        ...otherProps,
        style,
        ref: this.saveRef,
        dataSet,
        name: column.name,
        onKeyDown: this.handleEditorKeyDown,
        onEnterDown: this.handleEditorKeyEnterDown,
        onBlur: this.handleEditorBlur,
        tabIndex: -1,
      };
      return cloneElement<FormFieldProps>(cellEditor, newEditorProps);
    }
  }

  render() {
    const editor = this.renderEditor();
    if (editor) {
      const { prefixCls, column, column: { lock, name } } = this.props;
      const props: any = {
        className: `${prefixCls}-editor`,
      };
      const editorProps: any = {};
      const { tableStore } = this.context;
      if (tableStore.currentEditorName === name) {
        this.currentEditorName = name;
        const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
        if (cell) {
          this.editing = true;
          const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = cell;
          props.style = {
            left: pxToRem(offsetLeft + (lock ? tableStore.node.tableBodyWrap.scrollLeft : 0)),
            top: pxToRem(offsetTop),
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
      return (
        <div {...props}>
          {cloneElement(editor, editorProps)}
        </div>
      );
    } else {
      return null;
    }
  }

  componentDidUpdate() {
    if (this.editor && this.editing) {
      this.editor.focus();
    }
  }
}
