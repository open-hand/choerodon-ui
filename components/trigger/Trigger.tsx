import React, { Children, Component, CSSProperties, isValidElement, Key, MouseEventHandler, ReactElement, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import raf from 'raf';
import { action as mobxAction, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import isFragment from 'choerodon-ui/pro/lib/_util/isFragment';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import { ElementProps } from 'choerodon-ui/pro/lib/core/ViewComponent';
import focusable, { findFocusableParent } from 'choerodon-ui/pro/lib/_util/focusable';
import { getIf } from 'choerodon-ui/pro/lib/data-set/utils';
import { isChrome, isIE, isSafari, isWeChat } from '../_util/browser';
import KeyCode from '../_util/KeyCode';
import TaskRunner from '../_util/TaskRunner';
import Popup from './Popup';
import EventManager from '../_util/EventManager';
import { Action, HideAction, ShowAction } from './enum';
import TriggerChild from './TriggerChild';
import { Config, ConfigKeys, DefaultConfig } from '../configure';

function isHTMLInputElement(target: HTMLElement): target is HTMLInputElement {
  return target.tagName.toLowerCase() === 'input';
}

function isButton(target: HTMLElement): target is HTMLButtonElement {
  return target.tagName.toLowerCase() === 'button' || (isHTMLInputElement(target) && target.type === 'button');
}

function isPointsEq(a1: string[], a2: string[]): boolean {
  return a1[0] === a2[0] && a1[1] === a2[1];
}

function getPopupClassNameFromAlign(builtinPlacements, prefixCls, align): string {
  const { points } = align;
  const found = Object.keys(builtinPlacements).find(
    placement =>
      ({}.hasOwnProperty.call(builtinPlacements, placement) &&
        isPointsEq(builtinPlacements[placement].points, points)),
  );
  return found ? `${prefixCls}-popup-placement-${found}` : '';
}

function getAlignFromPlacement(builtinPlacements, placementStr, align) {
  const baseAlign = builtinPlacements[placementStr] || {};
  return {
    ...baseAlign,
    ...align,
  };
}

function getPopupAlign(props) {
  const { popupPlacement, popupAlign, builtinPlacements } = props;
  if (popupPlacement && builtinPlacements) {
    return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
  }
  return popupAlign;
}

function contains(root, n) {
  if (root) {
    let node = n;
    while (node) {
      if (node === root || (root.contains && root.contains(node))) {
        return true;
      }
      node = node.parentNode;
    }
  }
  return false;
}

export type RenderFunction = (props?: { trigger?: ReactNode }) => React.ReactNode;

export type ChildrenFunction = (caller: (node: ReactNode) => ReactNode, childrenProps?: any) => ReactElement;

function isChildrenFunction(fn: ReactNode | ChildrenFunction): fn is ChildrenFunction {
  return typeof fn === 'function';
}

export interface TriggerProps extends ElementProps {
  action?: Action[];
  showAction?: ShowAction[];
  hideAction?: HideAction[];
  popupContent?: ReactNode | RenderFunction;
  popupCls?: string;
  popupStyle?: CSSProperties;
  popupInnerStyle?: CSSProperties;
  popupHidden?: boolean;
  popupPlacement?: string;
  popupAlign?: object;
  builtinPlacements?: any;
  onPopupAlign?: (source: Node, align: object, target: Node | Window, translate: { x: number; y: number }) => void;
  onPopupAnimateAppear?: (key: Key | null) => void;
  onPopupAnimateEnter?: (key: Key | null) => void;
  onPopupAnimateLeave?: (key: Key | null) => void;
  onPopupAnimateEnd?: (key: Key | null, exists: boolean) => void;
  onPopupHiddenBeforeChange?: (hidden: boolean) => boolean;
  onPopupHiddenChange?: (hidden: boolean) => void;
  onPopupMouseEnter?: MouseEventHandler<any>;
  onPopupMouseLeave?: MouseEventHandler<any>;
  getRootDomNode?: () => Element | null | Text;
  getPopupStyleFromAlign?: (target: Node | Window, align: object) => object | undefined;
  getPopupClassNameFromAlign?: (align: object) => string | undefined;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement | undefined | null;
  focusDelay?: number;
  blurDelay?: number;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  transitionName?: string;
  defaultPopupHidden?: boolean;
  forceRender?: boolean;
  tabIntoPopupContent?: boolean;
  popupClassName?: string;
  children?: ReactNode | ChildrenFunction;
  childrenProps?: any;
  getContextConfig?<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T];
}

@observer
export default class Trigger extends Component<TriggerProps> {
  static displayName = 'Trigger';

  static defaultProps = {
    focusDelay: 150,
    blurDelay: 0,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    transitionName: 'slide-up',
    defaultPopupHidden: true,
  };

  domNode: Element | Text | null;

  popup: Popup | null;

  popupTask?: TaskRunner;

  documentEvent?: EventManager;

  focusTime = 0;

  preClickTime = 0;

  animateFrameId = 0;

  @observable popupHidden?: boolean;

  @observable mounted?: boolean;

  activeElement?: HTMLElement | null;

  relatedTarget?: HTMLButtonElement | null;

  activeElementEvent?: EventManager;

  mouseDownEvent?: EventManager;

  currentTriggerChild?: ReactElement | null;

  focusElements?: HTMLElement[];

  target?: HTMLElement | null;

  focusTarget?: HTMLElement | null;

  align?: object;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.popupHidden = 'popupHidden' in props ? props.popupHidden : props.defaultPopupHidden;
      this.align = getPopupAlign(props);
    });
  }

  @autobind
  saveRef(node) {
    this.popup = node;
  }

  setActiveElement(activeElement: HTMLElement | null) {
    this.activeElement = activeElement;
    const activeElementEvent = getIf<Trigger, EventManager>(this, 'activeElementEvent', () => new EventManager());
    if (activeElement) {
      if (this.relatedTarget) {
        const { target } = this;
        if (target && document.activeElement === document.body) {
          this.activeElement = null;
          target.focus();
        }
        this.relatedTarget = null;
      } else {
        activeElementEvent.clear().setTarget(activeElement).addEventListener('blur', () => {
          const { target } = this;
          if (target && document.activeElement === document.body) {
            this.setActiveElement(null);
            target.focus();
          }
        }, { once: true });
      }
    } else {
      activeElementEvent.clear();
    }
  }

  @autobind
  getFocusableElements(elements) {
    this.focusElements = elements;
    const { target, activeElement } = this;
    if (target && activeElement && (!elements || !elements.includes(activeElement))) {
      if (!elements || !elements.length) {
        this.setActiveElement(null);
        target.focus();
      }
    }
  }

  @autobind
  renderTriggerChild(child: ReactNode): ReactNode {
    if (child) {
      if (isFragment(child)) {
        const { props: { children } } = child;
        return Children.map<ReactNode, ReactNode>(children, (fragmentChild) => this.renderTriggerChild(fragmentChild));
      }
      if (isValidElement(child)) {
        const newChildProps: any = {
          key: child.key,
        };
        if (this.isContextMenuToShow()) {
          newChildProps.onContextMenu = this.handleEvent;
        }
        if (this.isClickToHide() || this.isClickToShow()) {
          newChildProps.onClick = this.handleEvent;
          newChildProps.onMouseDown = this.handleEvent;
        }
        if (this.isMouseEnterToShow()) {
          newChildProps.onMouseEnter = this.handleEvent;
          const { mouseEnterDelay } = this.props;
          if (mouseEnterDelay && !this.isMouseLeaveToHide()) {
            newChildProps.onMouseLeave = this.cancelPopupTask;
          }
        }
        if (this.isMouseLeaveToHide()) {
          newChildProps.onMouseLeave = this.handleEvent;
          const { mouseLeaveDelay } = this.props;
          if (mouseLeaveDelay && !this.isMouseEnterToShow()) {
            newChildProps.onMouseEnter = this.cancelPopupTask;
          }
        }
        if (this.isFocusToShow() || this.isBlurToHide()) {
          newChildProps.onFocus = this.handleEvent;
          newChildProps.onBlur = this.handleEvent;
        }
        newChildProps.onKeyDown = this.handleEvent;
        newChildProps.popupHidden = this.popupHidden;
        return <TriggerChild {...newChildProps}>{child}</TriggerChild>;
      }
    }
    return child;
  }

  render() {
    const { children, childrenProps } = this.props;
    const popup = this.getPopup();
    const newChildren = isChildrenFunction(children) ? children(this.renderTriggerChild, childrenProps) : Children.map<ReactNode, ReactNode>(children, child => this.renderTriggerChild(child));
    return [newChildren, popup];
  }

  @mobxAction
  componentWillReceiveProps(nextProps) {
    const { popupHidden } = nextProps;
    if (popupHidden !== this.popupHidden && popupHidden !== undefined) {
      this.popupHidden = popupHidden;
    }
    const newAlign = getPopupAlign(nextProps);
    if (!isEqual(this.align, newAlign)) {
      this.align = newAlign;
    }
  }

  @mobxAction
  componentDidMount() {
    this.mounted = true;
    this.domNode = findDOMNode(this);
    if (!isChrome() && (isSafari() || isWeChat())) {
      this.mouseDownEvent = new EventManager(document).addEventListener('mousedown', (e) => {
        if (!this.popupHidden) {
          const { target } = e;
          if (isButton(target)) {
            this.relatedTarget = target;
          } else {
            const parent = findFocusableParent(target);
            if (parent && isButton(parent)) {
              this.relatedTarget = parent;
            }
          }
        }
      });
    }
  }

  componentDidUpdate() {
    this.domNode = findDOMNode(this);
    const { popupHidden } = this;
    if (this.documentEvent) {
      this.documentEvent.clear();
    }
    if (!popupHidden) {
      const documentEvent = getIf<Trigger, EventManager>(this, 'documentEvent', () => new EventManager(typeof window === 'undefined' ? undefined : document));
      documentEvent.addEventListener('scroll', this.handleDocumentScroll, true);
      if ((this.isClickToHide() || this.isContextMenuToShow()) && !this.isBlurToHide()) {
        documentEvent.addEventListener('mousedown', this.handleDocumentMouseDown);
      }
    }
  }

  componentWillUnmount() {
    this.cancelPopupTask();
    if (this.documentEvent) {
      this.documentEvent.clear();
    }
    if (this.activeElementEvent) {
      this.activeElementEvent.clear();
    }
    if (this.mouseDownEvent) {
      this.mouseDownEvent.clear();
    }
  }

  @autobind
  cancelPopupTask() {
    if (this.popupTask) {
      this.popupTask.cancel();
    }
  }

  @autobind
  handlePopupKeyDown(e) {
    const { focusTarget, activeElement } = this;
    if (activeElement && focusTarget && e.keyCode === KeyCode.TAB) {
      const { focusElements } = this;
      const { shiftKey } = e;
      if (focusElements && focusElements.indexOf(activeElement) === (shiftKey ? 0 : focusElements.length - 1)) {
        if (shiftKey) {
          e.preventDefault();
        }
        focusTarget.focus();
      }
    }
  }

  @autobind
  handleTargetBlur(e, child: ReactElement): boolean {
    const { popup, focusTarget } = this;
    const relatedTarget: HTMLElement | null = isIE() ? document.activeElement : e.relatedTarget || this.relatedTarget;
    if (popup && relatedTarget && popup.element.contains(relatedTarget)) {
      e.stopPropagation();
      this.setActiveElement(relatedTarget);
      this.currentTriggerChild = child;
      if (!focusTarget) {
        this.focusTarget = e.target;
      }
      return false;
    }
    if (focusTarget) {
      this.focusTarget = null;
      this.setActiveElement(null);
      this.currentTriggerChild = null;
      if (focusTarget !== relatedTarget) {
        this.handleTriggerEvent('Blur', child, e);
      }
    }
    return true;
  }

  handleTriggerEvent(eventName, child, e) {
    const { [`on${eventName}`]: handle } = this.props as { [key: string]: any };
    const { [`on${eventName}`]: childHandle } = child.props;
    if (childHandle) {
      childHandle(e);
    }
    if (!e.isDefaultPrevented()) {
      if (handle) {
        handle(e);
      }
      if (!e.isDefaultPrevented()) {
        this[`handle${eventName}`].call(this, e);
      }
    }
  }

  @autobind
  handleEvent(eventName: string, child: ReactElement, e) {
    if (this.isBlurToHide() && eventName === 'Blur' && !this.handleTargetBlur(e, child)) {
      if (!this.target) {
        this.target = e.target;
      }
    } else {
      this.handleTriggerEvent(eventName, child, e);
    }
  }

  @autobind
  handlePopupMouseDown(e) {
    let fix = false;
    const { popup } = this;
    const popupElement = popup && popup.element;
    const { target } = e;
    if (!e.isDefaultPrevented()) {
      const element = focusable(target) ? target : findFocusableParent(target, popupElement);
      if (element) {
        e.stopPropagation();
      } else {
        fix = true;
      }
    } else {
      fix = true;
    }
    if (fix && this.isBlurToHide()) {
      const { ownerDocument } = target;
      if (ownerDocument) {
        const { activeElement } = ownerDocument;
        if (activeElement && activeElement !== ownerDocument.body) {
          const el = findDOMNode(this);
          if (el && el.contains(activeElement)) {
            e.preventDefault();
          }
        }
      }
    }
  }

  @autobind
  handlePopupBlur(e) {
    if (this.isBlurToHide()) {
      const { activeElement, currentTriggerChild } = this;
      if (activeElement && currentTriggerChild) {
        this.handleTargetBlur(e, currentTriggerChild);
      }
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    this.setPopupHidden(false);
  }

  handleKeyDown(e) {
    const { tabIntoPopupContent } = this.props;
    if (!this.popupHidden && tabIntoPopupContent && this.focusElements && e.keyCode === KeyCode.TAB && !e.shiftKey) {
      const [firstFocusElement] = this.focusElements;
      if (firstFocusElement) {
        e.preventDefault();
        firstFocusElement.focus();
      }
    }
  }

  handleFocus() {
    if (this.isFocusToShow()) {
      const { focusDelay } = this.props;
      this.focusTime = Date.now();
      this.delaySetPopupHidden(false, focusDelay);
    }
  }

  handleBlur() {
    if (this.isBlurToHide()) {
      const { blurDelay } = this.props;
      this.delaySetPopupHidden(true, blurDelay);
    }
  }

  @autobind
  handleDocumentMouseDown(e) {
    if (this.popup) {
      const { target } = e;
      if (!contains(findDOMNode(this), target) && !contains(findDOMNode(this.popup), target)) {
        this.setPopupHidden(true);
      }
    }
  }

  @autobind
  handleDocumentScroll({ target }) {
    if (this.popup && target !== document && !contains(findDOMNode(this.popup), target)) {
      if (this.animateFrameId) {
        raf.cancel(this.animateFrameId);
      }
      this.animateFrameId = raf(this.forcePopupAlign);
    }
  }

  handleMouseDown() {
    this.preClickTime = Date.now();
  }

  handleClick(e) {
    const { popupHidden } = this;
    if (this.focusTime) {
      if (Math.abs(this.preClickTime - this.focusTime) < 20) {
        return;
      }
      this.focusTime = 0;
    }
    this.preClickTime = 0;
    if ((this.isClickToHide() && !popupHidden) || (popupHidden && this.isClickToShow())) {
      e.preventDefault();
      this.setPopupHidden(!popupHidden);
    }
  }

  handleMouseEnter() {
    const { mouseEnterDelay } = this.props;
    this.delaySetPopupHidden(false, mouseEnterDelay);
  }

  handleMouseLeave() {
    const { mouseLeaveDelay } = this.props;
    this.delaySetPopupHidden(true, mouseLeaveDelay);
  }

  @autobind
  handlePopupMouseEnter(e) {
    this.cancelPopupTask();
    const { onPopupMouseEnter } = this.props;
    if (onPopupMouseEnter) {
      onPopupMouseEnter(e);
    }
  }

  @autobind
  handlePopupMouseLeave(e) {
    const { mouseLeaveDelay, onPopupMouseLeave } = this.props;
    this.delaySetPopupHidden(true, mouseLeaveDelay);
    if (onPopupMouseLeave) {
      onPopupMouseLeave(e);
    }
  }

  @autobind
  getPopupContainer(target: HTMLElement): HTMLElement | undefined {
    if (target) {
      let docNode: HTMLElement | ParentNode | null = target;
      while (docNode && !(docNode instanceof Document)) {
        docNode = (docNode as HTMLElement).parentNode;
      }
      if (docNode && (docNode instanceof Document)) {
        return docNode.body;
      }
    }
  }

  getPopup(): ReactNode {
    const {
      prefixCls,
      popupCls,
      popupStyle,
      popupClassName,
      onPopupAnimateAppear,
      onPopupAnimateEnter,
      onPopupAnimateLeave,
      onPopupAnimateEnd,
      onPopupAlign,
      onPopupMouseEnter,
      onPopupMouseLeave,
      getPopupStyleFromAlign,
      getRootDomNode = this.getRootDomNode,
      transitionName,
      getPopupContainer = this.getPopupContainer,
      forceRender,
    } = this.props;
    if (this.mounted || !getPopupContainer) {
      const hidden = this.popupHidden;
      if (!hidden || this.popup || forceRender) {
        const mouseProps: any = {
          onMouseEnter: this.isMouseEnterToShow() ? this.handlePopupMouseEnter : onPopupMouseEnter,
          onMouseLeave: this.isMouseLeaveToHide() ? this.handlePopupMouseLeave : onPopupMouseLeave,
        };
        return (
          <Popup
            key="popup"
            ref={this.saveRef}
            transitionName={transitionName}
            className={classNames(`${prefixCls}-popup`, popupCls, popupClassName)}
            style={popupStyle}
            hidden={hidden}
            align={this.align}
            onAlign={onPopupAlign}
            onMouseDown={this.handlePopupMouseDown}
            onKeyDown={this.handlePopupKeyDown}
            onBlur={this.handlePopupBlur}
            getFocusableElements={this.getFocusableElements}
            getRootDomNode={getRootDomNode}
            onAnimateAppear={onPopupAnimateAppear}
            onAnimateEnter={onPopupAnimateEnter}
            onAnimateLeave={onPopupAnimateLeave}
            onAnimateEnd={onPopupAnimateEnd}
            getStyleFromAlign={getPopupStyleFromAlign}
            getClassNameFromAlign={this.getPopupClassNameFromAlign}
            getPopupContainer={getPopupContainer}
            forceRender={forceRender}
            {...mouseProps}
          >
            {this.getPopupContent()}
          </Popup>
        );
      }
    }
  }

  @autobind
  getRootDomNode() {
    if (this.domNode) {
      return this.domNode;
    }
    return findDOMNode(this);
  }

  @autobind
  getPopupClassNameFromAlign(align): string {
    const className: string[] = [];
    const {
      popupPlacement,
      builtinPlacements,
      prefixCls,
      getPopupClassNameFromAlign: getCls,
    } = this.props;
    if (popupPlacement && builtinPlacements) {
      className.push(getPopupClassNameFromAlign(builtinPlacements, prefixCls, align));
    }
    if (getCls) {
      const cls = getCls(align);
      if (cls) {
        className.push(cls);
      }
    }
    return className.join(' ');
  }

  @autobind
  forcePopupAlign() {
    if (!this.popupHidden && this.popup) {
      this.popup.forceAlign();
    }
  }

  getPopupWrapper(): HTMLDivElement | undefined {
    if (!this.popupHidden && this.popup) {
      return this.popup.wrapper;
    }
  }

  getPopupContent() {
    const { popupContent, children } = this.props;
    return typeof popupContent === 'function' ? popupContent({ trigger: children }) : popupContent;
  }

  popupHiddenBeforeChange(hidden: boolean): boolean {
    const { onPopupHiddenBeforeChange = noop } = this.props;
    if (onPopupHiddenBeforeChange(hidden) === false) {
      return false;
    }
    // if (hidden === false) {
    //   return !isEmpty(this.getPopupContent());
    // }
    return true;
  }

  @mobxAction
  setPopupHidden(hidden: boolean) {
    this.cancelPopupTask();
    if (this.popupHidden !== hidden) {
      const { popupHidden, onPopupHiddenChange = noop } = this.props;
      if (this.popupHiddenBeforeChange(hidden) !== false) {
        if (popupHidden === undefined) {
          this.popupHidden = hidden;
        }
        onPopupHiddenChange(hidden);
      }
    }
  }

  delaySetPopupHidden(popupHidden, delay) {
    this.cancelPopupTask();
    if (delay) {
      getIf<Trigger, TaskRunner>(this, 'popupTask', () => new TaskRunner()).delay(delay, () => {
        this.setPopupHidden(popupHidden);
      });
    } else {
      this.setPopupHidden(popupHidden);
    }
  }

  isClickToShow() {
    const { action = [], showAction = [] } = this.props;
    return action.indexOf(Action.click) !== -1 || showAction.indexOf(ShowAction.click) !== -1;
  }

  isContextMenuToShow() {
    const { action = [], showAction = [] } = this.props;
    return (
      action.indexOf(Action.contextMenu) !== -1 || showAction.indexOf(ShowAction.contextMenu) !== -1
    );
  }

  isClickToHide() {
    const { action = [], hideAction = [] } = this.props;
    return action.indexOf(Action.click) !== -1 || hideAction.indexOf(HideAction.click) !== -1;
  }

  isMouseEnterToShow() {
    const { action = [], showAction = [] } = this.props;
    return action.indexOf(Action.hover) !== -1 || showAction.indexOf(ShowAction.mouseEnter) !== -1;
  }

  isMouseLeaveToHide() {
    const { action = [], hideAction = [] } = this.props;
    return action.indexOf(Action.hover) !== -1 || hideAction.indexOf(HideAction.mouseLeave) !== -1;
  }

  isFocusToShow() {
    const { action = [], showAction = [] } = this.props;
    return action.indexOf(Action.focus) !== -1 || showAction.indexOf(ShowAction.focus) !== -1;
  }

  isBlurToHide() {
    const { action = [], hideAction = [], getContextConfig } = this.props;
    const formAutoFocus = getContextConfig ? getContextConfig('formAutoFocus') : false;
    return action.indexOf(Action.focus) !== -1 || hideAction.indexOf(HideAction.blur) !== -1 || formAutoFocus;
  }
}
