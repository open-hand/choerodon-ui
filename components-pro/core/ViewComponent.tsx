import { Component, CSSProperties, FocusEventHandler, Key, KeyboardEventHandler, MouseEventHandler } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, computed, observable } from 'mobx';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import merge from 'lodash/merge';
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

export interface ViewComponentProps
  extends MouseEventComponentProps,
    KeyboardEventComponentProps,
    ElementProps {
  /**
   * 组件id
   */
  id?: string;
  /**
   *  是否禁用
   */
  disabled?: boolean;
  /**
   * 键盘Tab键焦点序号，设为-1时不会获得焦点，设为0时为节点树的顺序。
   */
  tabIndex?: number;
  /**
   * 悬浮提示，建议用ToolTip组件
   */
  title?: string;
  /**
   * 自动获取焦点，多个组件同时设置该参数时，以节点树的顺序最末的组件获取焦点
   */
  autoFocus?: boolean;
  /**
   * 组件大小<未实现>
   * 可选值 `default` `small` `large`
   */
  size?: Size;
  /**
   * 获取焦点回调
   */
  onFocus?: FocusEventHandler<any>;
  /**
   * 失去焦点回调
   */
  onBlur?: FocusEventHandler<any>;
}

export interface ElementProps {
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
  spellCheck?: boolean;
}

/** 响应鼠标事件组件 */
export interface MouseEventComponentProps {
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
   * 右点击回调
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
  /**
   * 键盘抬起时的回调
   */
  onKeyUp?: KeyboardEventHandler<any>;
  /**
   * 键盘敲击后的回调
   */
  onKeyPress?: KeyboardEventHandler<any>;
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
    title: PropTypes.string,
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

  constructor(props, context) {
    super(props, context);
    this.setObservableProps(props, context);
  }

  getMergedClassNames(...props) {
    return classNames(this.getClassName(), this.getWrapperClassNames(), ...props);
  }

  getMergedProps(props = {}) {
    return {
      ...merge(this.getWrapperProps(props), this.getOtherProps()),
      className: this.getMergedClassNames(),
    };
  }

  getObservableProps(props, _context: any) {
    return {
      lang: props.lang,
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

  getOtherProps() {
    const { tabIndex, lang, style = {} } = this.props;
    let otherProps: any = omit(this.props, [
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
    ]);
    if (this.isDisabled()) {
      otherProps = omit(otherProps, [
        'onClick',
        'onMouseUp',
        'onMouseDown',
        'onMouseEnter',
        'onMouseLeave',
        'onMouseOver',
        'onMouseOut',
        'onKeyDown',
        'onKeyUp',
        'onKeyPress',
        'onContextMenu',
      ]);
      if (tabIndex !== undefined) {
        otherProps.tabIndex = -1;
      }
    } else {
      otherProps.onFocus = this.handleFocus;
      otherProps.onBlur = this.handleBlur;
    }
    otherProps.ref = this.elementReference;
    otherProps.disabled = this.isDisabled();
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

  getWrapperProps(props = {}): any {
    const { style, hidden } = this.props;
    const wrapperProps: any = {
      ref: this.wrapperReference,
      className: this.getWrapperClassNames(),
      hidden,
      ...props,
    };
    if (style) {
      wrapperProps.style = omit(style, ['height', 'minHeight']);
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
        [`${prefixCls}-sm`]: size === 'small',
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-disabled`]: this.isDisabled(),
        [`${prefixCls}-focused`]: this.isFocus,
      },
      ...args,
    );
  }

  isDisabled(): boolean {
    const { disabled = false } = this.props;
    return disabled;
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
    const element = this.wrapper || findDOMNode(this);
    if (element) {
      classes(element).add(`${prefixCls}-focused`);
    }
    onFocus(e);
  }

  @autobind
  @action
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      const {
        props: { onBlur = noop },
        prefixCls,
      } = this;
      onBlur(e);
      if (!e.isDefaultPrevented()) {
        this.isFocused = false;
        this.isFocus = false;
        const element = this.wrapper || findDOMNode(this);
        if (element) {
          classes(element).remove(`${prefixCls}-focused`);
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
    this.updateObservableProps(nextProps, nextContext);
  }

  componentWillMount() {
    const { tabIndex, autoFocus } = this.props;
    if (!this.isDisabled() && autoFocus && (tabIndex === undefined || tabIndex > -1)) {
      defer(() => this.focus());
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
