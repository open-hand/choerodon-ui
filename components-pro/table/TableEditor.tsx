import React, { cloneElement, Component, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import { FormField, FormFieldProps } from '../field/FormField';
import TableContext from './TableContext';
import { findCell, getColumnKey, getEditorByColumnAndRecord, isRadio } from './utils';
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

  editing: boolean = false;

  currentEditorName?: string;

  @autobind
  onWindowResize() {
    this.forceUpdate();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
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

  @autobind
  handleEditorKeyDown(e) {
    if (e.keyCode !== KeyCode.ESC || !e.isDefaultPrevented()) {
      const { tableStore } = this.context;
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

  renderEditor(): ReactElement<FormFieldProps> | undefined {
    const { column } = this.props;
    const {
      tableStore: { dataSet, currentEditRecord, rowHeight, pristine },
    } = this.context;
    const record = currentEditRecord || dataSet.current;
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
        _inTable: true,
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
        className: `${prefixCls}-editor`,
      };
      const editorProps: any = {};
      const { tableStore } = this.context;
      if (tableStore.currentEditorName === name || tableStore.currentEditRecord) {
        this.currentEditorName = name;
        const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
        if (cell) {
          this.editing = true;
          const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = cell;
          props.style = {
            left: pxToRem(offsetLeft),
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
