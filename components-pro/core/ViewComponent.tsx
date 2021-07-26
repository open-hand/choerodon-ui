import { AriaAttributes, Component, CSSProperties, FocusEventHandler, Key, KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, computed, observable } from 'mobx';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import classes from 'component-classes';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import autobind from '../_util/autobind';
import { Size } from './enum';
import normalizeLanguage from '../_util/normalizeLanguage';
import { Lang } from '../locale-context/enum';
import localeContext from '../locale-context';

//
// 组件对外开放的事件函数名以 onXXX 命名. 尽量减少对外开放的事件，统一由数据来关联
// 组件对内响应的事件函数名以 handleXXX 命名.
// ----------------------------------------------------------------------

type Booleanish = boolean | 'true' | 'false';

/**
 * Code生成器
 */
const CodeGen: IterableIterator<string> = (function* (start: number) {
  while (true) {
    yield `anonymous-${++start}`;
  }
})(1000);

export interface ElementProps {
  /**
   * 组件id
   */
  id?: string;
  /**
   * 键盘Tab键焦点序号，设为-1时不会获得焦点，设为0时为节点树的顺序。
   */
  tabIndex?: number;
  /**
   * 组件key
   */
  key?: Key;
  /**
   * 样式后缀
   */
  suffixCls?: string;
  /**
   * 样式前缀
   */
  prefixCls?: string;
  /**
   * 外层自定义样式名
   */
  className?: string;
  /**
   * 实际元素自定义样式名
   */
  elementClassName?: string;
  /**
   * 内链样式
   */
  style?: CSSProperties;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  /**
   * 语言
   */
  lang?: Lang;
  /**
   * 拼写校验
   */
  spellCheck?: Booleanish;
  /**
   * 自动获取焦点，多个组件同时设置该参数时，以节点树的顺序最末的组件获取焦点
   */
  autoFocus?: boolean;
  /**
   * 内容的文本方向
   */
  dir?: string;
  /**
   * 快捷键, 通过 Alt + accessKey (或者 Shift + Alt + accessKey) 使组件聚焦
   */
  accessKey?: string;
  /**
   * 内容可编辑
   */
  contentEditable?: Booleanish | 'inherit';
  /**
   * 是否可拖动
   */
  draggable?: Booleanish;
}

/** 响应鼠标事件组件 */
export interface MouseEventComponentProps {
  /**
   * 右键单击回调
   */
  onAuxClick?: MouseEventHandler<any>;
  onAuxClickCapture?: MouseEventHandler<any>;
  /**
   * 单击回调
   */
  onClick?: MouseEventHandler<any>;
  onClickCapture?: MouseEventHandler<any>;
  /**
   * 双击回调
   */
  onDoubleClick?: MouseEventHandler<any>;
  onDoubleClickCapture?: MouseEventHandler<any>;
  /**
   * 右键菜单回调
   */
  onContextMenu?: MouseEventHandler<any>;
  onContextMenuCapture?: MouseEventHandler<any>;
  /**
   * 鼠标抬起回调
   */
  onMouseUp?: MouseEventHandler<any>;
  onMouseUpCapture?: MouseEventHandler<any>;
  /**
   * 鼠标点下回调
   */
  onMouseDown?: MouseEventHandler<any>;
  onMouseDownCapture?: MouseEventHandler<any>;
  /**
   * 鼠标移动回调
   */
  onMouseMove?: MouseEventHandler<any>;
  onMouseMoveCapture?: MouseEventHandler<any>;
  /**
   * 鼠标进入回调
   */
  onMouseEnter?: MouseEventHandler<any>;
  onMouseEnterCapture?: MouseEventHandler<any>;
  /**
   * 鼠标离开回调
   */
  onMouseLeave?: MouseEventHandler<any>;
  onMouseLeaveCapture?: MouseEventHandler<any>;
  /**
   * 鼠标进入回调，与onMouseEnter区别在于鼠标进入子节点时会触发onMouseOut
   */
  onMouseOver?: MouseEventHandler<any>;
  onMouseOverCapture?: MouseEventHandler<any>;
  /**
   * 鼠标离开回调，与onMouseLeave区别在于子节点的onMouseout会冒泡触发本回调
   */
  onMouseOut?: MouseEventHandler<any>;
  onMouseOutCapture?: MouseEventHandler<any>;
}

/** 响应键盘事件组件 */
export interface KeyboardEventComponentProps {
  /**
   * 键盘按下时的回调
   */
  onKeyDown?: KeyboardEventHandler<any>;
  onKeyDownCapture?: KeyboardEventHandler<any>;
  /**
   * 键盘抬起时的回调
   */
  onKeyUp?: KeyboardEventHandler<any>;
  onKeyUpCapture?: KeyboardEventHandler<any>;
  /**
   * 键盘敲击后的回调
   */
  onKeyPress?: KeyboardEventHandler<any>;
  onKeyPressCapture?: KeyboardEventHandler<any>;
}

