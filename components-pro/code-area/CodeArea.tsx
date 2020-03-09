import React, { ComponentClass, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { EditorConfiguration } from 'codemirror';
import { IControlledCodeMirror as CodeMirrorProps, IInstance } from 'react-codemirror2';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ObserverFormField from '../field';
import { FormFieldProps } from '../field/FormField';
import { CodeAreaFormatter } from './CodeAreaFormatter';
import autobind from '../_util/autobind';

let CodeMirror: ComponentClass<CodeMirrorProps>;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  CodeMirror = require('react-codemirror2').Controlled;
}

export interface CodeAreaProps extends FormFieldProps {
  options?: EditorConfiguration;
  formatHotKey?: string;
  unFormatHotKey?: string;
  formatter?: CodeAreaFormatter;
}

const defaultCodeMirrorOptions: EditorConfiguration = {
  theme: 'neat',
  lineNumbers: true,
  lint: true,
  gutters: ['CodeMirror-lint-markers'],
};

@observer
export default class CodeArea extends ObserverFormField<CodeAreaProps> {
  static displayName = 'CodeArea';

  static propTypes = {
    options: PropTypes.object,
    formatHotKey: PropTypes.string,
    unFormatHotKey: PropTypes.string,
    formatter: PropTypes.object,
    ...ObserverFormField.propTypes,
  };

  static defaultProps = {
    ...ObserverFormField.defaultProps,
    suffixCls: 'code-area',
    formatHotKey: 'Alt-F',
    unFormatHotKey: 'Alt-R',
  };

  cmOptions: EditorConfiguration = this.getCodeMirrorOptions();

  @observable text?: string;

  emptyValue?: any = '';

  @autobind
  handleBeforeChange(_editor, _data, value) {
    this.setText(value);
  }

  @autobind
  handleCodeMirrorKeyDown(cm, e) {
    const { onKeyDown = noop, onEnterDown = noop } = this.props;
    switch (e.keyCode) {
      case KeyCode.ENTER:
        onEnterDown(e);
        break;
      case KeyCode.ESC:
        cm.getInputField().blur();
        break;
      default:
    }
    onKeyDown(e);
  }

  getCodeMirrorOptions(options: EditorConfiguration = this.props.options!): EditorConfiguration {
    return { ...defaultCodeMirrorOptions, ...options };
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), ['onChange', 'formatHotKey', 'unFormatHotKey']);
    otherProps.onKeyDown = this.handleCodeMirrorKeyDown;
    return otherProps;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { options } = nextProps;
    if (!isEqual(options, this.props.options)) {
      this.cmOptions = this.getCodeMirrorOptions(options);
    }
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  renderWrapper(): ReactNode {
    if (CodeMirror) {
      this.cmOptions.readOnly = this.isDisabled() ? 'nocursor' : this.isReadOnly();
      const text = this.getTextNode();
      return (
        <div {...this.getWrapperProps()}>
          <label>
            <CodeMirror
              {...this.getOtherProps()}
              value={isString(text) ? text : this.getText(this.getValue())}
              options={this.cmOptions}
              onBeforeChange={this.handleBeforeChange}
              onBlur={this.handleCodeMirrorBlur}
              editorDidMount={this.handleCodeMirrorDidMount}
            />
            {this.renderFloatLabel()}
          </label>
        </div>
      );
    }
  }

  @action
  setText(text?: string): void {
    this.text = text;
  }

  getTextNode(): ReactNode {
    return this.text === undefined ? (super.getTextNode() as string) || '' : this.text;
  }

  @action
  setValue(value: any): void {
    super.setValue(value);
    this.setText(undefined);
  }

  processValue(value: any): string {
    const text = super.processValue(value);
    const { formatter } = this.props;
    return formatter ? formatter.getFormatted(text) : text;
  }

  /**
   * 编辑器失去焦点时，调用父类方法，同步DataSet中的内容
   *
   * @memberof CodeArea
   */
  handleCodeMirrorBlur = (codeMirrorInstance: IInstance) => {
    const { formatter } = this.props;
    // 更新DataSet的值之前，先去拿到原始的raw格式
    const codeMirrorText = codeMirrorInstance.getValue();
    this.setValue(formatter ? formatter.getRaw(codeMirrorText) : codeMirrorText);
  };

  /**
   * 在CodeMirror编辑器实例挂载前添加额外配置
   *
   * @memberof CodeArea
   */
  handleCodeMirrorDidMount = (editor: any) => {
    const { formatter, style, formatHotKey, unFormatHotKey } = this.props;
    const { width = '100%', height = 100 } = style || {};
    const options = {
      Tab(cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection('add'); // 有选中内容时整体缩进
        } else {
          // 使用空格代替缩进
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
          cm.replaceSelection(spaces);
        }
      },
    };
    if (formatter) {
      if (formatHotKey) {
        // default: 'Alt-F'
        options[formatHotKey] = cm => cm.setValue(formatter.getFormatted(cm.getValue()));
      }
      if (unFormatHotKey) {
        // default: 'Alt-R'
        options[unFormatHotKey] = cm => cm.setValue(formatter.getRaw(cm.getValue()));
      }
    }
    editor.setSize(width, height); // default size: ('100%', 100)
    editor.setOption('extraKeys', options);
  };
}
