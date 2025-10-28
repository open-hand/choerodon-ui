import React, { Children, cloneElement, Component, isValidElement } from 'react';
import { observer } from 'mobx-react';
import { createPortal, findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import classNames from "classnames";
import contains from '../util/Dom/contains';
import addEventListener from '../../_util/addEventListener';
import Popup from './Popup';
import { getAlignFromPlacement, getAlignPopupClassName } from './utils';
import Portal from '../util/Portal';

function returnEmptyString() {
  return '';
}

function returnDocument() {
  return window.document;
}

const ALL_HANDLERS = ['onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter',
  'onMouseLeave', 'onFocus', 'onBlur', 'onContextMenu', 'onMouseOver'];

class Trigger extends Component {
  static displayName = 'Trigger';

  static defaultProps = {
    prefixCls: 'rc-trigger-popup',
    getPopupClassNameFromAlign: returnEmptyString,
    getDocument: returnDocument,
    onPopupVisibleChange: noop,
    beforePopupVisibleChange: noop,
    afterPopupVisibleChange: noop,
    onPopupAlign: noop,
    popupClassName: '',
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0.1,
    focusDelay: 0,
    blurDelay: 0.15,
    popupStyle: {},
    destroyPopupOnHide: false,
    popupAlign: {},
    defaultPopupVisible: false,
    mask: false,
    maskClosable: true,
    action: [],
    showAction: [],
    hideAction: [],
  };

  constructor(props) {
    super(props);

    let popupVisible;
    if ('popupVisible' in props) {
      popupVisible = !!props.popupVisible;
    } else {
      popupVisible = !!props.defaultPopupVisible;
    }

    this.prevPopupVisible = popupVisible;

    this.state = {
      popupVisible,
    };
  }

  componentWillMount() {
    ALL_HANDLERS.forEach((h) => {
      this[`fire${h}`] = (e) => {
        this.fireEvents(h, e);
      };
    });
  }

  componentDidMount() {
    this.componentDidUpdate({}, {
      popupVisible: this.state.popupVisible,
    });
  }

  componentWillReceiveProps({ popupVisible }) {
    if (popupVisible !== undefined) {
      this.setState({
        popupVisible,
      });
    }
  }

  componentDidUpdate(_, prevState) {
    const props = this.props;
    const state = this.state;

    this.prevPopupVisible = prevState.popupVisible;

    // We must listen to `mousedown` or `touchstart`, edge case:
    // https://github.com/react-component/calendar/issues/250
    // https://github.com/react-component/trigger/issues/50
    if (state.popupVisible) {
      let currentDocument;
      if (!this.clickOutsideHandler && (this.isClickToHide() || this.isContextMenuToShow())) {
        currentDocument = props.getDocument();
        this.clickOutsideHandler = addEventListener(currentDocument,
          'mousedown', this.onDocumentClick);
      }
      // always hide on mobile
      if (!this.touchOutsideHandler) {
        currentDocument = currentDocument || props.getDocument();
        this.touchOutsideHandler = addEventListener(currentDocument,
          'touchstart', this.onDocumentClick);
      }
      // close popup when trigger type contains 'onContextMenu' and document is scrolling.
      if (!this.contextMenuOutsideHandler1 && this.isContextMenuToShow()) {
        currentDocument = currentDocument || props.getDocument();
        this.contextMenuOutsideHandler1 = addEventListener(currentDocument,
          'scroll', this.onContextMenuClose);
      }
      // close popup when trigger type contains 'onContextMenu' and window is blur.
      if (!this.contextMenuOutsideHandler2 && this.isContextMenuToShow()) {
        this.contextMenuOutsideHandler2 = addEventListener(window,
          'blur', this.onContextMenuClose);
      }

      if (!this.docScrollHandler) {
        this.docScrollHandler = addEventListener(typeof window === 'undefined' ? undefined : document,
          'scroll', this.handleDocumentScroll, true);
      }
      return;
    }

    this.clearOutsideHandler();
  }

  componentWillUnmount() {
    this.clearDelayTimer();
    this.clearOutsideHandler();

    if (this.onClick && this.onClick.cancel) {
      this.onClick.cancel();
    }
  }

  // 页面滚动时, 跟随显示
  handleDocumentScroll = ({ target }) => {
    const popupNode = this.getPopupDomNode();
    if (popupNode && target !== document && !contains(popupNode, target)) {
      this.forcePopupAlign();
    }
  }

  onMouseEnter = (e) => {
    const { mouseEnterDelay } = this.props;
    this.fireEvents('onMouseEnter', e);
    this.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
  };

  onMouseOver = (e) => {
    const { popupVisible } = this.state;
    const { mouseEnterDelay } = this.props;
    this.fireEvents('onMouseOver', e);
    if (!this.delayTimer && !popupVisible) {
      this.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
    }
  }

  onMouseMove = (e) => {
    this.fireEvents('onMouseMove', e);
    this.setPoint(e);
  };

  onMouseLeave = (e) => {
    this.fireEvents('onMouseLeave', e);
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
  };

  onPopupMouseEnter = () => {
    this.clearDelayTimer();
  };

  onPopupMouseLeave = (e) => {
    // https://github.com/react-component/trigger/pull/13
    // react bug?
    const focusedElement = document.activeElement;
    if (e.relatedTarget && !e.relatedTarget.setTimeout &&
      this._component &&
      this._component.getPopupDomNode &&
      contains(this._component.getPopupDomNode(), e.relatedTarget) ||
      (e.relatedTarget.setTimeout && contains(this._component.getPopupDomNode(), focusedElement))
    ) {
      return;
    }
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
  };

  onFocus = (e) => {
    this.fireEvents('onFocus', e);
    // incase focusin and focusout
    this.clearDelayTimer();
    if (this.isFocusToShow()) {
      this.focusTime = Date.now();
      this.delaySetPopupVisible(true, this.props.focusDelay);
    }
  };

  onMouseDown = (e) => {
    this.fireEvents('onMouseDown', e);
    this.preClickTime = Date.now();
  };

  onTouchStart = (e) => {
    this.fireEvents('onTouchStart', e);
    this.preTouchTime = Date.now();
  };

  onBlur = (e) => {
    this.fireEvents('onBlur', e);
    if (!e.isDefaultPrevented()) {
      this.clearDelayTimer();
      if (this.isBlurToHide()) {
        this.delaySetPopupVisible(false, this.props.blurDelay);
      }
    }
  };

  onContextMenu = (e) => {
    e.preventDefault();
    this.fireEvents('onContextMenu', e);
    this.setPopupVisible(true, e);
  };

  onContextMenuClose = () => {
    if (this.isContextMenuToShow()) {
      this.close();
    }
  };

  onClick = debounce((event) => {
    this.fireEvents('onClick', event);
    // focus will trigger click
    if (this.focusTime) {
      let preTime;
      if (this.preClickTime && this.preTouchTime) {
        preTime = Math.min(this.preClickTime, this.preTouchTime);
      } else if (this.preClickTime) {
        preTime = this.preClickTime;
      } else if (this.preTouchTime) {
        preTime = this.preTouchTime;
      }
      if (Math.abs(preTime - this.focusTime) < 20) {
        return;
      }
      this.focusTime = 0;
    }
    this.preClickTime = 0;
    this.preTouchTime = 0;
    if (event && event.preventDefault) {
      const { children } = this.props;
      const { target, currentTarget } = event;
      if (!((target && currentTarget && currentTarget.contains(target) && target.className &&
        ['-switch', '-checkbox', '-radio'].some(val => target.className.includes(val))) ||
        (children && isValidElement(children) && children.type &&
        (children.type.__PRO_SWITCH || children.type.__PRO_CHECKBOX || children.type.__PRO_RADIO))
      )) {
        event.preventDefault();
      }
    }
    const nextVisible = !this.state.popupVisible;
    if (this.isClickToHide() && !nextVisible || nextVisible && this.isClickToShow()) {
      this.setPopupVisible(!this.state.popupVisible, event);
    }
  }, 1, { leading: true, trailing: false });

  onDocumentClick = (event) => {
    if (event.isDefaultPrevented() || (this.props.mask && !this.props.maskClosable)) {
      return;
    }
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!contains(root, target) && !contains(popupNode, target)) {
      this.close();
    }
  };

  getPopupDomNode() {
    // for test
    if (this._component && this._component.getPopupDomNode) {
      return this._component.getPopupDomNode();
    }
    return null;
  }

  getRootDomNode = () => {
    const { getRootDomNode } = this.props;
    if (getRootDomNode) {
      return getRootDomNode();
    } else {
      return findDOMNode(this);
    }
  };

  getPopupClassFromAlign = (align) => {
    const className = [];
    const {
      popupPlacement, builtinPlacements, prefixCls, alignPoint,
      getPopupClassNameFromAlign,
    } = this.props;
    if (popupPlacement && builtinPlacements) {
      className.push(getAlignPopupClassName(builtinPlacements, prefixCls, align, alignPoint));
    }
    if (getPopupClassNameFromAlign) {
      className.push(getPopupClassNameFromAlign(align));
    }
    return className.join(' ');
  };

  getPopupAlign() {
    const props = this.props;
    const { popupPlacement, popupAlign, builtinPlacements } = props;
    if (popupPlacement && builtinPlacements) {
      return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
    }
    return popupAlign;
  }

  getComponent = () => {
    const {
      prefixCls, destroyPopupOnHide, popupClassName, action,
      onPopupAlign, popupAnimation, popupTransitionName, popupStyle,
      mask, maskAnimation, maskTransitionName, zIndex, popup, stretch,
      alignPoint,
    } = this.props;
    const { popupVisible, point } = this.state;

    const align = this.getPopupAlign();

    const mouseProps = {};
    if (this.isMouseEnterToShow()) {
      mouseProps.onMouseEnter = this.onPopupMouseEnter;
    }
    if (this.isMouseLeaveToHide()) {
      mouseProps.onMouseLeave = this.onPopupMouseLeave;
    }

    return (
      <Popup
        prefixCls={prefixCls}
        destroyPopupOnHide={destroyPopupOnHide}
        visible={popupVisible}
        point={alignPoint && point}
        className={popupClassName}
        action={action}
        align={align}
        onAlign={onPopupAlign}
        animation={popupAnimation}
        getClassNameFromAlign={this.getPopupClassFromAlign}
        {...mouseProps}
        stretch={stretch}
        getRootDomNode={this.getRootDomNode}
        style={popupStyle}
        mask={mask}
        zIndex={zIndex}
        transitionName={popupTransitionName}
        maskAnimation={maskAnimation}
        maskTransitionName={maskTransitionName}
        ref={this.savePopup}
      >
        {typeof popup === 'function' ? popup() : popup}
      </Popup>
    );
  };

  getContainer = () => {
    const { props } = this;
    const popupContainer = document.createElement('div');
    // Make sure default popup container will never cause scrollbar appearing
    // https://github.com/react-component/trigger/issues/41
    popupContainer.style.position = 'absolute';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.width = '100%';
    const mountNode = props.getPopupContainer ? props.getPopupContainer(findDOMNode(this)) : props.getDocument().body;
    mountNode.appendChild(popupContainer);
    return popupContainer;
  };

  setPopupVisible(popupVisible, event) {
    const { alignPoint } = this.props;

    this.clearDelayTimer();

    if (this.state.popupVisible !== popupVisible) {
      if (this.props.beforePopupVisibleChange(popupVisible) !== false) {
        if (!('popupVisible' in this.props)) {
          this.setState({
            popupVisible,
          });
        }
        this.props.onPopupVisibleChange(popupVisible);
      }
    }

    // Always record the point position since mouseEnterDelay will delay the show
    if (alignPoint && event) {
      this.setPoint(event);
    }
  }

  setPoint = (point) => {
    const { alignPoint } = this.props;
    if (!alignPoint || !point) return;

    this.setState({
      point: {
        pageX: point.pageX,
        pageY: point.pageY,
      },
    });
  };

  handlePortalUpdate = () => {
    if (this.prevPopupVisible !== this.state.popupVisible) {
      this.props.afterPopupVisibleChange(this.state.popupVisible);
    }
  };

  delaySetPopupVisible(visible, delayS, event) {
    const delay = delayS * 1000;
    this.clearDelayTimer();
    if (delay) {
      const point = event ? { pageX: event.pageX, pageY: event.pageY } : null;
      this.delayTimer = setTimeout(() => {
        this.setPopupVisible(visible, point);
        this.clearDelayTimer();
      }, delay);
    } else {
      this.setPopupVisible(visible, event);
    }
  }

  clearDelayTimer() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  clearOutsideHandler() {
    if (this.clickOutsideHandler) {
      this.clickOutsideHandler.remove();
      this.clickOutsideHandler = null;
    }

    if (this.contextMenuOutsideHandler1) {
      this.contextMenuOutsideHandler1.remove();
      this.contextMenuOutsideHandler1 = null;
    }

    if (this.contextMenuOutsideHandler2) {
      this.contextMenuOutsideHandler2.remove();
      this.contextMenuOutsideHandler2 = null;
    }

    if (this.touchOutsideHandler) {
      this.touchOutsideHandler.remove();
      this.touchOutsideHandler = null;
    }

    if (this.docScrollHandler) {
      this.docScrollHandler.remove();
      this.docScrollHandler = null;
    }
  }

  createTwoChains(event) {
    const childPros = this.props.children.props;
    const props = this.props;
    if (childPros[event] && props[event]) {
      return this[`fire${event}`];
    }
    return childPros[event] || props[event];
  }

  isClickToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
  }

  isContextMenuToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('contextMenu') !== -1 || showAction.indexOf('contextMenu') !== -1;
  }

  isClickToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
  }

  isMouseEnterToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('hover') !== -1 || showAction.indexOf('mouseEnter') !== -1;
  }

  isMouseLeaveToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseLeave') !== -1;
  }

  isFocusToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
  }

  isBlurToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
  }

  forcePopupAlign() {
    if (this.state.popupVisible && this._component && this._component.alignInstance) {
      this._component.alignInstance.forceAlign();
    }
  }

  fireEvents(type, e) {
    const domEvent = e.hasOwnProperty('isDefaultPrevented') ? e : e.domEvent;
    const childCallback = this.props.children.props[type];
    if (childCallback) {
      childCallback(domEvent);
    }
    if (!domEvent.isDefaultPrevented()) {
      const callback = this.props[type];
      if (callback) {
        callback(domEvent);
      }
    }
  }

  close() {
    this.setPopupVisible(false);
  }

  savePopup = (node) => {
    this._component = node;
  };

  render() {
    const { popupVisible } = this.state;
    const { children, forceRender, alignPoint, className } = this.props;
    const child = Children.only(children);
    const newChildProps = { key: 'trigger' };

    if (this.isContextMenuToShow()) {
      newChildProps.onContextMenu = this.onContextMenu;
    } else {
      newChildProps.onContextMenu = this.createTwoChains('onContextMenu');
    }

    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.onClick = this.onClick;
      newChildProps.onMouseDown = this.onMouseDown;
      newChildProps.onTouchStart = this.onTouchStart;
    } else {
      newChildProps.onClick = this.createTwoChains('onClick');
      newChildProps.onMouseDown = this.createTwoChains('onMouseDown');
      newChildProps.onTouchStart = this.createTwoChains('onTouchStart');
    }
    if (this.isMouseEnterToShow()) {
      newChildProps.onMouseEnter = this.onMouseEnter;
      newChildProps.onMouseOver = this.onMouseOver;
      if (alignPoint) {
        newChildProps.onMouseMove = this.onMouseMove;
      }
    } else {
      newChildProps.onMouseEnter = this.createTwoChains('onMouseEnter');
      newChildProps.onMouseOver = this.createTwoChains('onMouseOver');
    }
    if (this.isMouseLeaveToHide()) {
      newChildProps.onMouseLeave = this.onMouseLeave;
    } else {
      newChildProps.onMouseLeave = this.createTwoChains('onMouseLeave');
    }
    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.onFocus = this.onFocus;
      newChildProps.onBlur = this.onBlur;
    } else {
      newChildProps.onFocus = this.createTwoChains('onFocus');
      newChildProps.onBlur = this.createTwoChains('onBlur');
    }

    const childrenClassName = classNames(child && child.props && child.props.className, className);
    if (childrenClassName) {
      newChildProps.className = childrenClassName;
    }

    const trigger = cloneElement(child, newChildProps);

    let portal;
    // prevent unmounting after it's rendered
    if (popupVisible || this._component || forceRender) {
      portal = (
        <Portal
          key="portal"
          getContainer={this.getContainer}
          didUpdate={this.handlePortalUpdate}
        >
          {this.getComponent()}
        </Portal>
      );
    }

    return [
      trigger,
      portal,
    ];
  }
}

export default observer(Trigger);
