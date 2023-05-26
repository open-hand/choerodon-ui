import React, { Component, KeyboardEvent, MouseEventHandler } from 'react';
import { findDOMNode } from 'react-dom';
import isNumber from 'lodash/isNumber';
import { EventManager } from 'choerodon-ui/dataset';
import { transformZoomData } from 'choerodon-ui/shared/util';
import Animate from '../../animate';
import LazyRenderBox from './LazyRenderBox';
import IDialogPropTypes from './IDialogPropTypes';
import KeyCode from '../../_util/KeyCode';
import contains from '../util/Dom/contains';
import getScrollBarSize from '../util/getScrollBarSize';
import Icon from '../../icon';
import { pxToRem } from '../../_util/UnitConvertor';

let uuid = 0;
let openCount = 0;

/* eslint react/no-is-mounted:0 */

function getScroll(w: any, top?: boolean) {
  let ret = w[`page${top ? 'Y' : 'X'}Offset`];
  const method = `scroll${top ? 'Top' : 'Left'}`;
  if (typeof ret !== 'number') {
    const d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      ret = d.body[method];
    }
  }
  return ret;
}

function setTransformOrigin(node: any, value: string) {
  const style = node.style;
  ['Webkit', 'Moz', 'Ms', 'ms'].forEach((prefix: string) => {
    style[`${prefix}TransformOrigin`] = value;
  });
  style.transformOrigin = value;
}

function offset(el: any) {
  const rect = el.getBoundingClientRect();
  const pos = {
    left: rect.left,
    top: rect.top,
  };
  const doc = el.ownerDocument;
  const w = doc.defaultView || doc.parentWindow;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}

function getLeftTop(content: any) {
  let t = 0;
  let l = 0;
  /* tslint:disable */
  for (t = content.offsetTop, l = content.offsetLeft, content = content.offsetParent; content;) {
    t += content.offsetTop;
    l += content.offsetLeft;
    content = content.offsetParent
  }
  /* tslint:enable */
  return {
    top: t,
    left: l,
  };
}

export default class Dialog extends Component<IDialogPropTypes, any> {
  static defaultProps = {
    className: '',
    mask: true,
    visible: false,
    keyboard: true,
    closable: true,
    maskClosable: true,
    destroyOnClose: false,
    prefixCls: 'rc-dialog',
    center: false,
  };

  private inTransition: boolean;

  private titleId: string;

  private openTime: number;

  private lastOutSideFocusNode: HTMLElement | null;

  private wrap: HTMLElement;

  private dialog: any;

  private content: any;

  private header: any;

  private sentinel: HTMLElement;

  private bodyIsOverflowing: boolean;

  private scrollbarWidth: number;

  private resizeEvent?: EventManager;

  private moveEvent?: EventManager;

  componentWillMount() {
    this.inTransition = false;
    this.titleId = `rcDialogTitle${uuid++}`;
  }

  componentDidMount() {
    const { center } = this.props;
    const dialogNode: any = findDOMNode(this.dialog);
    if (center && dialogNode) {
      const { style } = dialogNode;
      this.center();
      style.margin = '0';
      style.padding = '0';
      this.onEventListener();
    }
    this.componentDidUpdate({});
  }

  componentDidUpdate(prevProps: IDialogPropTypes) {
    const { mousePosition, visible, mask, movable } = this.props;
    if (visible) {
      // first show
      if (!prevProps.visible) {
        this.center();
        this.openTime = Date.now();
        this.lastOutSideFocusNode = document.activeElement as HTMLElement;
        this.addScrollingEffect();
        this.tryFocus();
        const dialogNode = findDOMNode(this.dialog);
        if (mousePosition) {
          const elOffset = offset(dialogNode);
          setTransformOrigin(
            dialogNode,
            `${mousePosition.x - elOffset.left}px ${mousePosition.y - elOffset.top}px`,
          );
        } else {
          setTransformOrigin(dialogNode, '');
        }
      }
    } else if (prevProps.visible) {
      this.inTransition = true;
      if (mask && this.lastOutSideFocusNode) {
        try {
          this.lastOutSideFocusNode.focus();
        } catch (e) {
          this.lastOutSideFocusNode = null;
        }
        this.lastOutSideFocusNode = null;
      }
    }
    if (this.header && movable) {
      Object.assign((this.header as HTMLElement).style, {
        cursor: 'move',
      });
    }
  }

  componentWillUnmount() {
    const { visible } = this.props;
    if (visible || this.inTransition) {
      this.removeScrollingEffect();
    }
    this.removeEventListener();
  }

  center = () => {
    const { center } = this.props;
    const dialogNode: any = findDOMNode(this.dialog);
    if (center && dialogNode && typeof window !== 'undefined') {
      const { clientWidth: docWidth, clientHeight: docHeight } = window.document.documentElement;
      const { offsetWidth: width, offsetHeight: height, style } = dialogNode;
      style.left = `${Math.max((docWidth - width) / 2, 0)}px`;
      style.top = `${Math.max((docHeight - height) / 2, 0)}px`;
    }
  };

