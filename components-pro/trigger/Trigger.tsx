import React, { Children, Component, CSSProperties, isValidElement, Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import { action as mobxAction, observable, runInAction } from 'mobx';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import noop from 'lodash/noop';
import Popup from './Popup';
import autobind from '../_util/autobind';
import TaskRunner from '../_util/TaskRunner';
import { ElementProps } from '../core/ViewComponent';
import EventManager from '../_util/EventManager';
import { Action, HideAction, ShowAction } from './enum';
import TriggerChild from './TriggerChild';

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

function contains(root, n) {
  let node = n;
  if (root) {
    while (node) {
      if (node === root || (root.contains && root.contains(node))) {
        return true;
      }
      node = node.parentNode;
    }
  }
  return false;
}

export interface TriggerProps extends ElementProps {
  action?: Action[];
  showAction?: ShowAction[];
  hideAction?: HideAction[];
  popupContent?: ReactNode | ((props: any) => ReactNode);
  popupCls?: string;
  popupStyle?: CSSProperties;
  popupHidden?: boolean;
  popupPlacement?: string;
  popupAlign?: object;
  builtinPlacements?: any;
  onPopupAlign?: (source: Node, align: object, target: Node | Window) => void;
  onPopupAnimateAppear?: (key: Key | null) => void;
  onPopupAnimateEnter?: (key: Key | null) => void;
  onPopupAnimateLeave?: (key: Key | null) => void;
  onPopupAnimateEnd?: (key: Key | null, exists: boolean) => void;
  onPopupHiddenChange?: (hidden: boolean) => void;
  getRootDomNode?: () => Element | null | Text;
  getPopupStyleFromAlign?: (target: Node | Window, align: object) => object | undefined;
  getPopupClassNameFromAlign?: (align: object) => string | undefined;
  focusDelay?: number;
  blurDelay?: number;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  transitionName?: string;
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
    popupContent: PropTypes.node,
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
    focusDelay: PropTypes.number,
    blurDelay: PropTypes.number,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    transitionName: PropTypes.string,
  };

  static defaultProps = {
    focusDelay: 150,
    blurDelay: 0,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    transitionName: 'slide-up',
  };

  popup: Popup | null;

  popupTask: TaskRunner = new TaskRunner();

  documentEvent: EventManager = new EventManager(typeof window !== 'undefined' && document);

  focusTime: number = 0;

  preClickTime: number = 0;

  @observable popupHidden?: boolean;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      const { popupHidden = true } = this.props;
      this.popupHidden = popupHidden;
    });
  }

  saveRef = node => (this.popup = node);

  render() {
    const { children } = this.props;
    const popup = this.getPopup();
    const newChildren = Children.map(children, child => {
      if (isValidElement(child)) {
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
        return <TriggerChild {...newChildProps}>{child}</TriggerChild>;
      }
      return child;
    });
    return [newChildren, popup];
  }

  @mobxAction
  componentWillReceiveProps(nextProps) {
    const { popupHidden, onPopupHiddenChange = noop } = nextProps;
    if (popupHidden !== this.popupHidden && popupHidden !== undefined) {
      this.popupHidden = popupHidden;
      onPopupHiddenChange(popupHidden);
    }
  }

  componentDidUpdate() {
    const { popupHidden } = this.props;
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

  handleContextMenu(e) {
    e.preventDefault();
    this.setPopupHidden(false);
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
      this.forcePopupAlign();
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
      onPopupAnimateAppear,
      onPopupAnimateEnter,
      onPopupAnimateLeave,
      onPopupAnimateEnd,
      onPopupAlign,
      popupContent,
      getPopupStyleFromAlign,
      getRootDomNode = this.getRootDomNode,
      transitionName,
    } = this.props;
    const visible = !this.popupHidden && popupContent;
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
        className={classNames(`${prefixCls}-popup`, popupCls)}
        style={popupStyle}
        hidden={!visible}
        align={this.getPopupAlign()}
        onAlign={onPopupAlign}
        onMouseDown={this.handlePopupMouseDown}
        getRootDomNode={getRootDomNode}
        onAnimateAppear={onPopupAnimateAppear}
        onAnimateEnter={onPopupAnimateEnter}
        onAnimateLeave={onPopupAnimateLeave}
        onAnimateEnd={onPopupAnimateEnd}
        getStyleFromAlign={getPopupStyleFromAlign}
        getClassNameFromAlign={this.getPopupClassNameFromAlign}
        {...mouseProps}
      >
        {popupContent}
      </Popup>
    );
  }

  getPopupAlign() {
    const { popupPlacement, popupAlign, builtinPlacements } = this.props;
    if (popupPlacement && builtinPlacements) {
      return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
    }
    return popupAlign;
  }

  @autobind
  handlePopupMouseDown(e) {
    e.preventDefault();
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

  forcePopupAlign() {
    if (!this.popupHidden && this.popup) {
      this.popup.forceAlign();
    }
  }

  @mobxAction
  setPopupHidden(hidden) {
    this.popupTask.cancel();
    if (this.popupHidden !== hidden) {
      const { popupHidden, onPopupHiddenChange = noop } = this.props;
      if (popupHidden === undefined) {
        this.popupHidden = hidden;
      }
      onPopupHiddenChange(hidden);
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
