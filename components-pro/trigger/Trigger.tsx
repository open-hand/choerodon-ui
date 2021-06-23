import React, { Children, Component, CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import raf from 'raf';
import { action as mobxAction, observable, runInAction } from 'mobx';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Popup from './Popup';
import autobind from '../_util/autobind';
import TaskRunner from '../_util/TaskRunner';
import { ElementProps } from '../core/ViewComponent';
import EventManager from '../_util/EventManager';
import { Action, HideAction, ShowAction } from './enum';
import TriggerChild from './TriggerChild';
import isEmpty from '../_util/isEmpty';
import focusable, { findFocusableParent } from '../_util/focusable';
import isIE from '../_util/isIE';

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

export type ChildrenFunction = (caller: (node: ReactElement) => ReactElement) => ReactElement;

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
  popupHidden?: boolean;
  popupPlacement?: string;
  popupAlign?: object;
  builtinPlacements?: any;
  onPopupAlign?: (source: Node, align: object, target: Node | Window, translate: { x: number, y: number }) => void;
  onPopupAnimateAppear?: (key: Key | null) => void;
  onPopupAnimateEnter?: (key: Key | null) => void;
  onPopupAnimateLeave?: (key: Key | null) => void;
  onPopupAnimateEnd?: (key: Key | null, exists: boolean) => void;
  onPopupHiddenBeforeChange?: (hidden: boolean) => boolean;
  onPopupHiddenChange?: (hidden: boolean) => void;
  getRootDomNode?: () => Element | null | Text;
  getPopupStyleFromAlign?: (target: Node | Window, align: object) => object | undefined;
  getPopupClassNameFromAlign?: (align: object) => string | undefined;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
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
}

@observer
export default class Trigger extends Component<TriggerProps> {
  static displayName = 'Trigger';

  static propTypes = {
    action: MobxPropTypes.arrayOrObservableArrayOf(
      PropTypes.oneOf([Action.hover, Action.contextMenu, Action.focus, Action.click]),
    ),
    showAction: MobxPropTypes.arrayOrObservableArrayOf(
      PropTypes.oneOf([
        ShowAction.mouseEnter,
        ShowAction.contextMenu,
        ShowAction.focus,
        ShowAction.click,
      ]),
    ),
    hideAction: MobxPropTypes.arrayOrObservableArrayOf(
      PropTypes.oneOf([HideAction.blur, HideAction.mouseLeave, HideAction.click]),
    ),
    popupContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    popupCls: PropTypes.string,
    popupStyle: PropTypes.object,
    popupHidden: PropTypes.bool,
    popupPlacement: PropTypes.string,
    popupAlign: PropTypes.object,
    builtinPlacements: PropTypes.any,
    onPopupAnimateAppear: PropTypes.func,
    onPopupAnimateEnter: PropTypes.func,
    onPopupAnimateLeave: PropTypes.func,
    onPopupAnimateEnd: PropTypes.func,
    onPopupAlign: PropTypes.func,
    onPopupHiddenChange: PropTypes.func,
    getPopupStyleFromAlign: PropTypes.func,
    getPopupContainer: PropTypes.func,
    focusDelay: PropTypes.number,
    blurDelay: PropTypes.number,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    transitionName: PropTypes.string,
    defaultPopupHidden: PropTypes.bool,
    popupClassName: PropTypes.string,
    tabIntoPopupContent: PropTypes.bool,
  };

  static defaultProps = {
    focusDelay: 150,
    blurDelay: 0,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    transitionName: 'slide-up',
    defaultPopupHidden: true,
  };

  popup: Popup | null;

  popupTask: TaskRunner = new TaskRunner();

  documentEvent: EventManager = new EventManager(typeof window === 'undefined' ? undefined : document);

  focusTime: number = 0;

  preClickTime: number = 0;

  animateFrameId: number = 0;

  @observable popupHidden?: boolean;

  @observable mounted?: boolean;

  activeElement?: HTMLElement | null | true;

  focusElements?: HTMLElement[];

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

  @autobind
  getFocusableElements(elements) {
    this.focusElements = elements && elements.sort((e1, e2) => e1.tabIndex - e2.tabIndex);
  }

