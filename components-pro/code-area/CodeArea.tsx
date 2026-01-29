import React, { ComponentClass, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classes from 'component-classes';
import classNames from 'classnames';
import { action, autorun, IReactionDisposer, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { IControlledCodeMirror as CodeMirrorProps, IInstance } from 'react-codemirror2';
import ResizeObserver from 'resize-observer-polyfill';
import shallowEqual from 'shallowequal';
import { DebouncedFunc, DebounceSettings } from 'lodash';
import defaultTo from 'lodash/defaultTo';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import { Options } from 'prettier';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Icon from 'choerodon-ui/lib/icon';
import { WaitType } from '../core/enum';
import { ValueChangeAction } from '../text-field/enum';
import { FormField, FormFieldProps } from '../field/FormField';
import { CodeAreaFormatter } from './CodeAreaFormatter';
import { ThemeSwitch } from './enum';
import autobind from '../_util/autobind';
import { LabelLayout } from '../form/enum';
import Switch from '../switch';
import { hasAncestorWithClassName } from './utils';
import { show } from '../tooltip/singleton';

let CodeMirror: ComponentClass<CodeMirrorProps>;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  CodeMirror = require('react-codemirror2').Controlled;
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require('codemirror/addon/display/placeholder.js');
}

export {
  ThemeSwitch,
};

export interface CodeAreaProps extends FormFieldProps {
  options?: any;
  formatHotKey?: string;
  unFormatHotKey?: string;
  formatter?: CodeAreaFormatter;
  editorDidMount?: (editor: IInstance, value: string, cb: () => void) => void;
  themeSwitch?: ThemeSwitch,
  /**
   * 占位词
   */
  placeholder?: string;
  /**
   * 触发值变更的动作， default: blur
   */
  valueChangeAction?: ValueChangeAction;
  /**
   * 值变更间隔时间，只有在valueChangeAction为input时起作用
   */
  wait?: number;
  /**
   * 值变更间隔类型，可选值：throttle | debounce
   * @default throttle
   */
  waitType?: WaitType;
  /**
   * formatter 格式化的参数(prettier 的参数)
   */
  prettierOptions?: Options;
}

const defaultCodeMirrorOptions: any = {
  theme: 'idea',
  lineNumbers: true,
  lint: true,
  gutters: ['CodeMirror-lint-markers'],
};

@observer
export default class CodeArea extends FormField<CodeAreaProps> {
  static displayName = 'CodeArea';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'code-area',
    formatHotKey: 'Alt-F',
    unFormatHotKey: 'Alt-R',
    valueChangeAction: ValueChangeAction.blur,
    waitType: WaitType.debounce,
  };

  cmOptions: any = this.getCodeMirrorOptions();

  @observable text?: string;

  midText: string;

  disposer: IReactionDisposer;

  @observable theme?: string;

  editor?: IInstance;

  resizeObserver?: ResizeObserver;

  mutationObserver?: MutationObserver;

  beforeWrapperSize?: { width: number; height: number; };

  firstTimeoutId?: number;

  secondTimeoutId?: number;

  handleChangeWait: DebouncedFunc<(codeMirrorInstance: IInstance, event?: Event, focus?: boolean) => void>;

  constructor(props, content) {
    super(props, content);
    const { options } = props;
    const theme = options && options.theme ? options.theme : props.themeSwitch;
    this.setTheme(defaultTo(theme, defaultCodeMirrorOptions.theme));
    this.disposer = autorun(() => {
      // 在绑定dataSet的情况下
      // 当手动修改过codeArea里面的值以后 再使用record.set去更新值 组件不会更新
      // 原因在于此时 this.text 不为 undefined 因此 getTextNode 的计算值不会进行改变 导致组件不重新渲染
      // 其他的组件会对 this.text 在blur的时候进行undefined的修改 但是这个组件不能这么做
      // 原因在于 record 中的值为 raw的非格式化数据 blur后因为进行了一次record数据的修改 所以再次重新那数据必然导致
      // 当数据存在错误的时候  codeArea去格式化 因为格式化失败了
      // 当数据不存在存在错误的时候即使特地将其去格式化也依旧会被格式化
      const { formatter, prettierOptions } = props;
      const recordValue = this.getValue();
      const value = formatter ? formatter.getFormatted(recordValue, prettierOptions) : recordValue;
      // 分别监听 受控 及 DataSet 进行管理时值的变化
      if (recordValue !== this.midText || (this.dataSet && this.name)) {
        this.setText(value);
      }
    });
    this.handleChangeWait = this.getHandleChange(props);
  }

  componentDidMount() {
    super.componentDidMount();

    this.handleMountRefresh();
  }

  componentWillUnmount(): void {
    this.disposer();
    this.disconnect();
    this.editorRefreshDebounce.cancel();
    this.handleChangeWait.cancel();
  }

  componentDidUpdate(prevProps) {
    if (!shallowEqual(this.props.style, prevProps.style)) {
      this.editorRefresh();
    }
  }

  handleMountRefresh() {
    const { wrapper, context, element } = this;
    if (wrapper) {
      this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        entries.forEach(entry => {
          if (this.beforeWrapperSize && (this.beforeWrapperSize.width === 0 || this.beforeWrapperSize.height === 0)) {
            this.firstTimeoutId = window.setTimeout(() => {
              // 由隐藏变为显示，更新样式
              this.editorRefresh();
            }, 200);
          }
          this.beforeWrapperSize = { width: entry.contentRect.width, height: entry.contentRect.height };
        });
      });
      this.resizeObserver.observe(wrapper);
    }

    const modalCls = context.getProPrefixCls('modal-wrapper');
    const parent = hasAncestorWithClassName(element, modalCls);
    if (typeof window !== 'undefined' && element && parent) {
      this.mutationObserver = new MutationObserver(() => {
        // modal 中异步加载 CodeArea 时，更新样式
        this.editorRefresh();
      });
      // 监控 modal 类名变化，modal 开启动画时，需要更新 codemirror 样式
      this.mutationObserver.observe(parent, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    }
    if (typeof window !== 'undefined') {
      this.secondTimeoutId = window.setTimeout(() => {
        // 保底未知场景
        this.editorRefresh();
      }, 1000);
    }
  }

  disconnect() {
    const { resizeObserver, mutationObserver, firstTimeoutId, secondTimeoutId } = this;
    if (resizeObserver) {
      resizeObserver.disconnect();
      delete this.resizeObserver;
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
      delete this.mutationObserver;
    }
    if (typeof window !== 'undefined') {
      window.clearTimeout(firstTimeoutId);
      window.clearTimeout(secondTimeoutId);
      delete this.firstTimeoutId;
      delete this.secondTimeoutId;
    }
  }

  editorRefresh = () => {
    if (this.editor) {
      this.editor.refresh();
    }
  }

  editorRefreshDebounce = debounce(() => {
    this.editorRefresh();
  }, 600);

  @autobind
  handleBeforeChange(editor: IInstance, _data, value) {
    this.setText(value);
    this.editorRefreshDebounce();
    if (this.props.valueChangeAction === ValueChangeAction.input) {
      this.handleChangeWait(editor, undefined, true);
    }
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

  getCodeMirrorOptions(options: any = this.props.options!): any {
    let { placeholder } = this.props;
    if (this.labelLayout === LabelLayout.placeholder && !this.isFocused) {
      placeholder = this.getDisplayProp('label');
    } else if (this.labelLayout === LabelLayout.float && !this.isFocused) {
      placeholder = '';
    }
    return { ...defaultCodeMirrorOptions, placeholder, ...options };
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'formatHotKey',
      'unFormatHotKey',
      'editorDidMount',
      'valueChangeAction',
      'wait',
      'waitType',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.onChange;
    otherProps.onKeyDown = this.handleCodeMirrorKeyDown;
    otherProps.className = this.getOtherClassName(otherProps);
    return otherProps;
  }

  getOtherClassName(otherProps: any) {
    return classNames(otherProps.className, {
      [`${this.prefixCls}-dark`]: this.theme === ThemeSwitch.material,
      [`${this.prefixCls}-disabled`]: this.disabled,
    });
  }

  setThemeWrapper(nextProps) {
    const { options, themeSwitch } = nextProps;
    const { options: preOptions, themeSwitch: preThemeSwitch } = this.props;
    const preOptionsTheme = preOptions && preOptions.theme;
    const optionsTheme = options && options.theme;
    if (preOptionsTheme !== optionsTheme || preThemeSwitch !== themeSwitch) {
      this.setTheme(defaultTo(optionsTheme || themeSwitch, defaultCodeMirrorOptions.theme));
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setThemeWrapper(nextProps);
    super.componentWillReceiveProps(nextProps, nextContext);

    const { wait, waitType } = this.props;
    if (wait !== nextProps.wait || waitType !== nextProps.waitType) {
      this.handleChangeWait = this.getHandleChange(nextProps);
    }
  }

  handleThemeChange = (value) => {
    this.setTheme(value ? ThemeSwitch.idea : ThemeSwitch.material);
  };

  getHeader = () => {
    const { title, options, themeSwitch } = this.props;
    if (!title && (options && options.theme || !themeSwitch)) {
      return null;
    }
    const titleNode = title ? <div className={`${this.prefixCls}-header-title`}>{title}</div> : null;
    const themeSwitchNode = (!options || !options.theme) && themeSwitch ? (
      <div className={`${this.prefixCls}-header-switch`}>
        <Switch
          unCheckedChildren={<Icon type="moon-circle" />}
          defaultChecked={(this.theme !== ThemeSwitch.material)}
          onChange={this.handleThemeChange}
        >
          <Icon type="wb_sunny" />
        </Switch>
      </div>
    ) : null;
    const headerClassNames = classNames(`${this.prefixCls}-header`, {
      [`${this.prefixCls}-header-light`]: this.theme !== ThemeSwitch.material,
      [`${this.prefixCls}-header-dark`]: this.theme === ThemeSwitch.material,
    });
    return (
      <div className={headerClassNames}>
        {titleNode}
        {themeSwitchNode}
      </div>
    );
  };

  @autobind
  elementReference(node) {
    if (node && node.ref) {
      this.element = node.ref;
    }
  }

  @autobind
  handleHelpMouseEnter(e) {
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    const { helpTooltipProps } = this;
    let helpTooltipCls = `${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`;
    if (helpTooltipProps && helpTooltipProps.popupClassName) {
      helpTooltipCls = helpTooltipCls.concat(' ', helpTooltipProps.popupClassName)
    }
    show(e.currentTarget, {
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
      title: this.getDisplayProp('help'),
      ...helpTooltipProps,
      popupClassName: helpTooltipCls,
    });
    this.tooltipShown = true;
  }

  @autobind
  handleHelpMouseLeave() {
    this.hideTooltip();
  }

  renderTooltipHelp(): ReactNode {
    const help = this.getDisplayProp('help');
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={this.handleHelpMouseEnter}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  renderWrapper(): ReactNode {
    if (CodeMirror) {
      this.cmOptions = this.getCodeMirrorOptions();
      this.cmOptions.readOnly = this.disabled || this.readOnly;
      this.cmOptions.theme = this.theme;
      const text = this.getTextNode();
      const header = this.getHeader();
      const { onMouseEnter, onMouseLeave, ...otherProps } = this.getOtherProps();
      return (
        <div {...this.getWrapperProps()}>
          {header}
          <label>
            <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              <CodeMirror
                {...otherProps}
                value={isString(text) ? text : this.processValue(this.getValue())}
                options={this.cmOptions}
                onBeforeChange={this.handleBeforeChange}
                onBlur={this.handleCodeMirrorBlur}
                editorDidMount={this.handleCodeMirrorDidMount}
              />
              {this.renderFloatLabel()}
            </span>
          </label>
        </div>
      );
    }
  }

  @action
  setTheme(theme?: string): void {
    if (theme !== this.theme) {
      this.theme = theme;
    }
  }

  @action
  setText(text?: string): void {
    this.text = text;
  }

  getTextNode(value?: any): ReactNode {
    return this.text === undefined ? (super.getTextNode(value) as string) || '' : this.text;
  }

  processValue(value: any): ReactNode {
    const text = super.processValue(value);
    const { formatter, prettierOptions } = this.props;
    return formatter && isString(text) ? formatter.getFormatted(text, prettierOptions) : text;
  }

  getHandleChange(props: CodeAreaProps): DebouncedFunc<(codeMirrorInstance: IInstance, event?: Event, focus?: boolean) => void> {
    const { wait, waitType } = props;
    if (wait && waitType) {
      const options: DebounceSettings = { leading: true, trailing: true };
      if (waitType === WaitType.throttle) {
        options.trailing = false;
        options.maxWait = wait;
      } else if (waitType === WaitType.debounce) {
        options.leading = false;
      }
      return debounce(this.handleCodeMirrorBlur, wait, options);
    }
    return debounce(this.handleCodeMirrorBlur, 0);
  }

  /**
   * 编辑器失去焦点时，调用父类方法，同步DataSet中的内容
   *
   * @memberof CodeArea
   */
  handleCodeMirrorBlur = action((codeMirrorInstance: IInstance, _event?: Event, focus?: boolean) => {
    const { formatter, prettierOptions, onBlur } = this.props;
    if (_event && onBlur && typeof onBlur === 'function') {
      onBlur(_event as any);
    }
    // 更新DataSet的值之前，先去拿到原始的raw格式
    let value = codeMirrorInstance.getValue();
    if (formatter) {
      const { getFormatted } = formatter;
      value = getFormatted(value, prettierOptions);
    }
    this.midText = value;
    this.setValue(value);
    if (!focus) {
      this.isFocused = false;
      this.isFocus = false;
      const element = this.wrapper || findDOMNode(this);
      if (element) {
        classes(element).remove(`${this.prefixCls}-focused`);
      }
      this.handleChangeWait.cancel();
    }

    const recordValue = this.getValue();
    if (recordValue !== this.midText) {
      this.setText(formatter ? formatter.getFormatted(recordValue, prettierOptions) : recordValue);
    }
  });

  /**
   * 在CodeMirror编辑器实例挂载前添加额外配置
   *
   * @memberof CodeArea
   */
  handleCodeMirrorDidMount = (editor: IInstance, value: string, cb: () => void) => {
    this.editor = editor;
    const { formatter, style, formatHotKey, unFormatHotKey, editorDidMount, prettierOptions } = this.props;
    const { width, height = 100 } = style || {};
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
        options[formatHotKey] = cm => cm.setValue(formatter.getFormatted(cm.getValue(), prettierOptions));
      }
      if (unFormatHotKey) {
        // default: 'Alt-R'
        options[unFormatHotKey] = cm => cm.setValue(formatter.getRaw(cm.getValue()));
      }
    }
    editor.setSize(isNil(width) ? '100%' : null, height); // default size: ('100%', 100)
    editor.setOption('extraKeys', options);
    if (editorDidMount) {
      editorDidMount(editor, value, cb);
    }
    if (this.labelLayout === LabelLayout.float) {
      const { display } = editor as any;
      if (display) {
        const { gutters } = display;
        if (gutters) {
          const { offsetWidth } = gutters;
          if (offsetWidth !== this.floatLabelOffsetX) {
            runInAction(() => {
              this.floatLabelOffsetX = offsetWidth;
            });
          }
        }
      }
    }
  };
}
