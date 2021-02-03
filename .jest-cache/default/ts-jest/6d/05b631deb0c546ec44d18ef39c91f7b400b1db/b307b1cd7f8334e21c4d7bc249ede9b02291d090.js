import { __decorate } from "tslib";
import React, { Children } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import { computed, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import FormContext from '../form/FormContext';
import Progress from '../progress';
import Ripple from '../ripple';
import DataSetComponent from '../data-set/DataSetComponent';
import autobind from '../_util/autobind';
let Button = class Button extends DataSetComponent {
    constructor(props, context) {
        super(props, context);
        this.handleClickWait = this.getHandleClick(props);
    }
    get loading() {
        const { type, dataSet, loading } = this.observableProps;
        return (loading ||
            (type === "submit" /* submit */ && !!dataSet && dataSet.status === "submitting" /* submitting */));
    }
    set loading(loading) {
        runInAction(() => {
            this.observableProps.loading = loading;
        });
    }
    getObservableProps(props, context) {
        let loading = false;
        if ('loading' in props) {
            loading = props.loading;
        }
        return {
            dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
            loading,
            type: props.type,
        };
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let loading = this.loading;
        if ('loading' in nextProps) {
            loading = nextProps.loading;
        }
        super.componentWillReceiveProps({
            ...nextProps,
            loading,
        }, nextContext);
        const { wait, waitType } = this.props;
        if (wait !== nextProps.wait || waitType !== nextProps.waitType) {
            this.handleClickWait = this.getHandleClick(nextProps);
        }
    }
    componentWillUnmount() {
        this.handleClickWait.cancel();
    }
    getHandleClick(props) {
        const { wait, waitType } = props;
        if (wait && waitType) {
            const options = { leading: true, trailing: true };
            if (waitType === "throttle" /* throttle */) {
                options.trailing = false;
                options.maxWait = wait;
            }
            else if (waitType === "debounce" /* debounce */) {
                options.leading = false;
            }
            return debounce(this.handleClick, wait, options);
        }
        return debounce(this.handleClick, 0);
    }
    handleClickIfBubble(e) {
        const { wait, waitType } = this.props;
        if (wait && waitType) {
            e.stopPropagation();
            this.handleClickWait(e);
        }
        else {
            this.handleClick(e);
        }
    }
    async handleClick(e) {
        const { onClick } = this.props;
        if (onClick) {
            const afterClick = onClick(e);
            if (afterClick && afterClick instanceof Promise) {
                try {
                    this.loading = true;
                    await afterClick;
                }
                finally {
                    this.loading = false;
                }
            }
        }
    }
    isDisabled() {
        const { disabled } = this.context;
        return disabled || super.isDisabled() || this.loading;
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'icon',
            'funcType',
            'color',
            'loading',
            'wait',
            'waitType',
        ]);
        if (!this.isDisabled()) {
            otherProps.onClick = this.handleClickIfBubble;
        }
        return otherProps;
    }
    getClassName(...props) {
        const { prefixCls, props: { color = getConfig('buttonColor'), funcType = getConfig('buttonFuncType'), children, icon, }, } = this;
        const childrenCount = Children.count(children);
        return super.getClassName({
            [`${prefixCls}-${funcType}`]: funcType,
            [`${prefixCls}-${color}`]: color,
            [`${prefixCls}-icon-only`]: icon
                ? childrenCount === 0 || children === false
                : childrenCount === 1 && children.type === Icon,
        }, ...props);
    }
    render() {
        const { children, icon, href } = this.props;
        const buttonIcon = this.loading ? (React.createElement(Progress, { key: "loading", type: "loading" /* loading */, size: "small" /* small */ })) : (icon && React.createElement(Icon, { type: icon }));
        const hasString = Children.toArray(children).some(child => isString(child));
        const Cmp = href ? 'a' : 'button';
        const props = this.getMergedProps();
        return (React.createElement(Ripple, { disabled: this.isDisabled() },
            React.createElement(Cmp, Object.assign({}, (href ? omit(props, ['type']) : props)),
                buttonIcon,
                hasString ? React.createElement("span", null, children) : children)));
    }
};
Button.displayName = 'Button';
// eslint-disable-next-line camelcase
Button.__Pro_BUTTON = true;
Button.contextType = FormContext;
Button.propTypes = {
    /**
     * 按钮展现模式
     * 可选值：'flat' | 'raised'
     * @default raised
     */
    funcType: PropTypes.oneOf(["flat" /* flat */, "raised" /* raised */]),
    /**
     * 按钮颜色风格
     * 可选值：'default' | 'primary' | 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'dark'
     * @default 'default'
     */
    color: PropTypes.oneOf([
        "default" /* default */,
        "primary" /* primary */,
        "gray" /* gray */,
        "blue" /* blue */,
        "red" /* red */,
        "green" /* green */,
        "yellow" /* yellow */,
        "purple" /* purple */,
        "dark" /* dark */,
    ]),
    /**
     * 按钮类型
     * 可选值：'button' | 'submit' | 'reset'
     * @default 'button'
     */
    type: PropTypes.oneOf(["button" /* button */, "submit" /* submit */, "reset" /* reset */]),
    /**
     * 按钮是否是加载状态
     */
    loading: PropTypes.bool,
    /**
     * 点击跳转的地址，指定此属性 button 的行为和 a 链接一致
     */
    href: PropTypes.string,
    /**
     * 相当于 a 链接的 target 属性，href 存在时生效
     */
    target: PropTypes.string,
    /**
     * 点击等待时间
     */
    wait: PropTypes.number,
    /**
     * 点击间隔类型，可选值：throttle | debounce
     * @default throttle
     */
    waitType: PropTypes.oneOf(["throttle" /* throttle */, "debounce" /* debounce */]),
    ...DataSetComponent.propTypes,
};
Button.defaultProps = {
    suffixCls: 'btn',
    type: "button" /* button */,
    waitType: "throttle" /* throttle */,
};
__decorate([
    computed
], Button.prototype, "loading", null);
__decorate([
    autobind
], Button.prototype, "handleClickIfBubble", null);
__decorate([
    autobind
], Button.prototype, "handleClick", null);
Button = __decorate([
    observer
], Button);
export default Button;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2J1dHRvbi9CdXR0b24udHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN4QyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFFbkMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLFdBQVcsTUFBTSxxQkFBcUIsQ0FBQztBQUM5QyxPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUM7QUFDbkMsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBSS9CLE9BQU8sZ0JBQTJDLE1BQU0sOEJBQThCLENBQUM7QUFDdkYsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUE4Q3pDLElBQXFCLE1BQU0sR0FBM0IsTUFBcUIsTUFBTyxTQUFRLGdCQUE2QjtJQW9GL0QsWUFBWSxLQUFLLEVBQUUsT0FBTztRQUN4QixLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBbkJELElBQUksT0FBTztRQUNULE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDeEQsT0FBTyxDQUNMLE9BQU87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QkFBeUI7Q0FDbEMsQ0FBQztBQUdGO0lBREMsUUFBUTtxQ0FPUjtBQThERDtJQURDLFFBQVE7aURBU1I7QUFHRDtJQURDLFFBQVE7eUNBY1I7QUFoS2tCLE1BQU07SUFEMUIsUUFBUTtHQUNZLE1BQU0sQ0FnTzFCO2VBaE9vQixNQUFNIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9idXR0b24vQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ2hpbGRyZW4gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ2FuY2VsYWJsZSwgRGVib3VuY2VTZXR0aW5ncyB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IHsgY29tcHV0ZWQsIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgUHJvZ3Jlc3NUeXBlIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9wcm9ncmVzcy9lbnVtJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuaW1wb3J0IEZvcm1Db250ZXh0IGZyb20gJy4uL2Zvcm0vRm9ybUNvbnRleHQnO1xuaW1wb3J0IFByb2dyZXNzIGZyb20gJy4uL3Byb2dyZXNzJztcbmltcG9ydCBSaXBwbGUgZnJvbSAnLi4vcmlwcGxlJztcbmltcG9ydCB7IEJ1dHRvbkNvbG9yLCBCdXR0b25UeXBlLCBCdXR0b25XYWl0VHlwZSwgRnVuY1R5cGUgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHsgRGF0YVNldFN0YXR1cyB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IHsgU2l6ZSB9IGZyb20gJy4uL2NvcmUvZW51bSc7XG5pbXBvcnQgRGF0YVNldENvbXBvbmVudCwgeyBEYXRhU2V0Q29tcG9uZW50UHJvcHMgfSBmcm9tICcuLi9kYXRhLXNldC9EYXRhU2V0Q29tcG9uZW50JztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uUHJvcHMgZXh0ZW5kcyBEYXRhU2V0Q29tcG9uZW50UHJvcHMge1xuICAvKipcbiAgICog5oyJ6ZKu5bGV546w5b2i5byPXG4gICAqIEBkZWZhdWx0ICdyYWlzZWQnXG4gICAqL1xuICBmdW5jVHlwZT86IEZ1bmNUeXBlO1xuICAvKipcbiAgICog5oyJ6ZKu6aKc6Imy6aOO5qC8XG4gICAqIEBkZWZhdWx0ICdkZWZhdWx0J1xuICAgKi9cbiAgY29sb3I/OiBCdXR0b25Db2xvcjtcbiAgLyoqXG4gICAqIOaMiemSruexu+Wei1xuICAgKiBAZGVmYXVsdCAnYnV0dG9uJ1xuICAgKi9cbiAgdHlwZT86IEJ1dHRvblR5cGU7XG4gIC8qKlxuICAgKiDmjInpkq7mmK/lkKbmmK/liqDovb3nirbmgIFcbiAgICovXG4gIGxvYWRpbmc/OiBib29sZWFuO1xuICAvKipcbiAgICog5oyJ6ZKu5Zu+5qCHXG4gICAqL1xuICBpY29uPzogc3RyaW5nO1xuICAvKipcbiAgICog54K55Ye76Lez6L2s55qE5Zyw5Z2A77yM5oyH5a6a5q2k5bGe5oCnIGJ1dHRvbiDnmoTooYzkuLrlkowgYSDpk77mjqXkuIDoh7RcbiAgICovXG4gIGhyZWY/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDnm7jlvZPkuo4gYSDpk77mjqXnmoQgdGFyZ2V0IOWxnuaAp++8jGhyZWYg5a2Y5Zyo5pe255Sf5pWIXG4gICAqL1xuICB0YXJnZXQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDngrnlh7vpl7TpmpTml7bpl7RcbiAgICovXG4gIHdhaXQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDngrnlh7vpl7TpmpTnsbvlnovvvIzlj6/pgInlgLzvvJp0aHJvdHRsZSB8IGRlYm91bmNlXG4gICAqIEBkZWZhdWx0IHRocm90dGxlXG4gICAqL1xuICB3YWl0VHlwZT86IEJ1dHRvbldhaXRUeXBlO1xufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1dHRvbiBleHRlbmRzIERhdGFTZXRDb21wb25lbnQ8QnV0dG9uUHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ0J1dHRvbic7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICBzdGF0aWMgX19Qcm9fQlVUVE9OID0gdHJ1ZTtcblxuICBzdGF0aWMgY29udGV4dFR5cGUgPSBGb3JtQ29udGV4dDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8qKlxuICAgICAqIOaMiemSruWxleeOsOaooeW8j1xuICAgICAqIOWPr+mAieWAvO+8midmbGF0JyB8ICdyYWlzZWQnXG4gICAgICogQGRlZmF1bHQgcmFpc2VkXG4gICAgICovXG4gICAgZnVuY1R5cGU6IFByb3BUeXBlcy5vbmVPZihbRnVuY1R5cGUuZmxhdCwgRnVuY1R5cGUucmFpc2VkXSksXG4gICAgLyoqXG4gICAgICog5oyJ6ZKu6aKc6Imy6aOO5qC8XG4gICAgICog5Y+v6YCJ5YC877yaJ2RlZmF1bHQnIHwgJ3ByaW1hcnknIHwgJ2dyYXknIHwgJ2JsdWUnIHwgJ3JlZCcgfCAnZ3JlZW4nIHwgJ3llbGxvdycgfCAncHVycGxlJyB8ICdkYXJrJ1xuICAgICAqIEBkZWZhdWx0ICdkZWZhdWx0J1xuICAgICAqL1xuICAgIGNvbG9yOiBQcm9wVHlwZXMub25lT2YoW1xuICAgICAgQnV0dG9uQ29sb3IuZGVmYXVsdCxcbiAgICAgIEJ1dHRvbkNvbG9yLnByaW1hcnksXG4gICAgICBCdXR0b25Db2xvci5ncmF5LFxuICAgICAgQnV0dG9uQ29sb3IuYmx1ZSxcbiAgICAgIEJ1dHRvbkNvbG9yLnJlZCxcbiAgICAgIEJ1dHRvbkNvbG9yLmdyZWVuLFxuICAgICAgQnV0dG9uQ29sb3IueWVsbG93LFxuICAgICAgQnV0dG9uQ29sb3IucHVycGxlLFxuICAgICAgQnV0dG9uQ29sb3IuZGFyayxcbiAgICBdKSxcbiAgICAvKipcbiAgICAgKiDmjInpkq7nsbvlnotcbiAgICAgKiDlj6/pgInlgLzvvJonYnV0dG9uJyB8ICdzdWJtaXQnIHwgJ3Jlc2V0J1xuICAgICAqIEBkZWZhdWx0ICdidXR0b24nXG4gICAgICovXG4gICAgdHlwZTogUHJvcFR5cGVzLm9uZU9mKFtCdXR0b25UeXBlLmJ1dHRvbiwgQnV0dG9uVHlwZS5zdWJtaXQsIEJ1dHRvblR5cGUucmVzZXRdKSxcbiAgICAvKipcbiAgICAgKiDmjInpkq7mmK/lkKbmmK/liqDovb3nirbmgIFcbiAgICAgKi9cbiAgICBsb2FkaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDngrnlh7vot7PovaznmoTlnLDlnYDvvIzmjIflrprmraTlsZ7mgKcgYnV0dG9uIOeahOihjOS4uuWSjCBhIOmTvuaOpeS4gOiHtFxuICAgICAqL1xuICAgIGhyZWY6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICog55u45b2T5LqOIGEg6ZO+5o6l55qEIHRhcmdldCDlsZ7mgKfvvIxocmVmIOWtmOWcqOaXtueUn+aViFxuICAgICAqL1xuICAgIHRhcmdldDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiDngrnlh7vnrYnlvoXml7bpl7RcbiAgICAgKi9cbiAgICB3YWl0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIOeCueWHu+mXtOmalOexu+Wei++8jOWPr+mAieWAvO+8mnRocm90dGxlIHwgZGVib3VuY2VcbiAgICAgKiBAZGVmYXVsdCB0aHJvdHRsZVxuICAgICAqL1xuICAgIHdhaXRUeXBlOiBQcm9wVHlwZXMub25lT2YoW0J1dHRvbldhaXRUeXBlLnRocm90dGxlLCBCdXR0b25XYWl0VHlwZS5kZWJvdW5jZV0pLFxuICAgIC4uLkRhdGFTZXRDb21wb25lbnQucHJvcFR5cGVzLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgc3VmZml4Q2xzOiAnYnRuJyxcbiAgICB0eXBlOiBCdXR0b25UeXBlLmJ1dHRvbixcbiAgICB3YWl0VHlwZTogQnV0dG9uV2FpdFR5cGUudGhyb3R0bGUsXG4gIH07XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsb2FkaW5nKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdHlwZSwgZGF0YVNldCwgbG9hZGluZyB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIGxvYWRpbmcgfHxcbiAgICAgICh0eXBlID09PSBCdXR0b25UeXBlLnN1Ym1pdCAmJiAhIWRhdGFTZXQgJiYgZGF0YVNldC5zdGF0dXMgPT09IERhdGFTZXRTdGF0dXMuc3VibWl0dGluZylcbiAgICApO1xuICB9XG5cbiAgc2V0IGxvYWRpbmcobG9hZGluZzogYm9vbGVhbikge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMub2JzZXJ2YWJsZVByb3BzLmxvYWRpbmcgPSBsb2FkaW5nO1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlQ2xpY2tXYWl0OiBGdW5jdGlvbiAmIENhbmNlbGFibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgdGhpcy5oYW5kbGVDbGlja1dhaXQgPSB0aGlzLmdldEhhbmRsZUNsaWNrKHByb3BzKTtcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCkge1xuICAgIGxldCBsb2FkaW5nID0gZmFsc2U7XG4gICAgaWYgKCdsb2FkaW5nJyBpbiBwcm9wcykge1xuICAgICAgbG9hZGluZyA9IHByb3BzLmxvYWRpbmc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkYXRhU2V0OiAnZGF0YVNldCcgaW4gcHJvcHMgPyBwcm9wcy5kYXRhU2V0IDogY29udGV4dC5kYXRhU2V0LFxuICAgICAgbG9hZGluZyxcbiAgICAgIHR5cGU6IHByb3BzLnR5cGUsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCkge1xuICAgIGxldCBsb2FkaW5nID0gdGhpcy5sb2FkaW5nO1xuICAgIGlmICgnbG9hZGluZycgaW4gbmV4dFByb3BzKSB7XG4gICAgICBsb2FkaW5nID0gbmV4dFByb3BzLmxvYWRpbmc7XG4gICAgfVxuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoe1xuICAgICAgLi4ubmV4dFByb3BzLFxuICAgICAgbG9hZGluZyxcbiAgICB9LCBuZXh0Q29udGV4dCk7XG4gICAgY29uc3QgeyB3YWl0LCB3YWl0VHlwZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAod2FpdCAhPT0gbmV4dFByb3BzLndhaXQgfHwgd2FpdFR5cGUgIT09IG5leHRQcm9wcy53YWl0VHlwZSkge1xuICAgICAgdGhpcy5oYW5kbGVDbGlja1dhaXQgPSB0aGlzLmdldEhhbmRsZUNsaWNrKG5leHRQcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5oYW5kbGVDbGlja1dhaXQuY2FuY2VsKCk7XG4gIH1cblxuICBnZXRIYW5kbGVDbGljayhwcm9wcyk6IEZ1bmN0aW9uICYgQ2FuY2VsYWJsZSB7XG4gICAgY29uc3QgeyB3YWl0LCB3YWl0VHlwZSB9ID0gcHJvcHM7XG4gICAgaWYgKHdhaXQgJiYgd2FpdFR5cGUpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnM6IERlYm91bmNlU2V0dGluZ3MgPSB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH07XG4gICAgICBpZiAod2FpdFR5cGUgPT09IEJ1dHRvbldhaXRUeXBlLnRocm90dGxlKSB7XG4gICAgICAgIG9wdGlvbnMudHJhaWxpbmcgPSBmYWxzZTtcbiAgICAgICAgb3B0aW9ucy5tYXhXYWl0ID0gd2FpdDtcbiAgICAgIH0gZWxzZSBpZiAod2FpdFR5cGUgPT09IEJ1dHRvbldhaXRUeXBlLmRlYm91bmNlKSB7XG4gICAgICAgIG9wdGlvbnMubGVhZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlYm91bmNlKHRoaXMuaGFuZGxlQ2xpY2ssIHdhaXQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gZGVib3VuY2UodGhpcy5oYW5kbGVDbGljaywgMCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ2xpY2tJZkJ1YmJsZShlKSB7XG4gICAgY29uc3QgeyB3YWl0LCB3YWl0VHlwZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAod2FpdCAmJiB3YWl0VHlwZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMuaGFuZGxlQ2xpY2tXYWl0KGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZUNsaWNrKGUpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBhc3luYyBoYW5kbGVDbGljayhlKSB7XG4gICAgY29uc3QgeyBvbkNsaWNrIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICBjb25zdCBhZnRlckNsaWNrOiBhbnkgPSBvbkNsaWNrKGUpO1xuICAgICAgaWYgKGFmdGVyQ2xpY2sgJiYgYWZ0ZXJDbGljayBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgIGF3YWl0IGFmdGVyQ2xpY2s7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc0Rpc2FibGVkKCkge1xuICAgIGNvbnN0IHsgZGlzYWJsZWQgfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgc3VwZXIuaXNEaXNhYmxlZCgpIHx8IHRoaXMubG9hZGluZztcbiAgfVxuXG4gIGdldE90aGVyUHJvcHMoKSB7XG4gICAgY29uc3Qgb3RoZXJQcm9wcyA9IG9taXQoc3VwZXIuZ2V0T3RoZXJQcm9wcygpLCBbXG4gICAgICAnaWNvbicsXG4gICAgICAnZnVuY1R5cGUnLFxuICAgICAgJ2NvbG9yJyxcbiAgICAgICdsb2FkaW5nJyxcbiAgICAgICd3YWl0JyxcbiAgICAgICd3YWl0VHlwZScsXG4gICAgXSk7XG4gICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQoKSkge1xuICAgICAgb3RoZXJQcm9wcy5vbkNsaWNrID0gdGhpcy5oYW5kbGVDbGlja0lmQnViYmxlO1xuICAgIH1cbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGdldENsYXNzTmFtZSguLi5wcm9wcyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgY29sb3IgPSBnZXRDb25maWcoJ2J1dHRvbkNvbG9yJyksXG4gICAgICAgIGZ1bmNUeXBlID0gZ2V0Q29uZmlnKCdidXR0b25GdW5jVHlwZScpLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgaWNvbixcbiAgICAgIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgY2hpbGRyZW5Db3VudCA9IENoaWxkcmVuLmNvdW50KGNoaWxkcmVuKTtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q2xhc3NOYW1lKFxuICAgICAge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS0ke2Z1bmNUeXBlfWBdOiBmdW5jVHlwZSxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tJHtjb2xvcn1gXTogY29sb3IsXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWljb24tb25seWBdOiBpY29uXG4gICAgICAgICAgPyBjaGlsZHJlbkNvdW50ID09PSAwIHx8IGNoaWxkcmVuID09PSBmYWxzZVxuICAgICAgICAgIDogY2hpbGRyZW5Db3VudCA9PT0gMSAmJiAoY2hpbGRyZW4gYXMgYW55KS50eXBlID09PSBJY29uLFxuICAgICAgfSxcbiAgICAgIC4uLnByb3BzLFxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBjaGlsZHJlbiwgaWNvbiwgaHJlZiB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBidXR0b25JY29uOiBhbnkgPSB0aGlzLmxvYWRpbmcgPyAoXG4gICAgICA8UHJvZ3Jlc3Mga2V5PVwibG9hZGluZ1wiIHR5cGU9e1Byb2dyZXNzVHlwZS5sb2FkaW5nfSBzaXplPXtTaXplLnNtYWxsfSAvPlxuICAgICkgOiAoXG4gICAgICAgIGljb24gJiYgPEljb24gdHlwZT17aWNvbn0gLz5cbiAgICAgICk7XG4gICAgY29uc3QgaGFzU3RyaW5nID0gQ2hpbGRyZW4udG9BcnJheShjaGlsZHJlbikuc29tZShjaGlsZCA9PiBpc1N0cmluZyhjaGlsZCkpO1xuICAgIGNvbnN0IENtcCA9IGhyZWYgPyAnYScgOiAnYnV0dG9uJztcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMuZ2V0TWVyZ2VkUHJvcHMoKTtcbiAgICByZXR1cm4gKFxuICAgICAgPFJpcHBsZSBkaXNhYmxlZD17dGhpcy5pc0Rpc2FibGVkKCl9PlxuICAgICAgICA8Q21wIHsuLi4oaHJlZiA/IG9taXQocHJvcHMsIFsndHlwZSddKSA6IHByb3BzKX0+XG4gICAgICAgICAge2J1dHRvbkljb259XG4gICAgICAgICAge2hhc1N0cmluZyA/IDxzcGFuPntjaGlsZHJlbn08L3NwYW4+IDogY2hpbGRyZW59XG4gICAgICAgIDwvQ21wPlxuICAgICAgPC9SaXBwbGU+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9