import { cloneElement, Component, createElement, isValidElement, } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { findChildInChildrenByKey, findShownChildInChildrenByKey, isSameChildren, mergeChildren, toArrayChildren, } from './ChildrenUtils';
import AnimateChild from './AnimateChild';
import animUtil from './util';
const defaultKey = `animate_${Date.now()}`;
function getChildrenFromProps(props) {
    const { children } = props;
    if (isValidElement(children)) {
        if (!children.key) {
            return cloneElement(children, {
                key: defaultKey,
            });
        }
    }
    return children;
}
export default class Animate extends Component {
    constructor() {
        super(...arguments);
        this.currentlyAnimatingKeys = {};
        this.keysToEnter = [];
        this.keysToLeave = [];
        this.state = {
            children: toArrayChildren(getChildrenFromProps(this.props)),
        };
        this.childrenRefs = {};
        this.performEnter = (key) => {
            const childRef = this.childrenRefs[key];
            if (childRef) {
                this.currentlyAnimatingKeys[key] = true;
                childRef.componentWillEnter(this.handleDoneAdding.bind(this, key, 'enter'));
            }
        };
        this.performAppear = (key) => {
            const childRef = this.childrenRefs[key];
            if (childRef) {
                this.currentlyAnimatingKeys[key] = true;
                childRef.componentWillAppear(this.handleDoneAdding.bind(this, key, 'appear'));
            }
        };
        this.handleDoneAdding = (key, type, childRef) => {
            const { props } = this;
            const { exclusive, onAppear = noop, onEnd = noop, onEnter = noop } = props;
            delete this.currentlyAnimatingKeys[key];
            if (exclusive && props !== this.nextProps) {
                return;
            }
            if (!this.isValidChildByKey(toArrayChildren(getChildrenFromProps(props)), key)) {
                this.performLeave(key);
            }
            else if (type === 'appear') {
                if (animUtil.allowAppearCallback(props)) {
                    onAppear(key, childRef);
                    onEnd(key, true, childRef);
                }
            }
            else if (animUtil.allowEnterCallback(props)) {
                onEnter(key, childRef);
                onEnd(key, true, childRef);
            }
        };
        this.performLeave = (key) => {
            const childRef = this.childrenRefs[key];
            if (childRef) {
                this.currentlyAnimatingKeys[key] = true;
                childRef.componentWillLeave(this.handleDoneLeaving.bind(this, key));
            }
        };
        this.handleDoneLeaving = (key, childRef) => {
            const { props, state: { children }, } = this;
            const { exclusive, onEnd = noop, onLeave = noop, hiddenProp } = props;
            delete this.currentlyAnimatingKeys[key];
            if (exclusive && props !== this.nextProps) {
                return;
            }
            const currentChildren = toArrayChildren(getChildrenFromProps(props));
            if (this.isValidChildByKey(currentChildren, key)) {
                this.performEnter(key);
            }
            else {
                const end = () => {
                    if (animUtil.allowLeaveCallback(props)) {
                        onLeave(key, childRef);
                        onEnd(key, false, childRef);
                    }
                };
                if (!isSameChildren(children, currentChildren, hiddenProp)) {
                    this.setState({
                        children: currentChildren,
                    }, end);
                }
                else {
                    end();
                }
            }
        };
    }
    componentDidMount() {
        const { hiddenProp } = this.props;
        let { children } = this.state;
        if (hiddenProp) {
            children = children.filter(child => !child.props[hiddenProp]);
        }
        children.forEach(child => {
            if (child && child.key) {
                this.performAppear(child.key);
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        this.nextProps = nextProps;
        const nextChildren = toArrayChildren(getChildrenFromProps(nextProps));
        const { exclusive, hiddenProp } = this.props;
        const { children } = this.state;
        const currentlyAnimatingKeys = this.currentlyAnimatingKeys;
        if (exclusive) {
            Object.keys(currentlyAnimatingKeys).forEach(key => this.stop(key));
        }
        const currentChildren = exclusive
            ? toArrayChildren(getChildrenFromProps(this.props))
            : children;
        let newChildren = [];
        if (hiddenProp) {
            nextChildren.forEach(nextChild => {
                if (nextChild) {
                    let newChild;
                    const currentChild = findChildInChildrenByKey(currentChildren, nextChild.key);
                    if (nextChild.props[hiddenProp] && currentChild && !currentChild.props[hiddenProp]) {
                        newChild = cloneElement(nextChild, { [hiddenProp]: false });
                    }
                    else {
                        newChild = nextChild;
                    }
                    if (newChild) {
                        newChildren.push(newChild);
                    }
                }
            });
            newChildren = mergeChildren(currentChildren, newChildren);
        }
        else {
            newChildren = mergeChildren(currentChildren, nextChildren);
        }
        this.setState({
            children: newChildren,
        });
        nextChildren.forEach(child => {
            const key = child && child.key;
            if (key) {
                if (child && currentlyAnimatingKeys[key]) {
                    return;
                }
                const hasPrev = child && findChildInChildrenByKey(currentChildren, key);
                if (hiddenProp) {
                    const showInNext = !child.props[hiddenProp];
                    if (hasPrev) {
                        const showInNow = findShownChildInChildrenByKey(currentChildren, key, hiddenProp);
                        if (!showInNow && showInNext) {
                            this.keysToEnter.push(key);
                        }
                    }
                    else if (showInNext) {
                        this.keysToEnter.push(key);
                    }
                }
                else if (!hasPrev) {
                    this.keysToEnter.push(key);
                }
            }
        });
        currentChildren.forEach(child => {
            const key = child && child.key;
            if (key) {
                if (child && currentlyAnimatingKeys[key]) {
                    return;
                }
                const hasNext = child && findChildInChildrenByKey(nextChildren, key);
                if (hiddenProp) {
                    const showInNow = !child.props[hiddenProp];
                    if (hasNext) {
                        const showInNext = findShownChildInChildrenByKey(nextChildren, key, hiddenProp);
                        if (!showInNext && showInNow) {
                            this.keysToLeave.push(key);
                        }
                    }
                    else if (showInNow) {
                        this.keysToLeave.push(key);
                    }
                }
                else if (!hasNext) {
                    this.keysToLeave.push(key);
                }
            }
        });
    }
    componentDidUpdate() {
        const keysToEnter = this.keysToEnter;
        this.keysToEnter = [];
        keysToEnter.forEach(this.performEnter);
        const keysToLeave = this.keysToLeave;
        this.keysToLeave = [];
        keysToLeave.forEach(this.performLeave);
    }
    isValidChildByKey(currentChildren, key) {
        const { hiddenProp } = this.props;
        if (hiddenProp) {
            return !!findShownChildInChildrenByKey(currentChildren, key, hiddenProp);
        }
        return !!findChildInChildrenByKey(currentChildren, key);
    }
    stop(key) {
        delete this.currentlyAnimatingKeys[key];
        const component = this.childrenRefs[key];
        if (component) {
            component.stop();
        }
    }
    render() {
        const { props } = this;
        this.nextProps = props;
        const { animation, transitionName, transitionEnter, transitionAppear, transitionLeave, component: Cmp, componentProps, ...otherProps } = props;
        const { children: stateChildren } = this.state;
        let children = [];
        if (stateChildren) {
            children = stateChildren.map(child => {
                if (child === null || child === undefined) {
                    return child;
                }
                if (!child.key) {
                    throw new Error('must set key for animate children');
                }
                return createElement(AnimateChild, {
                    key: child.key,
                    ref: node => {
                        if (child.key) {
                            this.childrenRefs[child.key] = node;
                        }
                    },
                    animation,
                    transitionName,
                    transitionEnter,
                    transitionAppear,
                    transitionLeave,
                }, child);
            });
        }
        if (Cmp) {
            const passedProps = omit(otherProps, [
                'exclusive',
                'onEnd',
                'onEnter',
                'onLeave',
                'onAppear',
                'hiddenProp',
            ]);
            return createElement(Cmp, {
                ...passedProps,
                ...componentProps,
            }, children);
        }
        return children[0] || null;
    }
}
Animate.displayName = 'Animate';
Animate.propTypes = {
    component: PropTypes.any,
    componentProps: PropTypes.object,
    animation: PropTypes.object,
    transitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    transitionEnter: PropTypes.bool,
    transitionAppear: PropTypes.bool,
    exclusive: PropTypes.bool,
    transitionLeave: PropTypes.bool,
    onEnd: PropTypes.func,
    onEnter: PropTypes.func,
    onLeave: PropTypes.func,
    onAppear: PropTypes.func,
    hiddenProp: PropTypes.string,
};
Animate.defaultProps = {
    animation: {},
    component: 'span',
    componentProps: {},
    transitionEnter: true,
    transitionLeave: true,
    transitionAppear: false,
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvYW5pbWF0ZS9BbmltYXRlLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsRUFDVCxhQUFhLEVBQ2IsY0FBYyxHQUlmLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxFQUNMLHdCQUF3QixFQUN4Qiw2QkFBNkIsRUFDN0IsY0FBYyxFQUNkLGFBQWEsRUFDYixlQUFlLEdBQ2hCLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxZQUFtQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2pFLE9BQU8sUUFBUSxNQUFNLFFBQVEsQ0FBQztBQUU5QixNQUFNLFVBQVUsR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBRTNDLFNBQVMsb0JBQW9CLENBQUMsS0FBSztJQUNqQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2pCLE9BQU8sWUFBWSxDQUFDLFFBQVEsRUFBRTtnQkFDNUIsR0FBRyxFQUFFLFVBQVU7YUFDVCxDQUFDLENBQUM7U0FDWDtLQUNGO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQXVCRCxNQUFNLENBQUMsT0FBTyxPQUFPLE9BQVEsU0FBUSxTQUF1QjtJQUE1RDs7UUE0QkUsMkJBQXNCLEdBQUcsRUFBRSxDQUFDO1FBRTVCLGdCQUFXLEdBQVUsRUFBRSxDQUFDO1FBRXhCLGdCQUFXLEdBQVUsRUFBRSxDQUFDO1FBRXhCLFVBQUssR0FBaUI7WUFDcEIsUUFBUSxFQUFFLGVBQWUsQ0FBQyxvQkFBb0Is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LG9CQUFZLEdBQUc7SUFDcEIsU0FBUyxFQUFFLEVBQUU7SUFDYixTQUFTLEVBQUUsTUFBTTtJQUNqQixjQUFjLEVBQUUsRUFBRTtJQUNsQixlQUFlLEVBQUUsSUFBSTtJQUNyQixlQUFlLEVBQUUsSUFBSTtJQUNyQixnQkFBZ0IsRUFBRSxLQUFLO0NBQ3hCLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvYW5pbWF0ZS9BbmltYXRlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBjbG9uZUVsZW1lbnQsXG4gIENvbXBvbmVudCxcbiAgY3JlYXRlRWxlbWVudCxcbiAgaXNWYWxpZEVsZW1lbnQsXG4gIEtleSxcbiAgUmVhY3RFbGVtZW50LFxuICBSZWFjdE5vZGUsXG59IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgbm9vcCBmcm9tICdsb2Rhc2gvbm9vcCc7XG5pbXBvcnQge1xuICBmaW5kQ2hpbGRJbkNoaWxkcmVuQnlLZXksXG4gIGZpbmRTaG93bkNoaWxkSW5DaGlsZHJlbkJ5S2V5LFxuICBpc1NhbWVDaGlsZHJlbixcbiAgbWVyZ2VDaGlsZHJlbixcbiAgdG9BcnJheUNoaWxkcmVuLFxufSBmcm9tICcuL0NoaWxkcmVuVXRpbHMnO1xuaW1wb3J0IEFuaW1hdGVDaGlsZCwgeyBBbmltYXRlQ2hpbGRQcm9wcyB9IGZyb20gJy4vQW5pbWF0ZUNoaWxkJztcbmltcG9ydCBhbmltVXRpbCBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBkZWZhdWx0S2V5ID0gYGFuaW1hdGVfJHtEYXRlLm5vdygpfWA7XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuRnJvbVByb3BzKHByb3BzKTogUmVhY3ROb2RlIHtcbiAgY29uc3QgeyBjaGlsZHJlbiB9ID0gcHJvcHM7XG4gIGlmIChpc1ZhbGlkRWxlbWVudChjaGlsZHJlbikpIHtcbiAgICBpZiAoIWNoaWxkcmVuLmtleSkge1xuICAgICAgcmV0dXJuIGNsb25lRWxlbWVudChjaGlsZHJlbiwge1xuICAgICAgICBrZXk6IGRlZmF1bHRLZXksXG4gICAgICB9IGFzIGFueSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGlsZHJlbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRlUHJvcHMge1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIGNvbXBvbmVudD86IGFueTtcbiAgY29tcG9uZW50UHJvcHM/OiBvYmplY3Q7XG4gIGFuaW1hdGlvbj86IG9iamVjdDtcbiAgdHJhbnNpdGlvbk5hbWU/OiBzdHJpbmcgfCBvYmplY3Q7XG4gIHRyYW5zaXRpb25FbnRlcj86IGJvb2xlYW47XG4gIHRyYW5zaXRpb25BcHBlYXI/OiBib29sZWFuO1xuICBleGNsdXNpdmU/OiBib29sZWFuO1xuICB0cmFuc2l0aW9uTGVhdmU/OiBib29sZWFuO1xuICBvbkVuZD86IChrZXk6IEtleSB8IG51bGwsIGZsYWc6IGJvb2xlYW4sIGNoaWxkUmVmOiBBbmltYXRlQ2hpbGQpID0+IHZvaWQ7XG4gIG9uRW50ZXI/OiAoa2V5OiBLZXkgfCBudWxsLCBjaGlsZFJlZjogQW5pbWF0ZUNoaWxkKSA9PiB2b2lkO1xuICBvbkxlYXZlPzogKGtleTogS2V5IHwgbnVsbCwgY2hpbGRSZWY6IEFuaW1hdGVDaGlsZCkgPT4gdm9pZDtcbiAgb25BcHBlYXI/OiAoa2V5OiBLZXkgfCBudWxsLCBjaGlsZFJlZjogQW5pbWF0ZUNoaWxkKSA9PiB2b2lkO1xuICBoaWRkZW5Qcm9wPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGVTdGF0ZSB7XG4gIGNoaWxkcmVuOiBSZWFjdEVsZW1lbnQ8YW55PltdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmltYXRlIGV4dGVuZHMgQ29tcG9uZW50PEFuaW1hdGVQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnQW5pbWF0ZSc7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjb21wb25lbnQ6IFByb3BUeXBlcy5hbnksXG4gICAgY29tcG9uZW50UHJvcHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgYW5pbWF0aW9uOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHRyYW5zaXRpb25OYW1lOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMub2JqZWN0XSksXG4gICAgdHJhbnNpdGlvbkVudGVyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0cmFuc2l0aW9uQXBwZWFyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBleGNsdXNpdmU6IFByb3BUeXBlcy5ib29sLFxuICAgIHRyYW5zaXRpb25MZWF2ZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgb25FbmQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRW50ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uTGVhdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uQXBwZWFyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBoaWRkZW5Qcm9wOiBQcm9wVHlwZXMuc3RyaW5nLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgYW5pbWF0aW9uOiB7fSxcbiAgICBjb21wb25lbnQ6ICdzcGFuJyxcbiAgICBjb21wb25lbnRQcm9wczoge30sXG4gICAgdHJhbnNpdGlvbkVudGVyOiB0cnVlLFxuICAgIHRyYW5zaXRpb25MZWF2ZTogdHJ1ZSxcbiAgICB0cmFuc2l0aW9uQXBwZWFyOiBmYWxzZSxcbiAgfTtcblxuICBjdXJyZW50bHlBbmltYXRpbmdLZXlzID0ge307XG5cbiAga2V5c1RvRW50ZXI6IEtleVtdID0gW107XG5cbiAga2V5c1RvTGVhdmU6IEtleVtdID0gW107XG5cbiAgc3RhdGU6IEFuaW1hdGVTdGF0ZSA9IHtcbiAgICBjaGlsZHJlbjogdG9BcnJheUNoaWxkcmVuKGdldENoaWxkcmVuRnJvbVByb3BzKHRoaXMucHJvcHMpKSxcbiAgfTtcblxuICBjaGlsZHJlblJlZnMgPSB7fTtcblxuICBuZXh0UHJvcHM/OiBvYmplY3Q7XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgeyBoaWRkZW5Qcm9wIH0gPSB0aGlzLnByb3BzO1xuICAgIGxldCB7IGNoaWxkcmVuIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChoaWRkZW5Qcm9wKSB7XG4gICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQucHJvcHNbaGlkZGVuUHJvcF0pO1xuICAgIH1cbiAgICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5rZXkpIHtcbiAgICAgICAgdGhpcy5wZXJmb3JtQXBwZWFyKGNoaWxkLmtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgIHRoaXMubmV4dFByb3BzID0gbmV4dFByb3BzO1xuICAgIGNvbnN0IG5leHRDaGlsZHJlbiA9IHRvQXJyYXlDaGlsZHJlbihnZXRDaGlsZHJlbkZyb21Qcm9wcyhuZXh0UHJvcHMpKTtcbiAgICBjb25zdCB7IGV4Y2x1c2l2ZSwgaGlkZGVuUHJvcCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGN1cnJlbnRseUFuaW1hdGluZ0tleXMgPSB0aGlzLmN1cnJlbnRseUFuaW1hdGluZ0tleXM7XG4gICAgaWYgKGV4Y2x1c2l2ZSkge1xuICAgICAgT2JqZWN0LmtleXMoY3VycmVudGx5QW5pbWF0aW5nS2V5cykuZm9yRWFjaChrZXkgPT4gdGhpcy5zdG9wKGtleSkpO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50Q2hpbGRyZW4gPSBleGNsdXNpdmVcbiAgICAgID8gdG9BcnJheUNoaWxkcmVuKGdldENoaWxkcmVuRnJvbVByb3BzKHRoaXMucHJvcHMpKVxuICAgICAgOiBjaGlsZHJlbjtcbiAgICBsZXQgbmV3Q2hpbGRyZW46IFJlYWN0RWxlbWVudDxhbnk+W10gPSBbXTtcbiAgICBpZiAoaGlkZGVuUHJvcCkge1xuICAgICAgbmV4dENoaWxkcmVuLmZvckVhY2gobmV4dENoaWxkID0+IHtcbiAgICAgICAgaWYgKG5leHRDaGlsZCkge1xuICAgICAgICAgIGxldCBuZXdDaGlsZDtcbiAgICAgICAgICBjb25zdCBjdXJyZW50Q2hpbGQgPSBmaW5kQ2hpbGRJbkNoaWxkcmVuQnlLZXkoY3VycmVudENoaWxkcmVuLCBuZXh0Q2hpbGQua2V5KTtcbiAgICAgICAgICBpZiAobmV4dENoaWxkLnByb3BzW2hpZGRlblByb3BdICYmIGN1cnJlbnRDaGlsZCAmJiAhY3VycmVudENoaWxkLnByb3BzW2hpZGRlblByb3BdKSB7XG4gICAgICAgICAgICBuZXdDaGlsZCA9IGNsb25lRWxlbWVudChuZXh0Q2hpbGQsIHsgW2hpZGRlblByb3BdOiBmYWxzZSB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3Q2hpbGQgPSBuZXh0Q2hpbGQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgbmV3Q2hpbGRyZW4ucHVzaChuZXdDaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG5ld0NoaWxkcmVuID0gbWVyZ2VDaGlsZHJlbihjdXJyZW50Q2hpbGRyZW4sIG5ld0NoaWxkcmVuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3Q2hpbGRyZW4gPSBtZXJnZUNoaWxkcmVuKGN1cnJlbnRDaGlsZHJlbiwgbmV4dENoaWxkcmVuKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNoaWxkcmVuOiBuZXdDaGlsZHJlbixcbiAgICB9KTtcblxuICAgIG5leHRDaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNoaWxkICYmIGNoaWxkLmtleTtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgaWYgKGNoaWxkICYmIGN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNQcmV2ID0gY2hpbGQgJiYgZmluZENoaWxkSW5DaGlsZHJlbkJ5S2V5KGN1cnJlbnRDaGlsZHJlbiwga2V5KTtcbiAgICAgICAgaWYgKGhpZGRlblByb3ApIHtcbiAgICAgICAgICBjb25zdCBzaG93SW5OZXh0ID0gIWNoaWxkLnByb3BzW2hpZGRlblByb3BdO1xuICAgICAgICAgIGlmIChoYXNQcmV2KSB7XG4gICAgICAgICAgICBjb25zdCBzaG93SW5Ob3cgPSBmaW5kU2hvd25DaGlsZEluQ2hpbGRyZW5CeUtleShjdXJyZW50Q2hpbGRyZW4sIGtleSwgaGlkZGVuUHJvcCk7XG4gICAgICAgICAgICBpZiAoIXNob3dJbk5vdyAmJiBzaG93SW5OZXh0KSB7XG4gICAgICAgICAgICAgIHRoaXMua2V5c1RvRW50ZXIucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoc2hvd0luTmV4dCkge1xuICAgICAgICAgICAgdGhpcy5rZXlzVG9FbnRlci5wdXNoKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFoYXNQcmV2KSB7XG4gICAgICAgICAgdGhpcy5rZXlzVG9FbnRlci5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGN1cnJlbnRDaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNoaWxkICYmIGNoaWxkLmtleTtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgaWYgKGNoaWxkICYmIGN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNOZXh0ID0gY2hpbGQgJiYgZmluZENoaWxkSW5DaGlsZHJlbkJ5S2V5KG5leHRDaGlsZHJlbiwga2V5KTtcbiAgICAgICAgaWYgKGhpZGRlblByb3ApIHtcbiAgICAgICAgICBjb25zdCBzaG93SW5Ob3cgPSAhY2hpbGQucHJvcHNbaGlkZGVuUHJvcF07XG4gICAgICAgICAgaWYgKGhhc05leHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNob3dJbk5leHQgPSBmaW5kU2hvd25DaGlsZEluQ2hpbGRyZW5CeUtleShuZXh0Q2hpbGRyZW4sIGtleSwgaGlkZGVuUHJvcCk7XG4gICAgICAgICAgICBpZiAoIXNob3dJbk5leHQgJiYgc2hvd0luTm93KSB7XG4gICAgICAgICAgICAgIHRoaXMua2V5c1RvTGVhdmUucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoc2hvd0luTm93KSB7XG4gICAgICAgICAgICB0aGlzLmtleXNUb0xlYXZlLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWhhc05leHQpIHtcbiAgICAgICAgICB0aGlzLmtleXNUb0xlYXZlLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGNvbnN0IGtleXNUb0VudGVyID0gdGhpcy5rZXlzVG9FbnRlcjtcbiAgICB0aGlzLmtleXNUb0VudGVyID0gW107XG4gICAga2V5c1RvRW50ZXIuZm9yRWFjaCh0aGlzLnBlcmZvcm1FbnRlcik7XG4gICAgY29uc3Qga2V5c1RvTGVhdmUgPSB0aGlzLmtleXNUb0xlYXZlO1xuICAgIHRoaXMua2V5c1RvTGVhdmUgPSBbXTtcbiAgICBrZXlzVG9MZWF2ZS5mb3JFYWNoKHRoaXMucGVyZm9ybUxlYXZlKTtcbiAgfVxuXG4gIGlzVmFsaWRDaGlsZEJ5S2V5KGN1cnJlbnRDaGlsZHJlbiwga2V5KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBoaWRkZW5Qcm9wIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChoaWRkZW5Qcm9wKSB7XG4gICAgICByZXR1cm4gISFmaW5kU2hvd25DaGlsZEluQ2hpbGRyZW5CeUtleShjdXJyZW50Q2hpbGRyZW4sIGtleSwgaGlkZGVuUHJvcCk7XG4gICAgfVxuICAgIHJldHVybiAhIWZpbmRDaGlsZEluQ2hpbGRyZW5CeUtleShjdXJyZW50Q2hpbGRyZW4sIGtleSk7XG4gIH1cblxuICBzdG9wKGtleSkge1xuICAgIGRlbGV0ZSB0aGlzLmN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XTtcbiAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNoaWxkcmVuUmVmc1trZXldO1xuICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgIGNvbXBvbmVudC5zdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgcHJvcHMgfSA9IHRoaXM7XG4gICAgdGhpcy5uZXh0UHJvcHMgPSBwcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBhbmltYXRpb24sXG4gICAgICB0cmFuc2l0aW9uTmFtZSxcbiAgICAgIHRyYW5zaXRpb25FbnRlcixcbiAgICAgIHRyYW5zaXRpb25BcHBlYXIsXG4gICAgICB0cmFuc2l0aW9uTGVhdmUsXG4gICAgICBjb21wb25lbnQ6IENtcCxcbiAgICAgIGNvbXBvbmVudFByb3BzLFxuICAgICAgLi4ub3RoZXJQcm9wc1xuICAgIH0gPSBwcm9wcztcbiAgICBjb25zdCB7IGNoaWxkcmVuOiBzdGF0ZUNoaWxkcmVuIH0gPSB0aGlzLnN0YXRlO1xuICAgIGxldCBjaGlsZHJlbjogUmVhY3RFbGVtZW50PGFueT5bXSA9IFtdO1xuICAgIGlmIChzdGF0ZUNoaWxkcmVuKSB7XG4gICAgICBjaGlsZHJlbiA9IHN0YXRlQ2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAgICAgaWYgKGNoaWxkID09PSBudWxsIHx8IGNoaWxkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaGlsZC5rZXkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3Qgc2V0IGtleSBmb3IgYW5pbWF0ZSBjaGlsZHJlbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KFxuICAgICAgICAgIEFuaW1hdGVDaGlsZCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBrZXk6IGNoaWxkLmtleSxcbiAgICAgICAgICAgIHJlZjogbm9kZSA9PiB7XG4gICAgICAgICAgICAgIGlmIChjaGlsZC5rZXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuUmVmc1tjaGlsZC5rZXldID0gbm9kZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuaW1hdGlvbixcbiAgICAgICAgICAgIHRyYW5zaXRpb25OYW1lLFxuICAgICAgICAgICAgdHJhbnNpdGlvbkVudGVyLFxuICAgICAgICAgICAgdHJhbnNpdGlvbkFwcGVhcixcbiAgICAgICAgICAgIHRyYW5zaXRpb25MZWF2ZSxcbiAgICAgICAgICB9IGFzIEFuaW1hdGVDaGlsZFByb3BzLFxuICAgICAgICAgIGNoaWxkLFxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChDbXApIHtcbiAgICAgIGNvbnN0IHBhc3NlZFByb3BzID0gb21pdChvdGhlclByb3BzLCBbXG4gICAgICAgICdleGNsdXNpdmUnLFxuICAgICAgICAnb25FbmQnLFxuICAgICAgICAnb25FbnRlcicsXG4gICAgICAgICdvbkxlYXZlJyxcbiAgICAgICAgJ29uQXBwZWFyJyxcbiAgICAgICAgJ2hpZGRlblByb3AnLFxuICAgICAgXSk7XG4gICAgICByZXR1cm4gY3JlYXRlRWxlbWVudChcbiAgICAgICAgQ21wLFxuICAgICAgICB7XG4gICAgICAgICAgLi4ucGFzc2VkUHJvcHMsXG4gICAgICAgICAgLi4uY29tcG9uZW50UHJvcHMsXG4gICAgICAgIH0sXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuWzBdIHx8IG51bGw7XG4gIH1cblxuICBwZXJmb3JtRW50ZXIgPSAoa2V5OiBLZXkpID0+IHtcbiAgICBjb25zdCBjaGlsZFJlZiA9IHRoaXMuY2hpbGRyZW5SZWZzW2tleV07XG4gICAgaWYgKGNoaWxkUmVmKSB7XG4gICAgICB0aGlzLmN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XSA9IHRydWU7XG4gICAgICBjaGlsZFJlZi5jb21wb25lbnRXaWxsRW50ZXIodGhpcy5oYW5kbGVEb25lQWRkaW5nLmJpbmQodGhpcywga2V5LCAnZW50ZXInKSk7XG4gICAgfVxuICB9O1xuXG4gIHBlcmZvcm1BcHBlYXIgPSAoa2V5OiBLZXkpID0+IHtcbiAgICBjb25zdCBjaGlsZFJlZiA9IHRoaXMuY2hpbGRyZW5SZWZzW2tleV07XG4gICAgaWYgKGNoaWxkUmVmKSB7XG4gICAgICB0aGlzLmN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XSA9IHRydWU7XG4gICAgICBjaGlsZFJlZi5jb21wb25lbnRXaWxsQXBwZWFyKHRoaXMuaGFuZGxlRG9uZUFkZGluZy5iaW5kKHRoaXMsIGtleSwgJ2FwcGVhcicpKTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlRG9uZUFkZGluZyA9IChrZXk6IEtleSwgdHlwZSwgY2hpbGRSZWYpID0+IHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgZXhjbHVzaXZlLCBvbkFwcGVhciA9IG5vb3AsIG9uRW5kID0gbm9vcCwgb25FbnRlciA9IG5vb3AgfSA9IHByb3BzO1xuICAgIGRlbGV0ZSB0aGlzLmN1cnJlbnRseUFuaW1hdGluZ0tleXNba2V5XTtcbiAgICBpZiAoZXhjbHVzaXZlICYmIHByb3BzICE9PSB0aGlzLm5leHRQcm9wcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNWYWxpZENoaWxkQnlLZXkodG9BcnJheUNoaWxkcmVuKGdldENoaWxkcmVuRnJvbVByb3BzKHByb3BzKSksIGtleSkpIHtcbiAgICAgIHRoaXMucGVyZm9ybUxlYXZlKGtleSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXBwZWFyJykge1xuICAgICAgaWYgKGFuaW1VdGlsLmFsbG93QXBwZWFyQ2FsbGJhY2socHJvcHMpKSB7XG4gICAgICAgIG9uQXBwZWFyKGtleSwgY2hpbGRSZWYpO1xuICAgICAgICBvbkVuZChrZXksIHRydWUsIGNoaWxkUmVmKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFuaW1VdGlsLmFsbG93RW50ZXJDYWxsYmFjayhwcm9wcykpIHtcbiAgICAgIG9uRW50ZXIoa2V5LCBjaGlsZFJlZik7XG4gICAgICBvbkVuZChrZXksIHRydWUsIGNoaWxkUmVmKTtcbiAgICB9XG4gIH07XG5cbiAgcGVyZm9ybUxlYXZlID0gKGtleTogS2V5KSA9PiB7XG4gICAgY29uc3QgY2hpbGRSZWYgPSB0aGlzLmNoaWxkcmVuUmVmc1trZXldO1xuICAgIGlmIChjaGlsZFJlZikge1xuICAgICAgdGhpcy5jdXJyZW50bHlBbmltYXRpbmdLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgY2hpbGRSZWYuY29tcG9uZW50V2lsbExlYXZlKHRoaXMuaGFuZGxlRG9uZUxlYXZpbmcuYmluZCh0aGlzLCBrZXkpKTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlRG9uZUxlYXZpbmcgPSAoa2V5OiBLZXksIGNoaWxkUmVmKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHMsXG4gICAgICBzdGF0ZTogeyBjaGlsZHJlbiB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgZXhjbHVzaXZlLCBvbkVuZCA9IG5vb3AsIG9uTGVhdmUgPSBub29wLCBoaWRkZW5Qcm9wIH0gPSBwcm9wcztcbiAgICBkZWxldGUgdGhpcy5jdXJyZW50bHlBbmltYXRpbmdLZXlzW2tleV07XG4gICAgaWYgKGV4Y2x1c2l2ZSAmJiBwcm9wcyAhPT0gdGhpcy5uZXh0UHJvcHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudENoaWxkcmVuID0gdG9BcnJheUNoaWxkcmVuKGdldENoaWxkcmVuRnJvbVByb3BzKHByb3BzKSk7XG4gICAgaWYgKHRoaXMuaXNWYWxpZENoaWxkQnlLZXkoY3VycmVudENoaWxkcmVuLCBrZXkpKSB7XG4gICAgICB0aGlzLnBlcmZvcm1FbnRlcihrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbmQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChhbmltVXRpbC5hbGxvd0xlYXZlQ2FsbGJhY2socHJvcHMpKSB7XG4gICAgICAgICAgb25MZWF2ZShrZXksIGNoaWxkUmVmKTtcbiAgICAgICAgICBvbkVuZChrZXksIGZhbHNlLCBjaGlsZFJlZik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoIWlzU2FtZUNoaWxkcmVuKGNoaWxkcmVuLCBjdXJyZW50Q2hpbGRyZW4sIGhpZGRlblByb3ApKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2hpbGRyZW46IGN1cnJlbnRDaGlsZHJlbixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVuZCxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==