/** 焦点事件组件 */
export interface FocusEventComponentProps {
  /**
   * 获取焦点回调
   */
  onFocus?: FocusEventHandler<any>;
  onFocusCapture?: FocusEventHandler<any>;
  /**
   * 失去焦点回调
   */
  onBlur?: FocusEventHandler<any>;
  onBlurCapture?: FocusEventHandler<any>;
}

export interface ViewComponentProps
  extends MouseEventComponentProps,
    KeyboardEventComponentProps,
    FocusEventComponentProps,
    AriaAttributes,
    ElementProps {
  /**
   *  唯一标识编码
   */
  code?: boolean;
  /**
   *  是否禁用
   */
  disabled?: boolean;
  /**
   * 悬浮提示，建议用ToolTip组件
   */
  title?: ReactNode;
  /**
   * 组件大小<未实现>
   * 可选值 `default` `small` `large`
   */
  size?: Size;
}

/* eslint-disable react/no-unused-prop-types */
export default class ViewComponent<P extends ViewComponentProps> extends Component<P, any> {
  static propTypes = {
    /**
     * 组件id
     */
    id: PropTypes.string,
    /**
     * 组件大小<未实现>
     * 可选值 `default` `small` `big`
     */
    size: PropTypes.oneOf([Size.small, Size.default, Size.large]),
    /**
     * 样式后缀
     */
    suffixCls: PropTypes.string,
    /**
     * 样式前缀
     */
    prefixCls: PropTypes.string,
    /**
     * 悬浮提示，建议用ToolTip组件
     */
    title: PropTypes.node,
    /**
     *  是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 是否隐藏
     */
    hidden: PropTypes.bool,
    /**
     * 自动获取焦点，多个组件同时设置该参数时，以节点树的顺序最末的组件获取焦点
     */
    autoFocus: PropTypes.bool,
    /**
     * 快捷键, 通过 Alt + accessKey (或者 Shift + Alt + accessKey) 使组件聚焦
     */
    accessKey: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    /**
     * 内容的文本方向
     */
    dir: PropTypes.string,
    /**
     * 内容可编辑
     */
    contentEditable: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    /**
     * 是否可拖动
     */
    draggable: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    /**
     * 内链样式
     */
    style: PropTypes.object,
    /**
     * 自定义样式名
     */
    className: PropTypes.string,
    /**
     * 键盘Tab键焦点序号，设为-1时不会获得焦点，设为0时为节点树的顺序。
     */
    tabIndex: PropTypes.number,
    /**
     * 语言
     */
    lang: PropTypes.string,
    /**
     * 拼写校验
     */
    spellCheck: PropTypes.bool,
    /**
     * 获取焦点回调
     */
    onFocus: PropTypes.func,
    /**
     * 失去焦点回调
     */
    onBlur: PropTypes.func,
    /**
     * 单击回调
     */
    onClick: PropTypes.func,
    /**
     * 双击回调
     */
    onDoubleClick: PropTypes.func,
    /**
     * 鼠标抬起回调
     */
    onMouseUp: PropTypes.func,
    /**
     * 鼠标点下回调
     */
    onMouseDown: PropTypes.func,
    /**
     * 鼠标移动回调
     */
    onMouseMove: PropTypes.func,
    /**
     * 鼠标进入回调
     */
    onMouseEnter: PropTypes.func,
    /**
     * 鼠标离开回调
     */
    onMouseLeave: PropTypes.func,
    /**
     * 鼠标进入回调，与onMouseEnter区别在于鼠标进入子节点时会触发onMouseOut
     */
    onMouseOver: PropTypes.func,
    /**
     * 鼠标离开回调，与onMouseLeave区别在于子节点的onMouseout会冒泡触发本回调
     */
    onMouseOut: PropTypes.func,
    /**
     * 鼠标右击后的回调
     */
    onContextMenu: PropTypes.func,
    /**
     * 键盘按下时的回调
     */
    onKeyDown: PropTypes.func,
    /**
     * 键盘抬起时的回调
     */
    onKeyUp: PropTypes.func,
    /**
     * 键盘敲击后的回调
     */
    onKeyPress: PropTypes.func,
  };

  element: any;

  height: number | string | undefined;

  wrapper: any;

  isFocus: boolean;

  code: string;

  @observable isFocused: boolean;

  @observable observableProps: any;

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  @computed
  get lang(): Lang {
    const { lang } = this.observableProps;
    if (lang) {
      return lang;
    }
    return localeContext.locale.lang;
  }

  @computed
  get disabled(): boolean {
    return this.isDisabled();
  }

  constructor(props, context) {
    super(props, context);
    this.setCode(props);
    this.setObservableProps(props, context);
  }

  setCode(props) {
    this.code = props.code || CodeGen.next().value;
  }

  getMergedClassNames(...props) {
    return classNames(this.getClassName(), this.getWrapperClassNames(), ...props);
  }

  getMergedProps(props = {}) {
    const wrapperProps = this.getWrapperProps(props);
    const otherProps = this.getOtherProps();
    const mergedProps = {
      ...wrapperProps,
      ...otherProps,
      className: classNames(wrapperProps.className, otherProps.className),
    };
    if (wrapperProps.style && otherProps.style) {
      mergedProps.style = { ...wrapperProps.style, ...otherProps.style };
    }
    return mergedProps;
  }