  tryFocus() {
    if (!contains(this.wrap, document.activeElement)) {
      this.lastOutSideFocusNode = document.activeElement as HTMLElement;
      this.wrap.focus();
    }
  }

  onEventListener = () => {
    if (typeof window !== 'undefined') {
      this.resizeEvent = new EventManager(window).addEventListener('resize', this.center);
    }
  };

  removeEventListener = () => {
    if (this.resizeEvent) {
      this.resizeEvent.clear();
    }
    if (this.moveEvent) {
      this.moveEvent.clear();
    }
  };

  onAnimateLeave = () => {
    const { afterClose } = this.props;
    // need demo?
    // https://github.com/react-component/dialog/pull/28
    if (this.wrap) {
      this.wrap.style.display = 'none';
    }
    this.inTransition = false;
    this.removeScrollingEffect();
    if (afterClose) {
      afterClose();
    }
  };

  onAnimateEnd = () => {
    const { animationEnd } = this.props;
    if (animationEnd) {
      animationEnd();
    }
  };

  onMaskClick: MouseEventHandler<HTMLDivElement> = e => {
    // android trigger click on open (fastclick??)
    if (Date.now() - this.openTime < 300) {
      return;
    }
    if (e.target === e.currentTarget) {
      this.close(e);
    }
  };

  onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const props = this.props;
    if (props.keyboard && e.keyCode === KeyCode.ESC) {
      e.stopPropagation();
      this.close(e);
      return;
    }
    // keep focus inside dialog
    if (props.visible) {
      if (e.keyCode === KeyCode.TAB) {
        const activeElement = document.activeElement;
        const dialogRoot = this.wrap;
        if (e.shiftKey) {
          if (activeElement === dialogRoot) {
            this.sentinel.focus();
          }
        } else if (activeElement === this.sentinel) {
          dialogRoot.focus();
        }
      }
    }
  };

  getDialogElement = () => {
    const props = this.props;
    const closable = props.closable;
    const prefixCls = props.prefixCls;
    const dest: any = {};
    if (props.width !== undefined) {
      dest.width = isNumber(props.width) ? pxToRem(props.width) : props.width;
    }
    if (props.height !== undefined) {
      dest.height = isNumber(props.height) ? pxToRem(props.height) : props.height;
    }
    let footer;
    if (props.footer) {
      footer = (
        <div className={`${prefixCls}-footer`} ref={this.saveRef('footer')}>
          {props.footer}
        </div>
      );
    }

    let header;
    if (props.title) {
      header = (
        <div onMouseDown={this.handleHeaderMouseDown} className={`${prefixCls}-header`} ref={this.saveRef('header')}>
          <div className={`${prefixCls}-title`} id={this.titleId}>
            {props.title}
          </div>
        </div>
      );
    }

    let closer;
    if (closable) {
      closer = (
        <button
          type="button"
          onClick={this.close}
          aria-label="Close"
          className={`${prefixCls}-close`}
        >
          {props.closeIcon || <Icon className={`${prefixCls}-close-x`} type="close" />}
        </button>
      );
    }

    const style = { ...props.style, ...dest };
    const transitionName = this.getTransitionName();
    const dialogElement = (
      <LazyRenderBox
        key="dialog-element"
        role="document"
        ref={this.saveRef('dialog')}
        style={style}
        className={`${prefixCls} ${props.className || ''}`}
        hidden={!props.visible}
      >
        <div ref={this.saveRef('content')} className={`${prefixCls}-content`}>
          {closer}
          {header}
          <div
            className={`${prefixCls}-body`}
            style={props.bodyStyle}
            ref={this.saveRef('body')}
            {...props.bodyProps}
          >
            {props.children}
          </div>
          {footer}
        </div>
        <div
          tabIndex={0}
          ref={this.saveRef('sentinel')}
          style={{ width: 0, height: 0, overflow: 'hidden' }}
        >
          sentinel
        </div>
      </LazyRenderBox>
    );
    return (
      <Animate
        key="dialog"
        hiddenProp="hidden"
        onEnd={this.onAnimateEnd}
        onLeave={this.onAnimateLeave}
        transitionName={transitionName}
        component=""
        transitionAppear
      >
        {props.visible || !props.destroyOnClose ? dialogElement : null}
      </Animate>
    );
  };

  handleHeaderMouseDown = (downEvent: React.MouseEvent) => {
    const { wrap, props: { movable } } = this;
    const { content } = this;
    const dialogNode = findDOMNode(this.dialog);
    if (wrap && content && dialogNode && movable) {
      const clientX = transformZoomData(downEvent.clientX);
      const clientY = transformZoomData(downEvent.clientY);
      let { offsetLeft, offsetTop } = wrap;
      if ((dialogNode as HTMLElement).style.margin !== '0rem') {
        const { left, top } = getLeftTop(content);
        offsetLeft = left;
        offsetTop = top;
      }
      let { moveEvent } = this;
      if (!moveEvent) {
        moveEvent = new EventManager(typeof window === 'undefined' ? undefined : document);
        this.moveEvent = moveEvent;
      }
      moveEvent
        .addEventListener('mousemove', (moveEvent: React.MouseEvent) => {
          const moveX = transformZoomData(moveEvent.clientX);
          const moveY = transformZoomData(moveEvent.clientY);
          const left = Math.max(offsetLeft + moveX - clientX, 0);
          const top = Math.max(offsetTop + moveY - clientY, 0);
          if ((dialogNode as HTMLElement).style.margin !== '0rem') {
            offsetLeft = left;
            offsetTop = top;
            Object.assign((dialogNode as HTMLElement).style, {
              margin: `0rem`,
              top: `0px`,
            });
            Object.assign(wrap.style, {
              left: `${left}px`,
              top: `${top}px`,
              overflow: `hidden`,
            });
          }
          Object.assign((dialogNode as HTMLElement).style, {
            margin: `0rem`,
            top: `0px`,
          });
          Object.assign(wrap.style, {
            left: `${left}px`,
            top: `${top}px`,
          });
        })
        .addEventListener('mouseup', () => {
          if (moveEvent) {
            moveEvent.clear();
          }
        });
    }
  };

  getZIndexStyle = () => {
    const style: any = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  };

  getWrapStyle = (): any => {
    const { wrapStyle } = this.props;
    return { ...this.getZIndexStyle(), ...wrapStyle };
  };

  getMaskStyle = () => {
    const { maskStyle } = this.props;
    return { ...this.getZIndexStyle(), ...maskStyle };
  };

  getMaskElement = () => {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getMaskStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          hidden={!props.visible}
          {...props.maskProps}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            hiddenProp="hidden"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
    }
    return maskElement;
  };

  getMaskTransitionName = () => {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  };

  getTransitionName = () => {
    const props = this.props;
    let transitionName = props.transitionName;
    const animation = props.animation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  };

  setScrollbar = () => {
    if (this.bodyIsOverflowing && this.scrollbarWidth !== undefined) {
      document.body.style.paddingRight = `${this.scrollbarWidth}px`;
    }
  };

  addScrollingEffect = () => {
    openCount++;
    if (openCount !== 1) {
      return;
    }
    this.checkScrollbar();
    this.setScrollbar();
    document.body.style.overflow = 'hidden';
    // this.adjustDialog();
  };

  removeScrollingEffect = () => {
    openCount--;
    if (openCount !== 0) {
      return;
    }
    document.body.style.overflow = '';
    this.resetScrollbar();
    // this.resetAdjustments();
  };

  close = (e: any) => {
    const { onClose } = this.props;
    if (onClose) {
      onClose(e);
    }
  };

  checkScrollbar = () => {
    let fullWindowWidth = window.innerWidth;
    if (!fullWindowWidth) {
      // workaround for missing window.innerWidth in IE8
      const documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    if (this.bodyIsOverflowing) {
      this.scrollbarWidth = getScrollBarSize();
    }
  };

  resetScrollbar = () => {
    document.body.style.paddingRight = '';
  };

  adjustDialog = () => {
    const { wrap } = this;
    if (wrap && this.scrollbarWidth !== undefined) {
      const modalIsOverflowing = wrap.scrollHeight > document.documentElement.clientHeight;
      wrap.style.paddingLeft = `${
        !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : ''
      }px`;
      wrap.style.paddingRight = `${
        this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
      }px`;
    }
  };

  resetAdjustments = () => {
    const { wrap } = this;
    if (wrap) {
      const { style } = wrap;
      style.paddingLeft = '';
      style.paddingRight = '';
    }
  };

  saveRef = (name: string) => (node: any) => {
    (this as any)[name] = node;
  };

  render() {
    const { props } = this;
    const { prefixCls, maskClosable } = props;
    const style = this.getWrapStyle();
    // clear hide display
    // and only set display after async anim, not here for hide
    if (props.visible) {
      style.display = null;
    }
    return (
      <div>
        {this.getMaskElement()}
        <div
          tabIndex={-1}
          onKeyDown={this.onKeyDown}
          className={`${prefixCls}-wrap ${props.wrapClassName || ''}`}
          ref={this.saveRef('wrap')}
          onClick={maskClosable ? this.onMaskClick : undefined}
          role="dialog"
          aria-labelledby={props.title ? this.titleId : null}
          style={style}
          {...props.wrapProps}
        >
          {this.getDialogElement()}
        </div>
      </div>
    );
  }
}
