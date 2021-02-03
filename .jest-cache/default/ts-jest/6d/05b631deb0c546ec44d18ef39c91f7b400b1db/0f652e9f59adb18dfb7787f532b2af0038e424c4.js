import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import LazyRenderBox from './LazyRenderBox';
import Icon from '../../icon';
import Animate from '../../animate';
import getScrollBarSize from '../util/getScrollBarSize';
import KeyCode from '../../_util/KeyCode';
import addEventListener from '../../_util/addEventListener';
let uuid = 0;
let openCount = 0;
/* eslint react/no-is-mounted:0 */
function getScroll(w, top) {
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
function setTransformOrigin(node, value) {
    const style = node.style;
    ['Webkit', 'Moz', 'Ms', 'ms'].forEach((prefix) => {
        style[`${prefix}TransformOrigin`] = value;
    });
    style.transformOrigin = value;
}
function offset(el) {
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
export default class Dialog extends Component {
    constructor() {
        super(...arguments);
        this.center = () => {
            const { center } = this.props;
            const dialogNode = findDOMNode(this.dialog);
            if (center && dialogNode && typeof window !== 'undefined') {
                const { clientWidth: docWidth, clientHeight: docHeight } = window.document.documentElement;
                const { offsetWidth: width, offsetHeight: height, style } = dialogNode;
                style.left = `${Math.max((docWidth - width) / 2, 0)}px`;
                style.top = `${Math.max((docHeight - height) / 2, 0)}px`;
            }
        };
        this.onEventListener = () => {
            if (typeof window !== 'undefined') {
                this.resizeEvent = addEventListener(window, 'resize', this.center);
            }
        };
        this.removeEventListener = () => {
            if (typeof window !== 'undefined') {
                this.resizeEvent.remove();
            }
        };
        this.onAnimateLeave = () => {
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
        this.onAnimateEnd = () => {
            const { animationEnd } = this.props;
            if (animationEnd) {
                animationEnd();
            }
        };
        this.onMaskClick = e => {
            // android trigger click on open (fastclick??)
            if (Date.now() - this.openTime < 300) {
                return;
            }
            if (e.target === e.currentTarget) {
                this.close(e);
            }
        };
        this.onKeyDown = (e) => {
            const props = this.props;
            if (props.keyboard && e.keyCode === KeyCode.ESC) {
                this.close(e);
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
                    }
                    else if (activeElement === this.sentinel) {
                        dialogRoot.focus();
                    }
                }
            }
        };
        this.getDialogElement = () => {
            const props = this.props;
            const closable = props.closable;
            const prefixCls = props.prefixCls;
            const dest = {};
            if (props.width !== undefined) {
                dest.width = props.width;
            }
            if (props.height !== undefined) {
                dest.height = props.height;
            }
            let footer;
            if (props.footer) {
                footer = React.createElement("div", { className: `${prefixCls}-footer` }, props.footer);
            }
            let header;
            if (props.title) {
                header = (React.createElement("div", { className: `${prefixCls}-header` },
                    React.createElement("div", { className: `${prefixCls}-title`, id: this.titleId }, props.title)));
            }
            let closer;
            if (closable) {
                closer = (React.createElement("button", { type: "button", onClick: this.close, "aria-label": "Close", className: `${prefixCls}-close` },
                    React.createElement(Icon, { className: `${prefixCls}-close-x`, type: "close" })));
            }
            const style = { ...props.style, ...dest };
            const transitionName = this.getTransitionName();
            const dialogElement = (React.createElement(LazyRenderBox, { key: "dialog-element", role: "document", ref: this.saveRef('dialog'), style: style, className: `${prefixCls} ${props.className || ''}`, hidden: !props.visible },
                React.createElement("div", { className: `${prefixCls}-content` },
                    closer,
                    header,
                    React.createElement("div", Object.assign({ className: `${prefixCls}-body`, style: props.bodyStyle }, props.bodyProps), props.children),
                    footer),
                React.createElement("div", { tabIndex: 0, ref: this.saveRef('sentinel'), style: { width: 0, height: 0, overflow: 'hidden' } }, "sentinel")));
            return (React.createElement(Animate, { key: "dialog", hiddenProp: "hidden", onEnd: this.onAnimateEnd, onLeave: this.onAnimateLeave, transitionName: transitionName, component: "", transitionAppear: true }, props.visible || !props.destroyOnClose ? dialogElement : null));
        };
        this.getZIndexStyle = () => {
            const style = {};
            const props = this.props;
            if (props.zIndex !== undefined) {
                style.zIndex = props.zIndex;
            }
            return style;
        };
        this.getWrapStyle = () => {
            const { wrapStyle } = this.props;
            return { ...this.getZIndexStyle(), ...wrapStyle };
        };
        this.getMaskStyle = () => {
            const { maskStyle } = this.props;
            return { ...this.getZIndexStyle(), ...maskStyle };
        };
        this.getMaskElement = () => {
            const props = this.props;
            let maskElement;
            if (props.mask) {
                const maskTransition = this.getMaskTransitionName();
                maskElement = (React.createElement(LazyRenderBox, Object.assign({ style: this.getMaskStyle(), key: "mask", className: `${props.prefixCls}-mask`, hiddenClassName: `${props.prefixCls}-mask-hidden`, hidden: !props.visible }, props.maskProps)));
                if (maskTransition) {
                    maskElement = (React.createElement(Animate, { key: "mask", hiddenProp: "hidden", transitionAppear: true, component: "", transitionName: maskTransition }, maskElement));
                }
            }
            return maskElement;
        };
        this.getMaskTransitionName = () => {
            const props = this.props;
            let transitionName = props.maskTransitionName;
            const animation = props.maskAnimation;
            if (!transitionName && animation) {
                transitionName = `${props.prefixCls}-${animation}`;
            }
            return transitionName;
        };
        this.getTransitionName = () => {
            const props = this.props;
            let transitionName = props.transitionName;
            const animation = props.animation;
            if (!transitionName && animation) {
                transitionName = `${props.prefixCls}-${animation}`;
            }
            return transitionName;
        };
        this.setScrollbar = () => {
            if (this.bodyIsOverflowing && this.scrollbarWidth !== undefined) {
                document.body.style.paddingRight = `${this.scrollbarWidth}px`;
            }
        };
        this.addScrollingEffect = () => {
            openCount++;
            if (openCount !== 1) {
                return;
            }
            this.checkScrollbar();
            this.setScrollbar();
            document.body.style.overflow = 'hidden';
            // this.adjustDialog();
        };
        this.removeScrollingEffect = () => {
            openCount--;
            if (openCount !== 0) {
                return;
            }
            document.body.style.overflow = '';
            this.resetScrollbar();
            // this.resetAdjustments();
        };
        this.close = (e) => {
            const { onClose } = this.props;
            if (onClose) {
                onClose(e);
            }
        };
        this.checkScrollbar = () => {
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
        this.resetScrollbar = () => {
            document.body.style.paddingRight = '';
        };
        this.adjustDialog = () => {
            const { wrap } = this;
            if (wrap && this.scrollbarWidth !== undefined) {
                const modalIsOverflowing = wrap.scrollHeight > document.documentElement.clientHeight;
                wrap.style.paddingLeft = `${!this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : ''}px`;
                wrap.style.paddingRight = `${this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''}px`;
            }
        };
        this.resetAdjustments = () => {
            const { wrap } = this;
            if (wrap) {
                const { style } = wrap;
                style.paddingLeft = '';
                style.paddingRight = '';
            }
        };
        this.saveRef = (name) => (node) => {
            this[name] = node;
        };
    }
    componentWillMount() {
        this.inTransition = false;
        this.titleId = `rcDialogTitle${uuid++}`;
    }
    componentDidMount() {
        const { center } = this.props;
        const dialogNode = findDOMNode(this.dialog);
        if (center && dialogNode) {
            const { style } = dialogNode;
            this.center();
            style.margin = '0';
            style.padding = '0';
            this.onEventListener();
        }
        this.componentDidUpdate({});
    }
    componentDidUpdate(prevProps) {
        const { mousePosition, visible, mask } = this.props;
        if (visible) {
            // first show
            if (!prevProps.visible) {
                this.center();
                this.openTime = Date.now();
                this.lastOutSideFocusNode = document.activeElement;
                this.addScrollingEffect();
                this.wrap.focus();
                const dialogNode = findDOMNode(this.dialog);
                if (mousePosition) {
                    const elOffset = offset(dialogNode);
                    setTransformOrigin(dialogNode, `${mousePosition.x - elOffset.left}px ${mousePosition.y - elOffset.top}px`);
                }
                else {
                    setTransformOrigin(dialogNode, '');
                }
            }
        }
        else if (prevProps.visible) {
            this.inTransition = true;
            if (mask && this.lastOutSideFocusNode) {
                try {
                    this.lastOutSideFocusNode.focus();
                }
                catch (e) {
                    this.lastOutSideFocusNode = null;
                }
                this.lastOutSideFocusNode = null;
            }
        }
    }
    componentWillUnmount() {
        const { visible, center } = this.props;
        if (visible || this.inTransition) {
            this.removeScrollingEffect();
        }
        if (center) {
            this.removeEventListener();
        }
    }
    render() {
        const { props } = this;
        const { prefixCls, maskClosable } = props;
        const style = this.getWrapStyle();
        // clear hide display
        // and only set display after async anim, not here for hide
        if (props.visible) {
            style.display = null;
        }
        return (React.createElement("div", null,
            this.getMaskElement(),
            React.createElement("div", Object.assign({ tabIndex: -1, onKeyDown: this.onKeyDown, className: `${prefixCls}-wrap ${props.wrapClassName || ''}`, ref: this.saveRef('wrap'), onClick: maskClosable ? this.onMaskClick : undefined, role: "dialog", "aria-labelledby": props.title ? this.titleId : null, style: style }, props.wrapProps), this.getDialogElement())));
    }
}
Dialog.defaultProps = {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy9kaWFsb2cvRGlhbG9nLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBb0MsTUFBTSxPQUFPLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLElBQUksTUFBTSxZQUFZLENBQUM7QUFDOUIsT0FBTyxPQUFPLE1BQU0sZUFBZSxDQUFDO0FBQ3BDLE9BQU8sZ0JBQWdCLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxnQkFBZ0IsTUFBTSw4QkFBOEIsQ0FBQztBQUU1RCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFFbEIsa0NBQWtDO0FBRWxDLFNBQVMsU0FBUyxDQUFDLENBQU0sRUFBRSxHQUFhO0lBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9DLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQzNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDckIsR0FBRyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDM0IsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7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SyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDdEI7UUFDRCxPQUFPLENBQ0w7WUFDRyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3RCLDJDQUNFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFDWixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFDekIsU0FBUyxFQUFFLEdBQUcsU0FBUyxTQUFTLEtBQUssQ0FBQyxhQUFhLElBQUksRUFBRSxFQUFFLEVBQzNELEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN6QixPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ3BELElBQUksRUFBQyxRQUFRLHFCQUNJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDbEQsS0FBSyxFQUFFLEtBQUssSUFDUixLQUFLLENBQUMsU0FBUyxHQUVsQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsQ0FDRixDQUNQLENBQUM7SUFDSixDQUFDOztBQTVhTSxtQkFBWSxHQUFHO0lBQ3BCLFNBQVMsRUFBRSxFQUFFO0lBQ2IsSUFBSSxFQUFFLElBQUk7SUFDVixPQUFPLEVBQUUsS0FBSztJQUNkLFFBQVEsRUFBRSxJQUFJO0lBQ2QsUUFBUSxFQUFFLElBQUk7SUFDZCxZQUFZLEVBQUUsSUFBSTtJQUNsQixjQUFjLEVBQUUsS0FBSztJQUNyQixTQUFTLEVBQUUsV0FBVztJQUN0QixNQUFNLEVBQUUsS0FBSztDQUNkLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy9kaWFsb2cvRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBLZXlib2FyZEV2ZW50LCBNb3VzZUV2ZW50SGFuZGxlciB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZpbmRET01Ob2RlIH0gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBMYXp5UmVuZGVyQm94IGZyb20gJy4vTGF6eVJlbmRlckJveCc7XG5pbXBvcnQgSURpYWxvZ1Byb3BUeXBlcyBmcm9tICcuL0lEaWFsb2dQcm9wVHlwZXMnO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vLi4vaWNvbic7XG5pbXBvcnQgQW5pbWF0ZSBmcm9tICcuLi8uLi9hbmltYXRlJztcbmltcG9ydCBnZXRTY3JvbGxCYXJTaXplIGZyb20gJy4uL3V0aWwvZ2V0U2Nyb2xsQmFyU2l6ZSc7XG5pbXBvcnQgS2V5Q29kZSBmcm9tICcuLi8uLi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCBhZGRFdmVudExpc3RlbmVyIGZyb20gJy4uLy4uL191dGlsL2FkZEV2ZW50TGlzdGVuZXInO1xuXG5sZXQgdXVpZCA9IDA7XG5sZXQgb3BlbkNvdW50ID0gMDtcblxuLyogZXNsaW50IHJlYWN0L25vLWlzLW1vdW50ZWQ6MCAqL1xuXG5mdW5jdGlvbiBnZXRTY3JvbGwodzogYW55LCB0b3A/OiBib29sZWFuKSB7XG4gIGxldCByZXQgPSB3W2BwYWdlJHt0b3AgPyAnWScgOiAnWCd9T2Zmc2V0YF07XG4gIGNvbnN0IG1ldGhvZCA9IGBzY3JvbGwke3RvcCA/ICdUb3AnIDogJ0xlZnQnfWA7XG4gIGlmICh0eXBlb2YgcmV0ICE9PSAnbnVtYmVyJykge1xuICAgIGNvbnN0IGQgPSB3LmRvY3VtZW50O1xuICAgIHJldCA9IGQuZG9jdW1lbnRFbGVtZW50W21ldGhvZF07XG4gICAgaWYgKHR5cGVvZiByZXQgIT09ICdudW1iZXInKSB7XG4gICAgICByZXQgPSBkLmJvZHlbbWV0aG9kXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc2V0VHJhbnNmb3JtT3JpZ2luKG5vZGU6IGFueSwgdmFsdWU6IHN0cmluZykge1xuICBjb25zdCBzdHlsZSA9IG5vZGUuc3R5bGU7XG4gIFsnV2Via2l0JywgJ01veicsICdNcycsICdtcyddLmZvckVhY2goKHByZWZpeDogc3RyaW5nKSA9PiB7XG4gICAgc3R5bGVbYCR7cHJlZml4fVRyYW5zZm9ybU9yaWdpbmBdID0gdmFsdWU7XG4gIH0pO1xuICBzdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gb2Zmc2V0KGVsOiBhbnkpIHtcbiAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwb3MgPSB7XG4gICAgbGVmdDogcmVjdC5sZWZ0LFxuICAgIHRvcDogcmVjdC50b3AsXG4gIH07XG4gIGNvbnN0IGRvYyA9IGVsLm93bmVyRG9jdW1lbnQ7XG4gIGNvbnN0IHcgPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcbiAgcG9zLmxlZnQgKz0gZ2V0U2Nyb2xsKHcpO1xuICBwb3MudG9wICs9IGdldFNjcm9sbCh3LCB0cnVlKTtcbiAgcmV0dXJuIHBvcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbG9nIGV4dGVuZHMgQ29tcG9uZW50PElEaWFsb2dQcm9wVHlwZXMsIGFueT4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgbWFzazogdHJ1ZSxcbiAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICBjbG9zYWJsZTogdHJ1ZSxcbiAgICBtYXNrQ2xvc2FibGU6IHRydWUsXG4gICAgZGVzdHJveU9uQ2xvc2U6IGZhbHNlLFxuICAgIHByZWZpeENsczogJ3JjLWRpYWxvZycsXG4gICAgY2VudGVyOiBmYWxzZSxcbiAgfTtcblxuICBwcml2YXRlIGluVHJhbnNpdGlvbjogYm9vbGVhbjtcblxuICBwcml2YXRlIHRpdGxlSWQ6IHN0cmluZztcblxuICBwcml2YXRlIG9wZW5UaW1lOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBsYXN0T3V0U2lkZUZvY3VzTm9kZTogSFRNTEVsZW1lbnQgfCBudWxsO1xuXG4gIHByaXZhdGUgd3JhcDogSFRNTEVsZW1lbnQ7XG5cbiAgcHJpdmF0ZSBkaWFsb2c6IGFueTtcblxuICBwcml2YXRlIHNlbnRpbmVsOiBIVE1MRWxlbWVudDtcblxuICBwcml2YXRlIGJvZHlJc092ZXJmbG93aW5nOiBib29sZWFuO1xuXG4gIHByaXZhdGUgc2Nyb2xsYmFyV2lkdGg6IG51bWJlcjtcblxuICBwcml2YXRlIHJlc2l6ZUV2ZW50OiBhbnk7XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMuaW5UcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgdGhpcy50aXRsZUlkID0gYHJjRGlhbG9nVGl0bGUke3V1aWQrK31gO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgeyBjZW50ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZGlhbG9nTm9kZTogYW55ID0gZmluZERPTU5vZGUodGhpcy5kaWFsb2cpO1xuICAgIGlmIChjZW50ZXIgJiYgZGlhbG9nTm9kZSkge1xuICAgICAgY29uc3QgeyBzdHlsZSB9ID0gZGlhbG9nTm9kZTtcbiAgICAgIHRoaXMuY2VudGVyKCk7XG4gICAgICBzdHlsZS5tYXJnaW4gPSAnMCc7XG4gICAgICBzdHlsZS5wYWRkaW5nID0gJzAnO1xuICAgICAgdGhpcy5vbkV2ZW50TGlzdGVuZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb21wb25lbnREaWRVcGRhdGUoe30pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogSURpYWxvZ1Byb3BUeXBlcykge1xuICAgIGNvbnN0IHsgbW91c2VQb3NpdGlvbiwgdmlzaWJsZSwgbWFzayB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgLy8gZmlyc3Qgc2hvd1xuICAgICAgaWYgKCFwcmV2UHJvcHMudmlzaWJsZSkge1xuICAgICAgICB0aGlzLmNlbnRlcigpO1xuICAgICAgICB0aGlzLm9wZW5UaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5sYXN0T3V0U2lkZUZvY3VzTm9kZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYWRkU2Nyb2xsaW5nRWZmZWN0KCk7XG4gICAgICAgIHRoaXMud3JhcC5mb2N1cygpO1xuICAgICAgICBjb25zdCBkaWFsb2dOb2RlID0gZmluZERPTU5vZGUodGhpcy5kaWFsb2cpO1xuICAgICAgICBpZiAobW91c2VQb3NpdGlvbikge1xuICAgICAgICAgIGNvbnN0IGVsT2Zmc2V0ID0gb2Zmc2V0KGRpYWxvZ05vZGUpO1xuICAgICAgICAgIHNldFRyYW5zZm9ybU9yaWdpbihcbiAgICAgICAgICAgIGRpYWxvZ05vZGUsXG4gICAgICAgICAgICBgJHttb3VzZVBvc2l0aW9uLnggLSBlbE9mZnNldC5sZWZ0fXB4ICR7bW91c2VQb3NpdGlvbi55IC0gZWxPZmZzZXQudG9wfXB4YCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFRyYW5zZm9ybU9yaWdpbihkaWFsb2dOb2RlLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByZXZQcm9wcy52aXNpYmxlKSB7XG4gICAgICB0aGlzLmluVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICBpZiAobWFzayAmJiB0aGlzLmxhc3RPdXRTaWRlRm9jdXNOb2RlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5sYXN0T3V0U2lkZUZvY3VzTm9kZS5mb2N1cygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhpcy5sYXN0T3V0U2lkZUZvY3VzTm9kZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0T3V0U2lkZUZvY3VzTm9kZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgY29uc3QgeyB2aXNpYmxlLCBjZW50ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHZpc2libGUgfHwgdGhpcy5pblRyYW5zaXRpb24pIHtcbiAgICAgIHRoaXMucmVtb3ZlU2Nyb2xsaW5nRWZmZWN0KCk7XG4gICAgfVxuICAgIGlmIChjZW50ZXIpIHtcbiAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigpO1xuICAgIH1cbiAgfVxuXG4gIGNlbnRlciA9ICgpID0+IHtcbiAgICBjb25zdCB7IGNlbnRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBkaWFsb2dOb2RlOiBhbnkgPSBmaW5kRE9NTm9kZSh0aGlzLmRpYWxvZyk7XG4gICAgaWYgKGNlbnRlciAmJiBkaWFsb2dOb2RlICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB7IGNsaWVudFdpZHRoOiBkb2NXaWR0aCwgY2xpZW50SGVpZ2h0OiBkb2NIZWlnaHQgfSA9IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBjb25zdCB7IG9mZnNldFdpZHRoOiB3aWR0aCwgb2Zmc2V0SGVpZ2h0OiBoZWlnaHQsIHN0eWxlIH0gPSBkaWFsb2dOb2RlO1xuICAgICAgc3R5bGUubGVmdCA9IGAke01hdGgubWF4KChkb2NXaWR0aCAtIHdpZHRoKSAvIDIsIDApfXB4YDtcbiAgICAgIHN0eWxlLnRvcCA9IGAke01hdGgubWF4KChkb2NIZWlnaHQgLSBoZWlnaHQpIC8gMiwgMCl9cHhgO1xuICAgIH1cbiAgfTtcblxuICBvbkV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnJlc2l6ZUV2ZW50ID0gYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCB0aGlzLmNlbnRlcik7XG4gICAgfVxuICB9O1xuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnJlc2l6ZUV2ZW50LnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICBvbkFuaW1hdGVMZWF2ZSA9ICgpID0+IHtcbiAgICBjb25zdCB7IGFmdGVyQ2xvc2UgfSA9IHRoaXMucHJvcHM7XG4gICAgLy8gbmVlZCBkZW1vP1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdC1jb21wb25lbnQvZGlhbG9nL3B1bGwvMjhcbiAgICBpZiAodGhpcy53cmFwKSB7XG4gICAgICB0aGlzLndyYXAuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgdGhpcy5pblRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICB0aGlzLnJlbW92ZVNjcm9sbGluZ0VmZmVjdCgpO1xuICAgIGlmIChhZnRlckNsb3NlKSB7XG4gICAgICBhZnRlckNsb3NlKCk7XG4gICAgfVxuICB9O1xuXG4gIG9uQW5pbWF0ZUVuZCA9ICgpID0+IHtcbiAgICBjb25zdCB7IGFuaW1hdGlvbkVuZCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoYW5pbWF0aW9uRW5kKSB7XG4gICAgICBhbmltYXRpb25FbmQoKTtcbiAgICB9XG4gIH07XG5cbiAgb25NYXNrQ2xpY2s6IE1vdXNlRXZlbnRIYW5kbGVyPEhUTUxEaXZFbGVtZW50PiA9IGUgPT4ge1xuICAgIC8vIGFuZHJvaWQgdHJpZ2dlciBjbGljayBvbiBvcGVuIChmYXN0Y2xpY2s/PylcbiAgICBpZiAoRGF0ZS5ub3coKSAtIHRoaXMub3BlblRpbWUgPCAzMDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGUudGFyZ2V0ID09PSBlLmN1cnJlbnRUYXJnZXQpIHtcbiAgICAgIHRoaXMuY2xvc2UoZSk7XG4gICAgfVxuICB9O1xuXG4gIG9uS2V5RG93biA9IChlOiBLZXlib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICBpZiAocHJvcHMua2V5Ym9hcmQgJiYgZS5rZXlDb2RlID09PSBLZXlDb2RlLkVTQykge1xuICAgICAgdGhpcy5jbG9zZShlKTtcbiAgICB9XG4gICAgLy8ga2VlcCBmb2N1cyBpbnNpZGUgZGlhbG9nXG4gICAgaWYgKHByb3BzLnZpc2libGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IEtleUNvZGUuVEFCKSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCBkaWFsb2dSb290ID0gdGhpcy53cmFwO1xuICAgICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgIGlmIChhY3RpdmVFbGVtZW50ID09PSBkaWFsb2dSb290KSB7XG4gICAgICAgICAgICB0aGlzLnNlbnRpbmVsLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuc2VudGluZWwpIHtcbiAgICAgICAgICBkaWFsb2dSb290LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZ2V0RGlhbG9nRWxlbWVudCA9ICgpID0+IHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgY2xvc2FibGUgPSBwcm9wcy5jbG9zYWJsZTtcbiAgICBjb25zdCBwcmVmaXhDbHMgPSBwcm9wcy5wcmVmaXhDbHM7XG4gICAgY29uc3QgZGVzdDogYW55ID0ge307XG4gICAgaWYgKHByb3BzLndpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlc3Qud2lkdGggPSBwcm9wcy53aWR0aDtcbiAgICB9XG4gICAgaWYgKHByb3BzLmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXN0LmhlaWdodCA9IHByb3BzLmhlaWdodDtcbiAgICB9XG4gICAgbGV0IGZvb3RlcjtcbiAgICBpZiAocHJvcHMuZm9vdGVyKSB7XG4gICAgICBmb290ZXIgPSA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1mb290ZXJgfT57cHJvcHMuZm9vdGVyfTwvZGl2PjtcbiAgICB9XG5cbiAgICBsZXQgaGVhZGVyO1xuICAgIGlmIChwcm9wcy50aXRsZSkge1xuICAgICAgaGVhZGVyID0gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1oZWFkZXJgfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS10aXRsZWB9IGlkPXt0aGlzLnRpdGxlSWR9PlxuICAgICAgICAgICAge3Byb3BzLnRpdGxlfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGNsb3NlcjtcbiAgICBpZiAoY2xvc2FibGUpIHtcbiAgICAgIGNsb3NlciA9IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuY2xvc2V9XG4gICAgICAgICAgYXJpYS1sYWJlbD1cIkNsb3NlXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tY2xvc2VgfVxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNsb3NlLXhgfSB0eXBlPVwiY2xvc2VcIiAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGUgPSB7IC4uLnByb3BzLnN0eWxlLCAuLi5kZXN0IH07XG4gICAgY29uc3QgdHJhbnNpdGlvbk5hbWUgPSB0aGlzLmdldFRyYW5zaXRpb25OYW1lKCk7XG4gICAgY29uc3QgZGlhbG9nRWxlbWVudCA9IChcbiAgICAgIDxMYXp5UmVuZGVyQm94XG4gICAgICAgIGtleT1cImRpYWxvZy1lbGVtZW50XCJcbiAgICAgICAgcm9sZT1cImRvY3VtZW50XCJcbiAgICAgICAgcmVmPXt0aGlzLnNhdmVSZWYoJ2RpYWxvZycpfVxuICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfSAke3Byb3BzLmNsYXNzTmFtZSB8fCAnJ31gfVxuICAgICAgICBoaWRkZW49eyFwcm9wcy52aXNpYmxlfVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1jb250ZW50YH0+XG4gICAgICAgICAge2Nsb3Nlcn1cbiAgICAgICAgICB7aGVhZGVyfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWJvZHlgfSBzdHlsZT17cHJvcHMuYm9keVN0eWxlfSB7Li4ucHJvcHMuYm9keVByb3BzfT5cbiAgICAgICAgICAgIHtwcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7Zm9vdGVyfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHRhYkluZGV4PXswfVxuICAgICAgICAgIHJlZj17dGhpcy5zYXZlUmVmKCdzZW50aW5lbCcpfVxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIG92ZXJmbG93OiAnaGlkZGVuJyB9fVxuICAgICAgICA+XG4gICAgICAgICAgc2VudGluZWxcbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0xhenlSZW5kZXJCb3g+XG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgPEFuaW1hdGVcbiAgICAgICAga2V5PVwiZGlhbG9nXCJcbiAgICAgICAgaGlkZGVuUHJvcD1cImhpZGRlblwiXG4gICAgICAgIG9uRW5kPXt0aGlzLm9uQW5pbWF0ZUVuZH1cbiAgICAgICAgb25MZWF2ZT17dGhpcy5vbkFuaW1hdGVMZWF2ZX1cbiAgICAgICAgdHJhbnNpdGlvbk5hbWU9e3RyYW5zaXRpb25OYW1lfVxuICAgICAgICBjb21wb25lbnQ9XCJcIlxuICAgICAgICB0cmFuc2l0aW9uQXBwZWFyXG4gICAgICA+XG4gICAgICAgIHtwcm9wcy52aXNpYmxlIHx8ICFwcm9wcy5kZXN0cm95T25DbG9zZSA/IGRpYWxvZ0VsZW1lbnQgOiBudWxsfVxuICAgICAgPC9BbmltYXRlPlxuICAgICk7XG4gIH07XG5cbiAgZ2V0WkluZGV4U3R5bGUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3R5bGU6IGFueSA9IHt9O1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICBpZiAocHJvcHMuekluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0eWxlLnpJbmRleCA9IHByb3BzLnpJbmRleDtcbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9O1xuXG4gIGdldFdyYXBTdHlsZSA9ICgpOiBhbnkgPT4ge1xuICAgIGNvbnN0IHsgd3JhcFN0eWxlIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB7IC4uLnRoaXMuZ2V0WkluZGV4U3R5bGUoKSwgLi4ud3JhcFN0eWxlIH07XG4gIH07XG5cbiAgZ2V0TWFza1N0eWxlID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgbWFza1N0eWxlIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB7IC4uLnRoaXMuZ2V0WkluZGV4U3R5bGUoKSwgLi4ubWFza1N0eWxlIH07XG4gIH07XG5cbiAgZ2V0TWFza0VsZW1lbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIGxldCBtYXNrRWxlbWVudDtcbiAgICBpZiAocHJvcHMubWFzaykge1xuICAgICAgY29uc3QgbWFza1RyYW5zaXRpb24gPSB0aGlzLmdldE1hc2tUcmFuc2l0aW9uTmFtZSgpO1xuICAgICAgbWFza0VsZW1lbnQgPSAoXG4gICAgICAgIDxMYXp5UmVuZGVyQm94XG4gICAgICAgICAgc3R5bGU9e3RoaXMuZ2V0TWFza1N0eWxlKCl9XG4gICAgICAgICAga2V5PVwibWFza1wiXG4gICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcm9wcy5wcmVmaXhDbHN9LW1hc2tgfVxuICAgICAgICAgIGhpZGRlbkNsYXNzTmFtZT17YCR7cHJvcHMucHJlZml4Q2xzfS1tYXNrLWhpZGRlbmB9XG4gICAgICAgICAgaGlkZGVuPXshcHJvcHMudmlzaWJsZX1cbiAgICAgICAgICB7Li4ucHJvcHMubWFza1Byb3BzfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGlmIChtYXNrVHJhbnNpdGlvbikge1xuICAgICAgICBtYXNrRWxlbWVudCA9IChcbiAgICAgICAgICA8QW5pbWF0ZVxuICAgICAgICAgICAga2V5PVwibWFza1wiXG4gICAgICAgICAgICBoaWRkZW5Qcm9wPVwiaGlkZGVuXCJcbiAgICAgICAgICAgIHRyYW5zaXRpb25BcHBlYXJcbiAgICAgICAgICAgIGNvbXBvbmVudD1cIlwiXG4gICAgICAgICAgICB0cmFuc2l0aW9uTmFtZT17bWFza1RyYW5zaXRpb259XG4gICAgICAgICAgPlxuICAgICAgICAgICAge21hc2tFbGVtZW50fVxuICAgICAgICAgIDwvQW5pbWF0ZT5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hc2tFbGVtZW50O1xuICB9O1xuXG4gIGdldE1hc2tUcmFuc2l0aW9uTmFtZSA9ICgpID0+IHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgbGV0IHRyYW5zaXRpb25OYW1lID0gcHJvcHMubWFza1RyYW5zaXRpb25OYW1lO1xuICAgIGNvbnN0IGFuaW1hdGlvbiA9IHByb3BzLm1hc2tBbmltYXRpb247XG4gICAgaWYgKCF0cmFuc2l0aW9uTmFtZSAmJiBhbmltYXRpb24pIHtcbiAgICAgIHRyYW5zaXRpb25OYW1lID0gYCR7cHJvcHMucHJlZml4Q2xzfS0ke2FuaW1hdGlvbn1gO1xuICAgIH1cbiAgICByZXR1cm4gdHJhbnNpdGlvbk5hbWU7XG4gIH07XG5cbiAgZ2V0VHJhbnNpdGlvbk5hbWUgPSAoKSA9PiB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIGxldCB0cmFuc2l0aW9uTmFtZSA9IHByb3BzLnRyYW5zaXRpb25OYW1lO1xuICAgIGNvbnN0IGFuaW1hdGlvbiA9IHByb3BzLmFuaW1hdGlvbjtcbiAgICBpZiAoIXRyYW5zaXRpb25OYW1lICYmIGFuaW1hdGlvbikge1xuICAgICAgdHJhbnNpdGlvbk5hbWUgPSBgJHtwcm9wcy5wcmVmaXhDbHN9LSR7YW5pbWF0aW9ufWA7XG4gICAgfVxuICAgIHJldHVybiB0cmFuc2l0aW9uTmFtZTtcbiAgfTtcblxuICBzZXRTY3JvbGxiYXIgPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgdGhpcy5zY3JvbGxiYXJXaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IGAke3RoaXMuc2Nyb2xsYmFyV2lkdGh9cHhgO1xuICAgIH1cbiAgfTtcblxuICBhZGRTY3JvbGxpbmdFZmZlY3QgPSAoKSA9PiB7XG4gICAgb3BlbkNvdW50Kys7XG4gICAgaWYgKG9wZW5Db3VudCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNoZWNrU2Nyb2xsYmFyKCk7XG4gICAgdGhpcy5zZXRTY3JvbGxiYXIoKTtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgLy8gdGhpcy5hZGp1c3REaWFsb2coKTtcbiAgfTtcblxuICByZW1vdmVTY3JvbGxpbmdFZmZlY3QgPSAoKSA9PiB7XG4gICAgb3BlbkNvdW50LS07XG4gICAgaWYgKG9wZW5Db3VudCAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgdGhpcy5yZXNldFNjcm9sbGJhcigpO1xuICAgIC8vIHRoaXMucmVzZXRBZGp1c3RtZW50cygpO1xuICB9O1xuXG4gIGNsb3NlID0gKGU6IGFueSkgPT4ge1xuICAgIGNvbnN0IHsgb25DbG9zZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAob25DbG9zZSkge1xuICAgICAgb25DbG9zZShlKTtcbiAgICB9XG4gIH07XG5cbiAgY2hlY2tTY3JvbGxiYXIgPSAoKSA9PiB7XG4gICAgbGV0IGZ1bGxXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGlmICghZnVsbFdpbmRvd1dpZHRoKSB7XG4gICAgICAvLyB3b3JrYXJvdW5kIGZvciBtaXNzaW5nIHdpbmRvdy5pbm5lcldpZHRoIGluIElFOFxuICAgICAgY29uc3QgZG9jdW1lbnRFbGVtZW50UmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGZ1bGxXaW5kb3dXaWR0aCA9IGRvY3VtZW50RWxlbWVudFJlY3QucmlnaHQgLSBNYXRoLmFicyhkb2N1bWVudEVsZW1lbnRSZWN0LmxlZnQpO1xuICAgIH1cbiAgICB0aGlzLmJvZHlJc092ZXJmbG93aW5nID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IGZ1bGxXaW5kb3dXaWR0aDtcbiAgICBpZiAodGhpcy5ib2R5SXNPdmVyZmxvd2luZykge1xuICAgICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IGdldFNjcm9sbEJhclNpemUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmVzZXRTY3JvbGxiYXIgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSAnJztcbiAgfTtcblxuICBhZGp1c3REaWFsb2cgPSAoKSA9PiB7XG4gICAgY29uc3QgeyB3cmFwIH0gPSB0aGlzO1xuICAgIGlmICh3cmFwICYmIHRoaXMuc2Nyb2xsYmFyV2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgbW9kYWxJc092ZXJmbG93aW5nID0gd3JhcC5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgd3JhcC5zdHlsZS5wYWRkaW5nTGVmdCA9IGAke1xuICAgICAgICAhdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiBtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcbiAgICAgIH1weGA7XG4gICAgICB3cmFwLnN0eWxlLnBhZGRpbmdSaWdodCA9IGAke1xuICAgICAgICB0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcbiAgICAgIH1weGA7XG4gICAgfVxuICB9O1xuXG4gIHJlc2V0QWRqdXN0bWVudHMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyB3cmFwIH0gPSB0aGlzO1xuICAgIGlmICh3cmFwKSB7XG4gICAgICBjb25zdCB7IHN0eWxlIH0gPSB3cmFwO1xuICAgICAgc3R5bGUucGFkZGluZ0xlZnQgPSAnJztcbiAgICAgIHN0eWxlLnBhZGRpbmdSaWdodCA9ICcnO1xuICAgIH1cbiAgfTtcblxuICBzYXZlUmVmID0gKG5hbWU6IHN0cmluZykgPT4gKG5vZGU6IGFueSkgPT4ge1xuICAgICh0aGlzIGFzIGFueSlbbmFtZV0gPSBub2RlO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCBtYXNrQ2xvc2FibGUgfSA9IHByb3BzO1xuICAgIGNvbnN0IHN0eWxlID0gdGhpcy5nZXRXcmFwU3R5bGUoKTtcbiAgICAvLyBjbGVhciBoaWRlIGRpc3BsYXlcbiAgICAvLyBhbmQgb25seSBzZXQgZGlzcGxheSBhZnRlciBhc3luYyBhbmltLCBub3QgaGVyZSBmb3IgaGlkZVxuICAgIGlmIChwcm9wcy52aXNpYmxlKSB7XG4gICAgICBzdHlsZS5kaXNwbGF5ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHt0aGlzLmdldE1hc2tFbGVtZW50KCl9XG4gICAgICAgIDxkaXZcbiAgICAgICAgICB0YWJJbmRleD17LTF9XG4gICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30td3JhcCAke3Byb3BzLndyYXBDbGFzc05hbWUgfHwgJyd9YH1cbiAgICAgICAgICByZWY9e3RoaXMuc2F2ZVJlZignd3JhcCcpfVxuICAgICAgICAgIG9uQ2xpY2s9e21hc2tDbG9zYWJsZSA/IHRoaXMub25NYXNrQ2xpY2sgOiB1bmRlZmluZWR9XG4gICAgICAgICAgcm9sZT1cImRpYWxvZ1wiXG4gICAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PXtwcm9wcy50aXRsZSA/IHRoaXMudGl0bGVJZCA6IG51bGx9XG4gICAgICAgICAgc3R5bGU9e3N0eWxlfVxuICAgICAgICAgIHsuLi5wcm9wcy53cmFwUHJvcHN9XG4gICAgICAgID5cbiAgICAgICAgICB7dGhpcy5nZXREaWFsb2dFbGVtZW50KCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9