  getObservableProps(props, _context: any): any {
    return {
      lang: props.lang,
      disabled: props.disabled,
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

  getOmitPropsKeys(): string[] {
    const keys: string[] = [
      'code',
      'prefixCls',
      'suffixCls',
      'className',
      'elementClassName',
      'style',
      'size',
      'autoFocus',
      'onFocus',
      'onBlur',
      'children',
      'dataSet',
    ];
    if (this.disabled) {
      return keys.concat([
        'onClick',
        'onMouseUp',
        'onMouseDown',
        'onMouseEnter',
        'onMouseLeave',
        // 'onMouseOver',
        // 'onMouseOut',
        'onKeyDown',
        'onKeyUp',
        'onKeyPress',
        'onContextMenu',
      ]);
    }
    return keys;
  }

  getOtherProps() {
    const { props, disabled } = this;
    const { tabIndex, lang, style = {} } = props;
    const otherProps: any = omit(props, this.getOmitPropsKeys());
    if (disabled) {
      if (tabIndex !== undefined) {
        otherProps.tabIndex = -1;
      }
    } else {
      otherProps.onFocus = this.handleFocus;
      otherProps.onBlur = this.handleBlur;
    }
    otherProps.ref = this.elementReference;
    otherProps.disabled = disabled;
    otherProps.className = this.getClassName();
    otherProps.style = {};
    if (this.height) {
      otherProps.style.height = this.height;
    } else if ('height' in style) {
      otherProps.style.height = style.height;
    }
    if ('minHeight' in style) {
      otherProps.style.minHeight = style.minHeight;
    }
    if ('maxHeight' in style) {
      otherProps.style.maxHeight = style.maxHeight;
    }
    otherProps.lang = normalizeLanguage(lang);
    return otherProps;
  }

  getClassName(...props): string | undefined {
    const {
      prefixCls,
      props: { elementClassName },
    } = this;
    return classNames(prefixCls, elementClassName, ...props);
  }

  getWrapperProps(props: any = {}): any {
    const { style, hidden, onMouseEnter, onMouseLeave } = this.props;
    const mergedStyle = props.style || style;
    const wrapperProps: any = {
      ref: this.wrapperReference,
      className: this.getWrapperClassNames(),
      hidden,
      ...props,
    };
    if (this.disabled) {
      if (!wrapperProps.onMouseEnter) {
        wrapperProps.onMouseEnter = onMouseEnter;
      }
      if (!wrapperProps.onMouseLeave) {
        wrapperProps.onMouseLeave = onMouseLeave;
      }
    }
    if (mergedStyle) {
      wrapperProps.style = omit(mergedStyle, ['height', 'minHeight', 'maxHeight']);
    }
    return wrapperProps;
  }

  getWrapperClassNames(...args): string {
    const {
      prefixCls,
      props: { className, size },
    } = this;
    return classNames(
      `${prefixCls}-wrapper`,
      className,
      {
        [`${prefixCls}-sm`]: size === Size.small,
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-disabled`]: this.disabled,
        [`${prefixCls}-focused`]: this.useFocusedClassName() && this.isFocus,
      },
      ...args,
    );
  }

  isDisabled(): boolean {
    const { disabled = false } = this.observableProps;
    return disabled;
  }

  useFocusedClassName(): boolean {
    return true;
  }

  @autobind
  @action
  handleFocus(e) {
    this.isFocused = true;
    this.isFocus = true;
    const {
      props: { onFocus = noop },
      prefixCls,
    } = this;
    if (this.useFocusedClassName()) {
      const element = this.wrapper || findDOMNode(this);
      if (element) {
        classes(element).add(`${prefixCls}-focused`);
      }
    }
    onFocus(e);
  }

  protected forceBlur(e) {
    const {
      props: { onBlur = noop },
    } = this;
    onBlur(e);
  }


  @autobind
  @action
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      const { prefixCls } = this;
      this.forceBlur(e);
      if (!e.isDefaultPrevented()) {
        this.isFocused = false;
        this.isFocus = false;
        if (this.useFocusedClassName()) {
          const element = this.wrapper || findDOMNode(this);
          if (element) {
            classes(element).remove(`${prefixCls}-focused`);
          }
        }
      }
    }
  }

  focus() {
    if (this.element) {
      this.element.focus();
    }
  }

  blur() {
    if (this.element) {
      this.element.blur();
    }
  }

  @autobind
  elementReference(node) {
    this.element = node;
  }

  @autobind
  @action
  wrapperReference(node) {
    this.wrapper = node;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { code } = this.props;
    if (nextProps.code !== code) {
      this.setCode(nextProps);
    }
    this.updateObservableProps(nextProps, nextContext);
  }

  componentDidMount() {
    const { tabIndex, autoFocus } = this.props;
    if (autoFocus && (tabIndex === undefined || tabIndex > -1) && !this.disabled) {
      this.focus();
    }
  }

  setHeight(height) {
    this.height = height;
    const { element } = this;
    if (element) {
      element.style.height = height;
    }
  }

}
