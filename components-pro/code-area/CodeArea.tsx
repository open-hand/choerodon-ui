import React, { ComponentClass, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, observable, autorun } from 'mobx';
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

  midText: string;

  constructor(props, content) {
    super(props, content)
    autorun(() => {
      // 在绑定dataSet的情况下
      // 当手动修改过codeArea里面的值以后 再使用record.set去更新值 组件不会更新
      // 原因在于此时 this.text 不为 undefined 因此 getTextNode 的计算值不会进行改变 导致组件不重新渲染
      // 其他的组件会对 this.text 在blur的时候进行undefined的修改 但是这个组件不能这么做
      // 原因在于 record 中的值为 raw的非格式化数据 blur后因为进行了一次record数据的修改 所以再次重新那数据必然导致
      // 当数据存在错误的时候  codeArea去格式化 因为格式化失败了
      // 当数据不存在存在错误的时候即使特地将其去格式化也依旧会被格式化
      // 因此需要使用中间变量进行处理
      const { formatter } = this.props;
      const recordValue = this.getValue()
      const value = formatter ? formatter.getFormatted(recordValue) : recordValue;
      // 判断跟中间值是否一致 通过这个判断 数据的来源是 blur的时候设置的值 还是直接通过外部进行修改的值
      if (recordValue !== this.midText) {
        this.setText(value)
      }
    })
  }

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
    const value = formatter ? formatter.getRaw(codeMirrorText) : codeMirrorText
    this.midText = value
    this.setValue(value);
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
