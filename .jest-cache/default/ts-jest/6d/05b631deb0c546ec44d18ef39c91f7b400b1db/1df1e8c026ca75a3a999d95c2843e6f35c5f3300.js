import { __decorate } from "tslib";
import React, { Children, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import raf from 'raf';
import { action as mobxAction, observable, runInAction } from 'mobx';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import noop from 'lodash/noop';
import Popup from './Popup';
import autobind from '../_util/autobind';
import TaskRunner from '../_util/TaskRunner';
import EventManager from '../_util/EventManager';
import TriggerChild from './TriggerChild';
function isPointsEq(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1];
}
function getPopupClassNameFromAlign(builtinPlacements, prefixCls, align) {
    const { points } = align;
    const found = Object.keys(builtinPlacements).find(placement => ({}.hasOwnProperty.call(builtinPlacements, placement) &&
        isPointsEq(builtinPlacements[placement].points, points)));
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
let Trigger = class Trigger extends Component {
    constructor(props, context) {
        super(props, context);
        // 兼容ie11
        // 在ie11上当pop的内容存在滚动条的时候 点击滚动条会导致当前组件失去焦点
        // 给组件设置的 preventDefault 不会起到作用
        // 根据 handlePopupMouseDown  handlePopupMouseUp 设置一个标识符来判断当前点击的是否是弹出框
        // 不应该使用 state 将isClickScrollbar放到state里面会导致渲染导致在chrome下无法点击滚动条进行拖动
        this.isClickScrollbar = {
            value: false,
        };
        this.popupTask = new TaskRunner();
        this.documentEvent = new EventManager(typeof window !== 'undefined' && document);
        this.focusTime = 0;
        this.preClickTime = 0;
        this.animateFrameId = 0;
        this.saveRef = node => (this.popup = node);
        runInAction(() => {
            this.popupHidden = 'popupHidden' in props ? props.popupHidden : props.defaultPopupHidden;
        });
    }
    render() {
        const { children } = this.props;
        const popup = this.getPopup();
        const newChildren = Children.map(children, child => {
            if (isValidElement(child)) {
                const newChildProps = {};
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
                newChildProps.isClickScrollbar = this.isClickScrollbar;
                newChildProps.popupHidden = this.popupHidden;
                return React.createElement(TriggerChild, Object.assign({}, newChildProps), child);
            }
            return child;
        });
        return [newChildren, popup];
    }
    componentWillReceiveProps(nextProps) {
        const { popupHidden } = nextProps;
        if (popupHidden !== this.popupHidden && popupHidden !== undefined) {
            this.popupHidden = popupHidden;
        }
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
    handleEvent(eventName, child, e) {
        const { [`on${eventName}`]: handle } = this.props;
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
    handleDocumentMouseDown(e) {
        if (this.popup) {
            const { target } = e;
            if (!contains(findDOMNode(this), target) && !contains(findDOMNode(this.popup), target)) {
                this.setPopupHidden(true);
            }
        }
    }
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
    handlePopupMouseEnter() {
        this.popupTask.cancel();
    }
    handlePopupMouseLeave() {
        const { mouseLeaveDelay } = this.props;
        this.delaySetPopupHidden(true, mouseLeaveDelay);
    }
    getPopup() {
        const { prefixCls, popupCls, popupStyle, popupClassName, onPopupAnimateAppear, onPopupAnimateEnter, onPopupAnimateLeave, onPopupAnimateEnd, onPopupAlign, popupContent, getPopupStyleFromAlign, getRootDomNode = this.getRootDomNode, transitionName, getPopupContainer, } = this.props;
        const visible = !this.popupHidden && popupContent;
        const mouseProps = {};
        if (this.isMouseEnterToShow()) {
            mouseProps.onMouseEnter = this.handlePopupMouseEnter;
        }
        if (this.isMouseLeaveToHide()) {
            mouseProps.onMouseLeave = this.handlePopupMouseLeave;
        }
        return (React.createElement(Popup, Object.assign({ key: "popup", ref: this.saveRef, transitionName: transitionName, className: classNames(`${prefixCls}-popup`, popupCls, popupClassName), style: popupStyle, hidden: !visible, align: this.getPopupAlign(), onAlign: onPopupAlign, onMouseDown: this.handlePopupMouseDown, onMouseUp: this.handlePopupMouseUp, getRootDomNode: getRootDomNode, onAnimateAppear: onPopupAnimateAppear, onAnimateEnter: onPopupAnimateEnter, onAnimateLeave: onPopupAnimateLeave, onAnimateEnd: onPopupAnimateEnd, getStyleFromAlign: getPopupStyleFromAlign, getClassNameFromAlign: this.getPopupClassNameFromAlign, getPopupContainer: getPopupContainer }, mouseProps), popupContent));
    }
    getPopupAlign() {
        const { popupPlacement, popupAlign, builtinPlacements } = this.props;
        if (popupPlacement && builtinPlacements) {
            return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
        }
        return popupAlign;
    }
    handlePopupMouseDown(e) {
        this.isClickScrollbar.value = true;
        e.preventDefault();
    }
    handlePopupMouseUp() {
        this.isClickScrollbar.value = false;
    }
    getRootDomNode() {
        return findDOMNode(this);
    }
    getPopupClassNameFromAlign(align) {
        const className = [];
        const { popupPlacement, builtinPlacements, prefixCls, getPopupClassNameFromAlign: getCls, } = this.props;
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
        }
        else {
            this.setPopupHidden(popupHidden);
        }
    }
    isClickToShow() {
        const { action = [], showAction = [] } = this.props;
        return action.indexOf("click" /* click */) !== -1 || showAction.indexOf("click" /* click */) !== -1;
    }
    isContextMenuToShow() {
        const { action = [], showAction = [] } = this.props;
        return (action.indexOf("contextMenu" /* contextMenu */) !== -1 || showAction.indexOf("contextMenu" /* contextMenu */) !== -1);
    }
    isClickToHide() {
        const { action = [], hideAction = [] } = this.props;
        return action.indexOf("click" /* click */) !== -1 || hideAction.indexOf("click" /* click */) !== -1;
    }
    isMouseEnterToShow() {
        const { action = [], showAction = [] } = this.props;
        return action.indexOf("hover" /* hover */) !== -1 || showAction.indexOf("mouseEnter" /* mouseEnter */) !== -1;
    }
    isMouseLeaveToHide() {
        const { action = [], hideAction = [] } = this.props;
        return action.indexOf("hover" /* hover */) !== -1 || hideAction.indexOf("mouseLeave" /* mouseLeave */) !== -1;
    }
    isFocusToShow() {
        const { action = [], showAction = [] } = this.props;
        return action.indexOf("focus" /* focus */) !== -1 || showAction.indexOf("focus" /* focus */) !== -1;
    }
    isBlurToHide() {
        const { action = [], hideAction = [] } = this.props;
        return action.indexOf("focus" /* focus */) !== -1 || hideAction.indexOf("blur" /* blur */) !== -1;
    }
};
Trigger.displayName = 'Trigger';
Trigger.propTypes = {
    action: MobxPropTypes.arrayOrObservableArrayOf(PropTypes.oneOf(["hover" /* hover */, "contextMenu" /* contextMenu */, "focus" /* focus */, "click" /* click */])),
    showAction: MobxPropTypes.arrayOrObservableArrayOf(PropTypes.oneOf([
        "mouseEnter" /* mouseEnter */,
        "contextMenu" /* contextMenu */,
        "focus" /* focus */,
        "click" /* click */,
    ])),
    hideAction: MobxPropTypes.arrayOrObservableArrayOf(PropTypes.oneOf(["blur" /* blur */, "mouseLeave" /* mouseLeave */, "click" /* click */])),
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
    getPopupContainer: PropTypes.func,
    focusDelay: PropTypes.number,
    blurDelay: PropTypes.number,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    transitionName: PropTypes.string,
    defaultPopupHidden: PropTypes.bool,
    popupClassName: PropTypes.string,
};
Trigger.defaultProps = {
    focusDelay: 150,
    blurDelay: 0,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    transitionName: 'slide-up',
    defaultPopupHidden: true,
};
__decorate([
    observable
], Trigger.prototype, "popupHidden", void 0);
__decorate([
    mobxAction
], Trigger.prototype, "componentWillReceiveProps", null);
__decorate([
    autobind
], Trigger.prototype, "handleEvent", null);
__decorate([
    autobind
], Trigger.prototype, "handleDocumentMouseDown", null);
__decorate([
    autobind
], Trigger.prototype, "handleDocumentScroll", null);
__decorate([
    autobind
], Trigger.prototype, "handlePopupMouseEnter", null);
__decorate([
    autobind
], Trigger.prototype, "handlePopupMouseLeave", null);
__decorate([
    autobind
], Trigger.prototype, "handlePopupMouseDown", null);
__decorate([
    autobind
], Trigger.prototype, "handlePopupMouseUp", null);
__decorate([
    autobind
], Trigger.prototype, "getRootDomNode", null);
__decorate([
    autobind
], Trigger.prototype, "getPopupClassNameFromAlign", null);
__decorate([
    autobind
], Trigger.prototype, "forcePopupAlign", null);
__decorate([
    mobxAction
], Trigger.prototype, "setPopupHidden", null);
Trigger = __decorate([
    observer
], Trigger);
export default Trigger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RyaWdnZXIvVHJpZ2dlci50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBaUIsY0FBYyxFQUFrQixNQUFNLE9BQU8sQ0FBQztBQUNsRyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDckUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLElBQUksYUFBYSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xFLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLEtBQUssTUFBTSxTQUFTLENBQUM7QUFDNUIsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFFN0MsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFFakQsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFFMUMsU0FBUyxVQUFVLENBQUMsRUFBWSxFQUFFLEVBQVk7SUFDNUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELFNBQVMsMEJBQTBCLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLEtBQUs7SUFDckUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQztJQUN6QixNQUFNLEtBQUssR0FB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LEVBQUUsU0FBUyxDQUFDLE1BQU07Q0FDakMsQ0FBQztBQUVLLG9CQUFZLEdBQUc7SUFDcEIsVUFBVSxFQUFFLEdBQUc7SUFDZixTQUFTLEVBQUUsQ0FBQztJQUNaLGVBQWUsRUFBRSxHQUFHO0lBQ3BCLGVBQWUsRUFBRSxHQUFHO0lBQ3BCLGNBQWMsRUFBRSxVQUFVO0lBQzFCLGtCQUFrQixFQUFFLElBQUk7Q0FDekIsQ0FBQztBQXlCVTtJQUFYLFVBQVU7NENBQXVCO0FBNENsQztJQURDLFVBQVU7d0RBTVY7QUFtQkQ7SUFEQyxRQUFROzBDQWVSO0FBdUJEO0lBREMsUUFBUTtzREFRUjtBQUdEO0lBREMsUUFBUTttREFRUjtBQWdDRDtJQURDLFFBQVE7b0RBR1I7QUFHRDtJQURDLFFBQVE7b0RBSVI7QUErREQ7SUFEQyxRQUFRO21EQUlSO0FBR0Q7SUFEQyxRQUFRO2lEQUdSO0FBR0Q7SUFEQyxRQUFROzZDQUdSO0FBR0Q7SUFEQyxRQUFRO3lEQW1CUjtBQUdEO0lBREMsUUFBUTs4Q0FLUjtBQUdEO0lBREMsVUFBVTs2Q0FVVjtBQWhXa0IsT0FBTztJQUQzQixRQUFRO0dBQ1ksT0FBTyxDQWlaM0I7ZUFqWm9CLE9BQU8iLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RyaWdnZXIvVHJpZ2dlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENoaWxkcmVuLCBDb21wb25lbnQsIENTU1Byb3BlcnRpZXMsIGlzVmFsaWRFbGVtZW50LCBLZXksIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBmaW5kRE9NTm9kZSB9IGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCByYWYgZnJvbSAncmFmJztcbmltcG9ydCB7IGFjdGlvbiBhcyBtb2J4QWN0aW9uLCBvYnNlcnZhYmxlLCBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIsIFByb3BUeXBlcyBhcyBNb2J4UHJvcFR5cGVzIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgbm9vcCBmcm9tICdsb2Rhc2gvbm9vcCc7XG5pbXBvcnQgUG9wdXAgZnJvbSAnLi9Qb3B1cCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IFRhc2tSdW5uZXIgZnJvbSAnLi4vX3V0aWwvVGFza1J1bm5lcic7XG5pbXBvcnQgeyBFbGVtZW50UHJvcHMgfSBmcm9tICcuLi9jb3JlL1ZpZXdDb21wb25lbnQnO1xuaW1wb3J0IEV2ZW50TWFuYWdlciBmcm9tICcuLi9fdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHsgQWN0aW9uLCBIaWRlQWN0aW9uLCBTaG93QWN0aW9uIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCBUcmlnZ2VyQ2hpbGQgZnJvbSAnLi9UcmlnZ2VyQ2hpbGQnO1xuXG5mdW5jdGlvbiBpc1BvaW50c0VxKGExOiBzdHJpbmdbXSwgYTI6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gIHJldHVybiBhMVswXSA9PT0gYTJbMF0gJiYgYTFbMV0gPT09IGEyWzFdO1xufVxuXG5mdW5jdGlvbiBnZXRQb3B1cENsYXNzTmFtZUZyb21BbGlnbihidWlsdGluUGxhY2VtZW50cywgcHJlZml4Q2xzLCBhbGlnbik6IHN0cmluZyB7XG4gIGNvbnN0IHsgcG9pbnRzIH0gPSBhbGlnbjtcbiAgY29uc3QgZm91bmQgPSBPYmplY3Qua2V5cyhidWlsdGluUGxhY2VtZW50cykuZmluZChcbiAgICBwbGFjZW1lbnQgPT5cbiAgICAgICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGJ1aWx0aW5QbGFjZW1lbnRzLCBwbGFjZW1lbnQpICYmXG4gICAgICAgIGlzUG9pbnRzRXEoYnVpbHRpblBsYWNlbWVudHNbcGxhY2VtZW50XS5wb2ludHMsIHBvaW50cykpLFxuICApO1xuICByZXR1cm4gZm91bmQgPyBgJHtwcmVmaXhDbHN9LXBvcHVwLXBsYWNlbWVudC0ke2ZvdW5kfWAgOiAnJztcbn1cblxuZnVuY3Rpb24gZ2V0QWxpZ25Gcm9tUGxhY2VtZW50KGJ1aWx0aW5QbGFjZW1lbnRzLCBwbGFjZW1lbnRTdHIsIGFsaWduKSB7XG4gIGNvbnN0IGJhc2VBbGlnbiA9IGJ1aWx0aW5QbGFjZW1lbnRzW3BsYWNlbWVudFN0cl0gfHwge307XG4gIHJldHVybiB7XG4gICAgLi4uYmFzZUFsaWduLFxuICAgIC4uLmFsaWduLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjb250YWlucyhyb290LCBuKSB7XG4gIGxldCBub2RlID0gbjtcbiAgaWYgKHJvb3QpIHtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgaWYgKG5vZGUgPT09IHJvb3QgfHwgKHJvb3QuY29udGFpbnMgJiYgcm9vdC5jb250YWlucyhub2RlKSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJpZ2dlclByb3BzIGV4dGVuZHMgRWxlbWVudFByb3BzIHtcbiAgYWN0aW9uPzogQWN0aW9uW107XG4gIHNob3dBY3Rpb24/OiBTaG93QWN0aW9uW107XG4gIGhpZGVBY3Rpb24/OiBIaWRlQWN0aW9uW107XG4gIHBvcHVwQ29udGVudD86IFJlYWN0Tm9kZSB8ICgocHJvcHM6IGFueSkgPT4gUmVhY3ROb2RlKTtcbiAgcG9wdXBDbHM/OiBzdHJpbmc7XG4gIHBvcHVwU3R5bGU/OiBDU1NQcm9wZXJ0aWVzO1xuICBwb3B1cEhpZGRlbj86IGJvb2xlYW47XG4gIHBvcHVwUGxhY2VtZW50Pzogc3RyaW5nO1xuICBwb3B1cEFsaWduPzogb2JqZWN0O1xuICBidWlsdGluUGxhY2VtZW50cz86IGFueTtcbiAgb25Qb3B1cEFsaWduPzogKHNvdXJjZTogTm9kZSwgYWxpZ246IG9iamVjdCwgdGFyZ2V0OiBOb2RlIHwgV2luZG93KSA9PiB2b2lkO1xuICBvblBvcHVwQW5pbWF0ZUFwcGVhcj86IChrZXk6IEtleSB8IG51bGwpID0+IHZvaWQ7XG4gIG9uUG9wdXBBbmltYXRlRW50ZXI/OiAoa2V5OiBLZXkgfCBudWxsKSA9PiB2b2lkO1xuICBvblBvcHVwQW5pbWF0ZUxlYXZlPzogKGtleTogS2V5IHwgbnVsbCkgPT4gdm9pZDtcbiAgb25Qb3B1cEFuaW1hdGVFbmQ/OiAoa2V5OiBLZXkgfCBudWxsLCBleGlzdHM6IGJvb2xlYW4pID0+IHZvaWQ7XG4gIG9uUG9wdXBIaWRkZW5DaGFuZ2U/OiAoaGlkZGVuOiBib29sZWFuKSA9PiB2b2lkO1xuICBnZXRSb290RG9tTm9kZT86ICgpID0+IEVsZW1lbnQgfCBudWxsIHwgVGV4dDtcbiAgZ2V0UG9wdXBTdHlsZUZyb21BbGlnbj86ICh0YXJnZXQ6IE5vZGUgfCBXaW5kb3csIGFsaWduOiBvYmplY3QpID0+IG9iamVjdCB8IHVuZGVmaW5lZDtcbiAgZ2V0UG9wdXBDbGFzc05hbWVGcm9tQWxpZ24/OiAoYWxpZ246IG9iamVjdCkgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBnZXRQb3B1cENvbnRhaW5lcj86ICh0cmlnZ2VyTm9kZTogSFRNTEVsZW1lbnQpID0+IEhUTUxFbGVtZW50O1xuICBmb2N1c0RlbGF5PzogbnVtYmVyO1xuICBibHVyRGVsYXk/OiBudW1iZXI7XG4gIG1vdXNlRW50ZXJEZWxheT86IG51bWJlcjtcbiAgbW91c2VMZWF2ZURlbGF5PzogbnVtYmVyO1xuICB0cmFuc2l0aW9uTmFtZT86IHN0cmluZztcbiAgZGVmYXVsdFBvcHVwSGlkZGVuPzogYm9vbGVhbjtcbiAgcG9wdXBDbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJpZ2dlciBleHRlbmRzIENvbXBvbmVudDxUcmlnZ2VyUHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ1RyaWdnZXInO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgYWN0aW9uOiBNb2J4UHJvcFR5cGVzLmFycmF5T3JPYnNlcnZhYmxlQXJyYXlPZihcbiAgICAgIFByb3BUeXBlcy5vbmVPZihbQWN0aW9uLmhvdmVyLCBBY3Rpb24uY29udGV4dE1lbnUsIEFjdGlvbi5mb2N1cywgQWN0aW9uLmNsaWNrXSksXG4gICAgKSxcbiAgICBzaG93QWN0aW9uOiBNb2J4UHJvcFR5cGVzLmFycmF5T3JPYnNlcnZhYmxlQXJyYXlPZihcbiAgICAgIFByb3BUeXBlcy5vbmVPZihbXG4gICAgICAgIFNob3dBY3Rpb24ubW91c2VFbnRlcixcbiAgICAgICAgU2hvd0FjdGlvbi5jb250ZXh0TWVudSxcbiAgICAgICAgU2hvd0FjdGlvbi5mb2N1cyxcbiAgICAgICAgU2hvd0FjdGlvbi5jbGljayxcbiAgICAgIF0pLFxuICAgICksXG4gICAgaGlkZUFjdGlvbjogTW9ieFByb3BUeXBlcy5hcnJheU9yT2JzZXJ2YWJsZUFycmF5T2YoXG4gICAgICBQcm9wVHlwZXMub25lT2YoW0hpZGVBY3Rpb24uYmx1ciwgSGlkZUFjdGlvbi5tb3VzZUxlYXZlLCBIaWRlQWN0aW9uLmNsaWNrXSksXG4gICAgKSxcbiAgICBwb3B1cENvbnRlbnQ6IFByb3BUeXBlcy5ub2RlLFxuICAgIHBvcHVwQ2xzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBvcHVwU3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgcG9wdXBIaWRkZW46IFByb3BUeXBlcy5ib29sLFxuICAgIHBvcHVwUGxhY2VtZW50OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBvcHVwQWxpZ246IFByb3BUeXBlcy5vYmplY3QsXG4gICAgYnVpbHRpblBsYWNlbWVudHM6IFByb3BUeXBlcy5hbnksXG4gICAgb25Qb3B1cEFuaW1hdGVBcHBlYXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUG9wdXBBbmltYXRlRW50ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUG9wdXBBbmltYXRlTGVhdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUG9wdXBBbmltYXRlRW5kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblBvcHVwQWxpZ246IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUG9wdXBIaWRkZW5DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIGdldFBvcHVwU3R5bGVGcm9tQWxpZ246IFByb3BUeXBlcy5mdW5jLFxuICAgIGdldFBvcHVwQ29udGFpbmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmb2N1c0RlbGF5OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGJsdXJEZWxheTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtb3VzZUVudGVyRGVsYXk6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbW91c2VMZWF2ZURlbGF5OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHRyYW5zaXRpb25OYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRlZmF1bHRQb3B1cEhpZGRlbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgcG9wdXBDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBmb2N1c0RlbGF5OiAxNTAsXG4gICAgYmx1ckRlbGF5OiAwLFxuICAgIG1vdXNlRW50ZXJEZWxheTogMTAwLFxuICAgIG1vdXNlTGVhdmVEZWxheTogMTAwLFxuICAgIHRyYW5zaXRpb25OYW1lOiAnc2xpZGUtdXAnLFxuICAgIGRlZmF1bHRQb3B1cEhpZGRlbjogdHJ1ZSxcbiAgfTtcblxuICAvLyDlhbzlrrlpZTExXG4gIC8vIOWcqGllMTHkuIrlvZNwb3DnmoTlhoXlrrnlrZjlnKjmu5rliqjmnaHnmoTml7blgJkg54K55Ye75rua5Yqo5p2h5Lya5a+86Ie05b2T5YmN57uE5Lu25aSx5Y6754Sm54K5XG4gIC8vIOe7mee7hOS7tuiuvue9rueahCBwcmV2ZW50RGVmYXVsdCDkuI3kvJrotbfliLDkvZznlKhcbiAgLy8g5qC55o2uIGhhbmRsZVBvcHVwTW91c2VEb3duICBoYW5kbGVQb3B1cE1vdXNlVXAg6K6+572u5LiA5Liq5qCH6K+G56ym5p2l5Yik5pat5b2T5YmN54K55Ye755qE5piv5ZCm5piv5by55Ye65qGGXG4gIC8vIOS4jeW6lOivpeS9v+eUqCBzdGF0ZSDlsIZpc0NsaWNrU2Nyb2xsYmFy5pS+5Yiwc3RhdGXph4zpnaLkvJrlr7zoh7TmuLLmn5Plr7zoh7TlnKhjaHJvbWXkuIvml6Dms5Xngrnlh7vmu5rliqjmnaHov5vooYzmi5bliqhcbiAgaXNDbGlja1Njcm9sbGJhcjoge1xuICAgIHZhbHVlOiBib29sZWFuXG4gIH0gPSB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgfTtcblxuICBwb3B1cDogUG9wdXAgfCBudWxsO1xuXG4gIHBvcHVwVGFzazogVGFza1J1bm5lciA9IG5ldyBUYXNrUnVubmVyKCk7XG5cbiAgZG9jdW1lbnRFdmVudDogRXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudCk7XG5cbiAgZm9jdXNUaW1lOiBudW1iZXIgPSAwO1xuXG4gIHByZUNsaWNrVGltZTogbnVtYmVyID0gMDtcblxuICBhbmltYXRlRnJhbWVJZDogbnVtYmVyID0gMDtcblxuICBAb2JzZXJ2YWJsZSBwb3B1cEhpZGRlbj86IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5wb3B1cEhpZGRlbiA9ICdwb3B1cEhpZGRlbicgaW4gcHJvcHMgPyBwcm9wcy5wb3B1cEhpZGRlbiA6IHByb3BzLmRlZmF1bHRQb3B1cEhpZGRlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHNhdmVSZWYgPSBub2RlID0+ICh0aGlzLnBvcHVwID0gbm9kZSk7XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcG9wdXAgPSB0aGlzLmdldFBvcHVwKCk7XG4gICAgY29uc3QgbmV3Q2hpbGRyZW4gPSBDaGlsZHJlbi5tYXAoY2hpbGRyZW4sIGNoaWxkID0+IHtcbiAgICAgIGlmIChpc1ZhbGlkRWxlbWVudChjaGlsZCkpIHtcbiAgICAgICAgY29uc3QgbmV3Q2hpbGRQcm9wczogYW55ID0ge307XG4gICAgICAgIGlmICh0aGlzLmlzQ29udGV4dE1lbnVUb1Nob3coKSkge1xuICAgICAgICAgIG5ld0NoaWxkUHJvcHMub25Db250ZXh0TWVudSA9IHRoaXMuaGFuZGxlRXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNDbGlja1RvSGlkZSgpIHx8IHRoaXMuaXNDbGlja1RvU2hvdygpKSB7XG4gICAgICAgICAgbmV3Q2hpbGRQcm9wcy5vbkNsaWNrID0gdGhpcy5oYW5kbGVFdmVudDtcbiAgICAgICAgICBuZXdDaGlsZFByb3BzLm9uTW91c2VEb3duID0gdGhpcy5oYW5kbGVFdmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc01vdXNlRW50ZXJUb1Nob3coKSkge1xuICAgICAgICAgIG5ld0NoaWxkUHJvcHMub25Nb3VzZUVudGVyID0gdGhpcy5oYW5kbGVFdmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc01vdXNlTGVhdmVUb0hpZGUoKSkge1xuICAgICAgICAgIG5ld0NoaWxkUHJvcHMub25Nb3VzZUxlYXZlID0gdGhpcy5oYW5kbGVFdmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0ZvY3VzVG9TaG93KCkgfHwgdGhpcy5pc0JsdXJUb0hpZGUoKSkge1xuICAgICAgICAgIG5ld0NoaWxkUHJvcHMub25Gb2N1cyA9IHRoaXMuaGFuZGxlRXZlbnQ7XG4gICAgICAgICAgbmV3Q2hpbGRQcm9wcy5vbkJsdXIgPSB0aGlzLmhhbmRsZUV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIG5ld0NoaWxkUHJvcHMuaXNDbGlja1Njcm9sbGJhciA9IHRoaXMuaXNDbGlja1Njcm9sbGJhcjtcbiAgICAgICAgbmV3Q2hpbGRQcm9wcy5wb3B1cEhpZGRlbiA9IHRoaXMucG9wdXBIaWRkZW47XG4gICAgICAgIHJldHVybiA8VHJpZ2dlckNoaWxkIHsuLi5uZXdDaGlsZFByb3BzfT57Y2hpbGR9PC9UcmlnZ2VyQ2hpbGQ+O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH0pO1xuICAgIHJldHVybiBbbmV3Q2hpbGRyZW4sIHBvcHVwXTtcbiAgfVxuXG4gIEBtb2J4QWN0aW9uXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgY29uc3QgeyBwb3B1cEhpZGRlbiB9ID0gbmV4dFByb3BzO1xuICAgIGlmIChwb3B1cEhpZGRlbiAhPT0gdGhpcy5wb3B1cEhpZGRlbiAmJiBwb3B1cEhpZGRlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnBvcHVwSGlkZGVuID0gcG9wdXBIaWRkZW47XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGNvbnN0IHsgcG9wdXBIaWRkZW4gfSA9IHRoaXM7XG4gICAgdGhpcy5kb2N1bWVudEV2ZW50LmNsZWFyKCk7XG4gICAgaWYgKCFwb3B1cEhpZGRlbikge1xuICAgICAgdGhpcy5kb2N1bWVudEV2ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuaGFuZGxlRG9jdW1lbnRTY3JvbGwsIHRydWUpO1xuICAgICAgaWYgKCh0aGlzLmlzQ2xpY2tUb0hpZGUoKSB8fCB0aGlzLmlzQ29udGV4dE1lbnVUb1Nob3coKSkgJiYgIXRoaXMuaXNCbHVyVG9IaWRlKCkpIHtcbiAgICAgICAgdGhpcy5kb2N1bWVudEV2ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlRG9jdW1lbnRNb3VzZURvd24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucG9wdXBUYXNrLmNhbmNlbCgpO1xuICAgIHRoaXMuZG9jdW1lbnRFdmVudC5jbGVhcigpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUV2ZW50KGV2ZW50TmFtZSwgY2hpbGQsIGUpIHtcbiAgICBjb25zdCB7IFtgb24ke2V2ZW50TmFtZX1gXTogaGFuZGxlIH0gPSB0aGlzLnByb3BzIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH07XG4gICAgY29uc3QgeyBbYG9uJHtldmVudE5hbWV9YF06IGNoaWxkSGFuZGxlIH0gPSBjaGlsZC5wcm9wcztcbiAgICBpZiAoY2hpbGRIYW5kbGUpIHtcbiAgICAgIGNoaWxkSGFuZGxlKGUpO1xuICAgIH1cbiAgICBpZiAoIWUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgIGlmIChoYW5kbGUpIHtcbiAgICAgICAgaGFuZGxlKGUpO1xuICAgICAgfVxuICAgICAgaWYgKCFlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIHRoaXNbYGhhbmRsZSR7ZXZlbnROYW1lfWBdLmNhbGwodGhpcywgZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQ29udGV4dE1lbnUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnNldFBvcHVwSGlkZGVuKGZhbHNlKTtcbiAgfVxuXG4gIGhhbmRsZUZvY3VzKCkge1xuICAgIGlmICh0aGlzLmlzRm9jdXNUb1Nob3coKSkge1xuICAgICAgY29uc3QgeyBmb2N1c0RlbGF5IH0gPSB0aGlzLnByb3BzO1xuICAgICAgdGhpcy5mb2N1c1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5kZWxheVNldFBvcHVwSGlkZGVuKGZhbHNlLCBmb2N1c0RlbGF5KTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVCbHVyKCkge1xuICAgIGlmICh0aGlzLmlzQmx1clRvSGlkZSgpKSB7XG4gICAgICBjb25zdCB7IGJsdXJEZWxheSB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHRoaXMuZGVsYXlTZXRQb3B1cEhpZGRlbih0cnVlLCBibHVyRGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVEb2N1bWVudE1vdXNlRG93bihlKSB7XG4gICAgaWYgKHRoaXMucG9wdXApIHtcbiAgICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBlO1xuICAgICAgaWYgKCFjb250YWlucyhmaW5kRE9NTm9kZSh0aGlzKSwgdGFyZ2V0KSAmJiAhY29udGFpbnMoZmluZERPTU5vZGUodGhpcy5wb3B1cCksIHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5zZXRQb3B1cEhpZGRlbih0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRG9jdW1lbnRTY3JvbGwoeyB0YXJnZXQgfSkge1xuICAgIGlmICh0aGlzLnBvcHVwICYmIHRhcmdldCAhPT0gZG9jdW1lbnQgJiYgIWNvbnRhaW5zKGZpbmRET01Ob2RlKHRoaXMucG9wdXApLCB0YXJnZXQpKSB7XG4gICAgICBpZiAodGhpcy5hbmltYXRlRnJhbWVJZCkge1xuICAgICAgICByYWYuY2FuY2VsKHRoaXMuYW5pbWF0ZUZyYW1lSWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5hbmltYXRlRnJhbWVJZCA9IHJhZih0aGlzLmZvcmNlUG9wdXBBbGlnbik7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTW91c2VEb3duKCkge1xuICAgIHRoaXMucHJlQ2xpY2tUaW1lID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGhhbmRsZUNsaWNrKGUpIHtcbiAgICBjb25zdCB7IHBvcHVwSGlkZGVuIH0gPSB0aGlzO1xuICAgIGlmICh0aGlzLmZvY3VzVGltZSkge1xuICAgICAgaWYgKE1hdGguYWJzKHRoaXMucHJlQ2xpY2tUaW1lIC0gdGhpcy5mb2N1c1RpbWUpIDwgMjApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5mb2N1c1RpbWUgPSAwO1xuICAgIH1cbiAgICB0aGlzLnByZUNsaWNrVGltZSA9IDA7XG4gICAgaWYgKCh0aGlzLmlzQ2xpY2tUb0hpZGUoKSAmJiAhcG9wdXBIaWRkZW4pIHx8IChwb3B1cEhpZGRlbiAmJiB0aGlzLmlzQ2xpY2tUb1Nob3coKSkpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuc2V0UG9wdXBIaWRkZW4oIXBvcHVwSGlkZGVuKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVNb3VzZUVudGVyKCkge1xuICAgIGNvbnN0IHsgbW91c2VFbnRlckRlbGF5IH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuZGVsYXlTZXRQb3B1cEhpZGRlbihmYWxzZSwgbW91c2VFbnRlckRlbGF5KTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlTGVhdmUoKSB7XG4gICAgY29uc3QgeyBtb3VzZUxlYXZlRGVsYXkgfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5kZWxheVNldFBvcHVwSGlkZGVuKHRydWUsIG1vdXNlTGVhdmVEZWxheSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUG9wdXBNb3VzZUVudGVyKCkge1xuICAgIHRoaXMucG9wdXBUYXNrLmNhbmNlbCgpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVBvcHVwTW91c2VMZWF2ZSgpIHtcbiAgICBjb25zdCB7IG1vdXNlTGVhdmVEZWxheSB9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLmRlbGF5U2V0UG9wdXBIaWRkZW4odHJ1ZSwgbW91c2VMZWF2ZURlbGF5KTtcbiAgfVxuXG4gIGdldFBvcHVwKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcG9wdXBDbHMsXG4gICAgICBwb3B1cFN0eWxlLFxuICAgICAgcG9wdXBDbGFzc05hbWUsXG4gICAgICBvblBvcHVwQW5pbWF0ZUFwcGVhcixcbiAgICAgIG9uUG9wdXBBbmltYXRlRW50ZXIsXG4gICAgICBvblBvcHVwQW5pbWF0ZUxlYXZlLFxuICAgICAgb25Qb3B1cEFuaW1hdGVFbmQsXG4gICAgICBvblBvcHVwQWxpZ24sXG4gICAgICBwb3B1cENvbnRlbnQsXG4gICAgICBnZXRQb3B1cFN0eWxlRnJvbUFsaWduLFxuICAgICAgZ2V0Um9vdERvbU5vZGUgPSB0aGlzLmdldFJvb3REb21Ob2RlLFxuICAgICAgdHJhbnNpdGlvbk5hbWUsXG4gICAgICBnZXRQb3B1cENvbnRhaW5lcixcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB2aXNpYmxlID0gIXRoaXMucG9wdXBIaWRkZW4gJiYgcG9wdXBDb250ZW50O1xuICAgIGNvbnN0IG1vdXNlUHJvcHM6IGFueSA9IHt9O1xuICAgIGlmICh0aGlzLmlzTW91c2VFbnRlclRvU2hvdygpKSB7XG4gICAgICBtb3VzZVByb3BzLm9uTW91c2VFbnRlciA9IHRoaXMuaGFuZGxlUG9wdXBNb3VzZUVudGVyO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc01vdXNlTGVhdmVUb0hpZGUoKSkge1xuICAgICAgbW91c2VQcm9wcy5vbk1vdXNlTGVhdmUgPSB0aGlzLmhhbmRsZVBvcHVwTW91c2VMZWF2ZTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxQb3B1cFxuICAgICAgICBrZXk9XCJwb3B1cFwiXG4gICAgICAgIHJlZj17dGhpcy5zYXZlUmVmfVxuICAgICAgICB0cmFuc2l0aW9uTmFtZT17dHJhbnNpdGlvbk5hbWV9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LXBvcHVwYCwgcG9wdXBDbHMsIHBvcHVwQ2xhc3NOYW1lKX1cbiAgICAgICAgc3R5bGU9e3BvcHVwU3R5bGV9XG4gICAgICAgIGhpZGRlbj17IXZpc2libGV9XG4gICAgICAgIGFsaWduPXt0aGlzLmdldFBvcHVwQWxpZ24oKX1cbiAgICAgICAgb25BbGlnbj17b25Qb3B1cEFsaWdufVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVQb3B1cE1vdXNlRG93bn1cbiAgICAgICAgb25Nb3VzZVVwPXt0aGlzLmhhbmRsZVBvcHVwTW91c2VVcH1cbiAgICAgICAgZ2V0Um9vdERvbU5vZGU9e2dldFJvb3REb21Ob2RlfVxuICAgICAgICBvbkFuaW1hdGVBcHBlYXI9e29uUG9wdXBBbmltYXRlQXBwZWFyfVxuICAgICAgICBvbkFuaW1hdGVFbnRlcj17b25Qb3B1cEFuaW1hdGVFbnRlcn1cbiAgICAgICAgb25BbmltYXRlTGVhdmU9e29uUG9wdXBBbmltYXRlTGVhdmV9XG4gICAgICAgIG9uQW5pbWF0ZUVuZD17b25Qb3B1cEFuaW1hdGVFbmR9XG4gICAgICAgIGdldFN0eWxlRnJvbUFsaWduPXtnZXRQb3B1cFN0eWxlRnJvbUFsaWdufVxuICAgICAgICBnZXRDbGFzc05hbWVGcm9tQWxpZ249e3RoaXMuZ2V0UG9wdXBDbGFzc05hbWVGcm9tQWxpZ259XG4gICAgICAgIGdldFBvcHVwQ29udGFpbmVyPXtnZXRQb3B1cENvbnRhaW5lcn1cbiAgICAgICAgey4uLm1vdXNlUHJvcHN9XG4gICAgICA+XG4gICAgICAgIHtwb3B1cENvbnRlbnR9XG4gICAgICA8L1BvcHVwPlxuICAgICk7XG4gIH1cblxuICBnZXRQb3B1cEFsaWduKCkge1xuICAgIGNvbnN0IHsgcG9wdXBQbGFjZW1lbnQsIHBvcHVwQWxpZ24sIGJ1aWx0aW5QbGFjZW1lbnRzIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChwb3B1cFBsYWNlbWVudCAmJiBidWlsdGluUGxhY2VtZW50cykge1xuICAgICAgcmV0dXJuIGdldEFsaWduRnJvbVBsYWNlbWVudChidWlsdGluUGxhY2VtZW50cywgcG9wdXBQbGFjZW1lbnQsIHBvcHVwQWxpZ24pO1xuICAgIH1cbiAgICByZXR1cm4gcG9wdXBBbGlnbjtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVQb3B1cE1vdXNlRG93bihlKSB7XG4gICAgdGhpcy5pc0NsaWNrU2Nyb2xsYmFyLnZhbHVlID0gdHJ1ZVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVQb3B1cE1vdXNlVXAoKSB7XG4gICAgdGhpcy5pc0NsaWNrU2Nyb2xsYmFyLnZhbHVlID0gZmFsc2VcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBnZXRSb290RG9tTm9kZSgpIHtcbiAgICByZXR1cm4gZmluZERPTU5vZGUodGhpcyk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgZ2V0UG9wdXBDbGFzc05hbWVGcm9tQWxpZ24oYWxpZ24pOiBzdHJpbmcge1xuICAgIGNvbnN0IGNsYXNzTmFtZTogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCB7XG4gICAgICBwb3B1cFBsYWNlbWVudCxcbiAgICAgIGJ1aWx0aW5QbGFjZW1lbnRzLFxuICAgICAgcHJlZml4Q2xzLFxuICAgICAgZ2V0UG9wdXBDbGFzc05hbWVGcm9tQWxpZ246IGdldENscyxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAocG9wdXBQbGFjZW1lbnQgJiYgYnVpbHRpblBsYWNlbWVudHMpIHtcbiAgICAgIGNsYXNzTmFtZS5wdXNoKGdldFBvcHVwQ2xhc3NOYW1lRnJvbUFsaWduKGJ1aWx0aW5QbGFjZW1lbnRzLCBwcmVmaXhDbHMsIGFsaWduKSk7XG4gICAgfVxuICAgIGlmIChnZXRDbHMpIHtcbiAgICAgIGNvbnN0IGNscyA9IGdldENscyhhbGlnbik7XG4gICAgICBpZiAoY2xzKSB7XG4gICAgICAgIGNsYXNzTmFtZS5wdXNoKGNscyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbGFzc05hbWUuam9pbignICcpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGZvcmNlUG9wdXBBbGlnbigpIHtcbiAgICBpZiAoIXRoaXMucG9wdXBIaWRkZW4gJiYgdGhpcy5wb3B1cCkge1xuICAgICAgdGhpcy5wb3B1cC5mb3JjZUFsaWduKCk7XG4gICAgfVxuICB9XG5cbiAgQG1vYnhBY3Rpb25cbiAgc2V0UG9wdXBIaWRkZW4oaGlkZGVuKSB7XG4gICAgdGhpcy5wb3B1cFRhc2suY2FuY2VsKCk7XG4gICAgaWYgKHRoaXMucG9wdXBIaWRkZW4gIT09IGhpZGRlbikge1xuICAgICAgY29uc3QgeyBwb3B1cEhpZGRlbiwgb25Qb3B1cEhpZGRlbkNoYW5nZSA9IG5vb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAocG9wdXBIaWRkZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnBvcHVwSGlkZGVuID0gaGlkZGVuO1xuICAgICAgfVxuICAgICAgb25Qb3B1cEhpZGRlbkNoYW5nZShoaWRkZW4pO1xuICAgIH1cbiAgfVxuXG4gIGRlbGF5U2V0UG9wdXBIaWRkZW4ocG9wdXBIaWRkZW4sIGRlbGF5KSB7XG4gICAgdGhpcy5wb3B1cFRhc2suY2FuY2VsKCk7XG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICB0aGlzLnBvcHVwVGFzay5kZWxheShkZWxheSwgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFBvcHVwSGlkZGVuKHBvcHVwSGlkZGVuKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFBvcHVwSGlkZGVuKHBvcHVwSGlkZGVuKTtcbiAgICB9XG4gIH1cblxuICBpc0NsaWNrVG9TaG93KCkge1xuICAgIGNvbnN0IHsgYWN0aW9uID0gW10sIHNob3dBY3Rpb24gPSBbXSB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gYWN0aW9uLmluZGV4T2YoQWN0aW9uLmNsaWNrKSAhPT0gLTEgfHwgc2hvd0FjdGlvbi5pbmRleE9mKFNob3dBY3Rpb24uY2xpY2spICE9PSAtMTtcbiAgfVxuXG4gIGlzQ29udGV4dE1lbnVUb1Nob3coKSB7XG4gICAgY29uc3QgeyBhY3Rpb24gPSBbXSwgc2hvd0FjdGlvbiA9IFtdIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICBhY3Rpb24uaW5kZXhPZihBY3Rpb24uY29udGV4dE1lbnUpICE9PSAtMSB8fCBzaG93QWN0aW9uLmluZGV4T2YoU2hvd0FjdGlvbi5jb250ZXh0TWVudSkgIT09IC0xXG4gICAgKTtcbiAgfVxuXG4gIGlzQ2xpY2tUb0hpZGUoKSB7XG4gICAgY29uc3QgeyBhY3Rpb24gPSBbXSwgaGlkZUFjdGlvbiA9IFtdIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBhY3Rpb24uaW5kZXhPZihBY3Rpb24uY2xpY2spICE9PSAtMSB8fCBoaWRlQWN0aW9uLmluZGV4T2YoSGlkZUFjdGlvbi5jbGljaykgIT09IC0xO1xuICB9XG5cbiAgaXNNb3VzZUVudGVyVG9TaG93KCkge1xuICAgIGNvbnN0IHsgYWN0aW9uID0gW10sIHNob3dBY3Rpb24gPSBbXSB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gYWN0aW9uLmluZGV4T2YoQWN0aW9uLmhvdmVyKSAhPT0gLTEgfHwgc2hvd0FjdGlvbi5pbmRleE9mKFNob3dBY3Rpb24ubW91c2VFbnRlcikgIT09IC0xO1xuICB9XG5cbiAgaXNNb3VzZUxlYXZlVG9IaWRlKCkge1xuICAgIGNvbnN0IHsgYWN0aW9uID0gW10sIGhpZGVBY3Rpb24gPSBbXSB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gYWN0aW9uLmluZGV4T2YoQWN0aW9uLmhvdmVyKSAhPT0gLTEgfHwgaGlkZUFjdGlvbi5pbmRleE9mKEhpZGVBY3Rpb24ubW91c2VMZWF2ZSkgIT09IC0xO1xuICB9XG5cbiAgaXNGb2N1c1RvU2hvdygpIHtcbiAgICBjb25zdCB7IGFjdGlvbiA9IFtdLCBzaG93QWN0aW9uID0gW10gfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGFjdGlvbi5pbmRleE9mKEFjdGlvbi5mb2N1cykgIT09IC0xIHx8IHNob3dBY3Rpb24uaW5kZXhPZihTaG93QWN0aW9uLmZvY3VzKSAhPT0gLTE7XG4gIH1cblxuICBpc0JsdXJUb0hpZGUoKSB7XG4gICAgY29uc3QgeyBhY3Rpb24gPSBbXSwgaGlkZUFjdGlvbiA9IFtdIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBhY3Rpb24uaW5kZXhPZihBY3Rpb24uZm9jdXMpICE9PSAtMSB8fCBoaWRlQWN0aW9uLmluZGV4T2YoSGlkZUFjdGlvbi5ibHVyKSAhPT0gLTE7XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==