  @autobind
  renderTriggerChild(child: ReactElement): ReactElement {
    const newChildProps: any = {};
    if (this.isContextMenuToShow()) {
      newChildProps.onContextMenu = this.handleEvent;
    }
    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.onClick = this.handleEvent;
      newChildProps.onMouseDown = this.handleEvent;
    }
    if (this.isMouseEnterToShow()) {
      newChildProps.onMouseEnter = this.handleEvent;
    }
    if (this.isMouseLeaveToHide()) {
      newChildProps.onMouseLeave = this.handleEvent;
    }
    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.onFocus = this.handleEvent;
      newChildProps.onBlur = this.handleEvent;
    }
    newChildProps.onKeyDown = this.handleEvent;
    newChildProps.popupHidden = this.popupHidden;
    return <TriggerChild {...newChildProps}>{child}</TriggerChild>;
  }

  render() {
    const { children } = this.props;
    const popup = this.getPopup();
    const newChildren = isChildrenFunction(children) ? children(this.renderTriggerChild) : Children.map(children, child => (
      isValidElement(child) ? this.renderTriggerChild(child) : child
    ));
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
  }

  componentDidUpdate() {
    const { popupHidden } = this;
    this.documentEvent.clear();
    if (!popupHidden) {
      this.documentEvent.addEventListener('scroll', this.handleDocumentScroll, true);
      if ((this.isClickToHide() || this.isContextMenuToShow()) && !this.isBlurToHide()) {
        this.documentEvent.addEventListener('mousedown', this.handleDocumentMouseDown);
      }
    }
  }

  componentWillUnmount() {
    this.popupTask.cancel();
    this.documentEvent.clear();
  }

  @autobind
  handleEvent(eventName, child, e) {
    const { activeElement } = this;
    if (activeElement && this.isBlurToHide() && eventName === 'Blur') {
      e.stopPropagation();
      const { target } = e;
      if (!this.focusTarget) {
        this.focusTarget = target;
      }
      if (activeElement === true) {
        e.preventDefault();
        target.focus();
        this.activeElement = null;
      }
      return;
    }
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
  handlePopupMouseDown(e) {
    let fix = false;
    if (!e.isDefaultPrevented()) {
      const { target } = e;
      const { popup } = this;
      const element = focusable(target) ? target : findFocusableParent(target, popup && popup.element);
      if (element) {
        this.activeElement = element;
        e.stopPropagation();
      } else {
        fix = true;
      }
    } else {
      fix = true;
    }
    if (fix && this.isBlurToHide()) {
      e.preventDefault();
      if (isIE()) {
        this.activeElement = true;
      }
    }
  }

  @autobind
  handlePopupMouseUp() {
    if (this.activeElement === true) {
      this.activeElement = null;
    }
  }

  @autobind
  handlePopupKeyDown(e) {
    const { activeElement } = this;
    if (activeElement && activeElement !== true && e.keyCode === KeyCode.TAB) {
      const { focusElements, focusTarget } = this;
      if (focusElements && focusElements.indexOf(activeElement) === (e.shiftKey ? 0 : focusElements.length - 1)) {
        if (e.shiftKey) {
          e.preventDefault();
        } else {
          this.setPopupHidden(true);
        }
        if (focusTarget) {
          focusTarget.focus();
        }
      }
    }
  }

  @autobind
  handlePopupBlur(e) {
    if (this.activeElement) {
      const { activeElement: target } = this;
      e.stopPropagation();
      this.activeElement = null;
      raf(() => {
        const { activeElement } = document;
        const { popup } = this;
        if (activeElement && popup && popup.element.contains(activeElement)) {
          this.activeElement = activeElement as HTMLElement;
        } else {
          this.setPopupHidden(true);
          if (target && target !== true) {
            target.focus();
            target.blur();
          }
        }
      });
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
        this.activeElement = firstFocusElement;
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
  handlePopupMouseEnter() {
    this.popupTask.cancel();
  }

  @autobind
  handlePopupMouseLeave() {
    const { mouseLeaveDelay } = this.props;
    this.delaySetPopupHidden(true, mouseLeaveDelay);
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
      getPopupStyleFromAlign,
      getRootDomNode = this.getRootDomNode,
      transitionName,
      getPopupContainer,
      forceRender,
    } = this.props;
    if (this.mounted || !getPopupContainer) {
      const hidden = this.popupHidden;
      if (!hidden || this.popup || forceRender) {
        const mouseProps: any = {};
        if (this.isMouseEnterToShow()) {
          mouseProps.onMouseEnter = this.handlePopupMouseEnter;
        }
        if (this.isMouseLeaveToHide()) {
          mouseProps.onMouseLeave = this.handlePopupMouseLeave;
        }
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
            onMouseUp={this.handlePopupMouseUp}
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

  getPopupContent() {
    const { popupContent, children } = this.props;
    return typeof popupContent === 'function' ? popupContent({ trigger: children }) : popupContent;
  }

  popupHiddenBeforeChange(hidden: boolean): boolean {
    const { onPopupHiddenBeforeChange = noop } = this.props;
    if (onPopupHiddenBeforeChange(hidden) === false) {
      return false;
    }
    if (hidden === false) {
      return !isEmpty(this.getPopupContent());
    }
    return true;
  }

  @mobxAction
  setPopupHidden(hidden: boolean) {
    this.popupTask.cancel();
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
    this.popupTask.cancel();
    if (delay) {
      this.popupTask.delay(delay, () => {
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
    const { action = [], hideAction = [] } = this.props;
    return action.indexOf(Action.focus) !== -1 || hideAction.indexOf(HideAction.blur) !== -1;
  }
}
