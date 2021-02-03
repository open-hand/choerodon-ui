import { __decorate } from "tslib";
import { Component, } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import defer from 'lodash/defer';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import isUndefined from 'lodash/isUndefined';
import classes from 'component-classes';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import autobind from '../_util/autobind';
import normalizeLanguage from '../_util/normalizeLanguage';
import localeContext from '../locale-context';
/* eslint-disable react/no-unused-prop-types */
export default class ViewComponent extends Component {
    constructor(props, context) {
        super(props, context);
        this.setObservableProps(props, context);
    }
    get prefixCls() {
        const { suffixCls, prefixCls } = this.props;
        return getProPrefixCls(suffixCls, prefixCls);
    }
    get lang() {
        const { lang } = this.props;
        if (lang) {
            return lang;
        }
        return localeContext.locale.lang;
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
    getObservableProps(_props, _context) {
        return {};
    }
    setObservableProps(props, context) {
        this.observableProps = this.getObservableProps(props, context);
    }
    updateObservableProps(props, context) {
        Object.assign(this.observableProps, omitBy(this.getObservableProps(props, context), isUndefined), true);
    }
    getOtherProps() {
        const { tabIndex, lang, style = {} } = this.props;
        let otherProps = omit(this.props, [
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
        }
        else {
            otherProps.onFocus = this.handleFocus;
            otherProps.onBlur = this.handleBlur;
        }
        otherProps.ref = this.elementReference;
        otherProps.disabled = this.isDisabled();
        otherProps.className = this.getClassName();
        if ('height' in style) {
            otherProps.style = { height: style.height };
        }
        otherProps.lang = normalizeLanguage(lang);
        return otherProps;
    }
    getClassName(...props) {
        const { prefixCls, props: { elementClassName }, } = this;
        return classNames(prefixCls, elementClassName, ...props);
    }
    getWrapperProps(props = {}) {
        const { style, hidden } = this.props;
        const wrapperProps = {
            ref: this.wrapperReference,
            className: this.getWrapperClassNames(),
            hidden,
            ...props,
        };
        if (style) {
            wrapperProps.style = omit(style, 'height');
        }
        return wrapperProps;
    }
    getWrapperClassNames(...args) {
        const { prefixCls, props: { className, size }, } = this;
        return classNames(`${prefixCls}-wrapper`, className, {
            [`${prefixCls}-sm`]: size === 'small',
            [`${prefixCls}-lg`]: size === 'large',
            [`${prefixCls}-disabled`]: this.isDisabled(),
            [`${prefixCls}-focused`]: this.isFocus,
        }, ...args);
    }
    isDisabled() {
        const { disabled } = this.props;
        return disabled;
    }
    handleFocus(e) {
        this.isFocused = true;
        this.isFocus = true;
        const { props: { onFocus = noop }, prefixCls, } = this;
        onFocus(e);
        const element = this.wrapper || findDOMNode(this);
        if (element) {
            classes(element).add(`${prefixCls}-focused`);
        }
    }
    handleBlur(e) {
        if (!e.isDefaultPrevented()) {
            const { props: { onBlur = noop }, prefixCls, } = this;
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
    elementReference(node) {
        this.element = node;
    }
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
}
ViewComponent.propTypes = {
    /**
     * 组件id
     */
    id: PropTypes.string,
    /**
     * 组件大小<未实现>
     * 可选值 `default` `small` `big`
     */
    size: PropTypes.oneOf(["small" /* small */, "default" /* default */, "large" /* large */]),
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
__decorate([
    observable
], ViewComponent.prototype, "isFocused", void 0);
__decorate([
    observable
], ViewComponent.prototype, "observableProps", void 0);
__decorate([
    action
], ViewComponent.prototype, "setObservableProps", null);
__decorate([
    action
], ViewComponent.prototype, "updateObservableProps", null);
__decorate([
    autobind,
    action
], ViewComponent.prototype, "handleFocus", null);
__decorate([
    autobind,
    action
], ViewComponent.prototype, "handleBlur", null);
__decorate([
    autobind
], ViewComponent.prototype, "elementReference", null);
__decorate([
    autobind,
    action
], ViewComponent.prototype, "wrapperReference", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2NvcmUvVmlld0NvbXBvbmVudC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxTQUFTLEdBTVYsTUFBTSxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDMUMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLE9BQU8sTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsT0FBTyxpQkFBaUIsTUFBTSw0QkFBNEIsQ0FBQztBQUUzRCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQWlKOUMsK0NBQStDO0FBQy9DLE1BQU0sQ0FBQyxPQUFPLE9BQU8sYUFBNEMsU0FBUSxTQUFpQjtJQTRJeEYsWUFBWSxLQUFLLEVBQUUsT0FBTztRQUN4QixLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQWhCRCxJQUFJLFNBQVM7UUFDWCxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFB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QUMsTUFBTTtJQUNwQjs7O09BR0c7SUFDSCxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxtRUFBc0MsQ0FBQztJQUM3RDs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUMzQjs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUMzQjs7T0FFRztJQUNILEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTTtJQUN2Qjs7T0FFRztJQUNILFFBQVEsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN4Qjs7T0FFRztJQUNILE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN0Qjs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN6Qjs7T0FFRztJQUNILEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTTtJQUN2Qjs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUMzQjs7T0FFRztJQUNILFFBQVEsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUMxQjs7T0FFRztJQUNILElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtJQUN0Qjs7T0FFRztJQUNILFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMxQjs7T0FFRztJQUNILE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN2Qjs7T0FFRztJQUNILE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN0Qjs7T0FFRztJQUNILE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN2Qjs7T0FFRztJQUNILGFBQWEsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUM3Qjs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN6Qjs7T0FFRztJQUNILFdBQVcsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMzQjs7T0FFRztJQUNILFdBQVcsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMzQjs7T0FFRztJQUNILFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSTtJQUM1Qjs7T0FFRztJQUNILFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSTtJQUM1Qjs7T0FFRztJQUNILFdBQVcsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMzQjs7T0FFRztJQUNILFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMxQjs7T0FFRztJQUNILGFBQWEsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUM3Qjs7T0FFRztJQUNILFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN6Qjs7T0FFRztJQUNILE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN2Qjs7T0FFRztJQUNILFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSTtDQUMzQixDQUFDO0FBUVU7SUFBWCxVQUFVO2dEQUFvQjtBQUVuQjtJQUFYLFVBQVU7c0RBQXNCO0FBb0NqQztJQURDLE1BQU07dURBR047QUFHRDtJQURDLE1BQU07MERBT047QUErRkQ7SUFGQyxRQUFRO0lBQ1IsTUFBTTtnREFhTjtBQUlEO0lBRkMsUUFBUTtJQUNSLE1BQU07K0NBaUJOO0FBZUQ7SUFEQyxRQUFRO3FEQUdSO0FBSUQ7SUFGQyxRQUFRO0lBQ1IsTUFBTTtxREFHTiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vY29yZS9WaWV3Q29tcG9uZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIENTU1Byb3BlcnRpZXMsXG4gIEZvY3VzRXZlbnRIYW5kbGVyLFxuICBLZXksXG4gIEtleWJvYXJkRXZlbnRIYW5kbGVyLFxuICBNb3VzZUV2ZW50SGFuZGxlcixcbn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZmluZERPTU5vZGUgfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgb21pdEJ5IGZyb20gJ2xvZGFzaC9vbWl0QnknO1xuaW1wb3J0IGRlZmVyIGZyb20gJ2xvZGFzaC9kZWZlcic7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlJztcbmltcG9ydCBub29wIGZyb20gJ2xvZGFzaC9ub29wJztcbmltcG9ydCBpc1VuZGVmaW5lZCBmcm9tICdsb2Rhc2gvaXNVbmRlZmluZWQnO1xuaW1wb3J0IGNsYXNzZXMgZnJvbSAnY29tcG9uZW50LWNsYXNzZXMnO1xuaW1wb3J0IHsgZ2V0UHJvUHJlZml4Q2xzIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jb25maWd1cmUnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCB7IFNpemUgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IG5vcm1hbGl6ZUxhbmd1YWdlIGZyb20gJy4uL191dGlsL25vcm1hbGl6ZUxhbmd1YWdlJztcbmltcG9ydCB7IExhbmcgfSBmcm9tICcuLi9sb2NhbGUtY29udGV4dC9lbnVtJztcbmltcG9ydCBsb2NhbGVDb250ZXh0IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcblxuLy9cbi8vIOe7hOS7tuWvueWkluW8gOaUvueahOS6i+S7tuWHveaVsOWQjeS7pSBvblhYWCDlkb3lkI0uIOWwvemHj+WHj+WwkeWvueWkluW8gOaUvueahOS6i+S7tu+8jOe7n+S4gOeUseaVsOaNruadpeWFs+iBlFxuLy8g57uE5Lu25a+55YaF5ZON5bqU55qE5LqL5Lu25Ye95pWw5ZCN5LulIGhhbmRsZVhYWCDlkb3lkI0uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0NvbXBvbmVudFByb3BzXG4gIGV4dGVuZHMgTW91c2VFdmVudENvbXBvbmVudFByb3BzLFxuICAgIEtleWJvYXJkRXZlbnRDb21wb25lbnRQcm9wcyxcbiAgICBFbGVtZW50UHJvcHMge1xuICAvKipcbiAgICog57uE5Lu2aWRcbiAgICovXG4gIGlkPzogc3RyaW5nO1xuICAvKipcbiAgICogIOaYr+WQpuemgeeUqFxuICAgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICog6ZSu55uYVGFi6ZSu54Sm54K55bqP5Y+377yM6K6+5Li6LTHml7bkuI3kvJrojrflvpfnhKbngrnvvIzorr7kuLow5pe25Li66IqC54K55qCR55qE6aG65bqP44CCXG4gICAqL1xuICB0YWJJbmRleD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOaCrOa1ruaPkOekuu+8jOW7uuiurueUqFRvb2xUaXDnu4Tku7ZcbiAgICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKipcbiAgICog6Ieq5Yqo6I635Y+W54Sm54K577yM5aSa5Liq57uE5Lu25ZCM5pe26K6+572u6K+l5Y+C5pWw5pe277yM5Lul6IqC54K55qCR55qE6aG65bqP5pyA5pyr55qE57uE5Lu26I635Y+W54Sm54K5XG4gICAqL1xuICBhdXRvRm9jdXM/OiBib29sZWFuO1xuICAvKipcbiAgICog57uE5Lu25aSn5bCPPOacquWunueOsD5cbiAgICog5Y+v6YCJ5YC8IGBkZWZhdWx0YCBgc21hbGxgIGBsYXJnZWBcbiAgICovXG4gIHNpemU/OiBTaXplO1xuICAvKipcbiAgICog6I635Y+W54Sm54K55Zue6LCDXG4gICAqL1xuICBvbkZvY3VzPzogRm9jdXNFdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOWkseWOu+eEpueCueWbnuiwg1xuICAgKi9cbiAgb25CbHVyPzogRm9jdXNFdmVudEhhbmRsZXI8YW55Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50UHJvcHMge1xuICAvKipcbiAgICog57uE5Lu2a2V5XG4gICAqL1xuICBrZXk/OiBLZXk7XG4gIC8qKlxuICAgKiDmoLflvI/lkI7nvIBcbiAgICovXG4gIHN1ZmZpeENscz86IHN0cmluZztcbiAgLyoqXG4gICAqIOagt+W8j+WJjee8gFxuICAgKi9cbiAgcHJlZml4Q2xzPzogc3RyaW5nO1xuICAvKipcbiAgICog5aSW5bGC6Ieq5a6a5LmJ5qC35byP5ZCNXG4gICAqL1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlrp7pmYXlhYPntKDoh6rlrprkuYnmoLflvI/lkI1cbiAgICovXG4gIGVsZW1lbnRDbGFzc05hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlhoXpk77moLflvI9cbiAgICovXG4gIHN0eWxlPzogQ1NTUHJvcGVydGllcztcbiAgLyoqXG4gICAqIOaYr+WQpumakOiXj1xuICAgKi9cbiAgaGlkZGVuPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOivreiogFxuICAgKi9cbiAgbGFuZz86IExhbmc7XG4gIC8qKlxuICAgKiDmi7zlhpnmoKHpqoxcbiAgICovXG4gIHNwZWxsQ2hlY2s/OiBib29sZWFuO1xufVxuXG4vKiog5ZON5bqU6byg5qCH5LqL5Lu257uE5Lu2ICovXG5leHBvcnQgaW50ZXJmYWNlIE1vdXNlRXZlbnRDb21wb25lbnRQcm9wcyB7XG4gIC8qKlxuICAgKiDljZXlh7vlm57osINcbiAgICovXG4gIG9uQ2xpY2s/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog5Y+M5Ye75Zue6LCDXG4gICAqL1xuICBvbkRvdWJsZUNsaWNrPzogTW91c2VFdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOWPs+eCueWHu+Wbnuiwg1xuICAgKi9cbiAgb25Db250ZXh0TWVudT86IE1vdXNlRXZlbnRIYW5kbGVyPGFueT47XG4gIC8qKlxuICAgKiDpvKDmoIfmiqzotbflm57osINcbiAgICovXG4gIG9uTW91c2VVcD86IE1vdXNlRXZlbnRIYW5kbGVyPGFueT47XG4gIC8qKlxuICAgKiDpvKDmoIfngrnkuIvlm57osINcbiAgICovXG4gIG9uTW91c2VEb3duPzogTW91c2VFdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOm8oOagh+enu+WKqOWbnuiwg1xuICAgKi9cbiAgb25Nb3VzZU1vdmU/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog6byg5qCH6L+b5YWl5Zue6LCDXG4gICAqL1xuICBvbk1vdXNlRW50ZXI/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog6byg5qCH56a75byA5Zue6LCDXG4gICAqL1xuICBvbk1vdXNlTGVhdmU/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog6byg5qCH6L+b5YWl5Zue6LCD77yM5LiOb25Nb3VzZUVudGVy5Yy65Yir5Zyo5LqO6byg5qCH6L+b5YWl5a2Q6IqC54K55pe25Lya6Kem5Y+Rb25Nb3VzZU91dFxuICAgKi9cbiAgb25Nb3VzZU92ZXI/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog6byg5qCH56a75byA5Zue6LCD77yM5LiOb25Nb3VzZUxlYXZl5Yy65Yir5Zyo5LqO5a2Q6IqC54K555qEb25Nb3VzZW91dOS8muWGkuazoeinpuWPkeacrOWbnuiwg1xuICAgKi9cbiAgb25Nb3VzZU91dD86IE1vdXNlRXZlbnRIYW5kbGVyPGFueT47XG59XG5cbi8qKiDlk43lupTplK7nm5jkuovku7bnu4Tku7YgKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5Ym9hcmRFdmVudENvbXBvbmVudFByb3BzIHtcbiAgLyoqXG4gICAqIOmUruebmOaMieS4i+aXtueahOWbnuiwg1xuICAgKi9cbiAgb25LZXlEb3duPzogS2V5Ym9hcmRFdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOmUruebmOaKrOi1t+aXtueahOWbnuiwg1xuICAgKi9cbiAgb25LZXlVcD86IEtleWJvYXJkRXZlbnRIYW5kbGVyPGFueT47XG4gIC8qKlxuICAgKiDplK7nm5jmlbLlh7vlkI7nmoTlm57osINcbiAgICovXG4gIG9uS2V5UHJlc3M/OiBLZXlib2FyZEV2ZW50SGFuZGxlcjxhbnk+O1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9uby11bnVzZWQtcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld0NvbXBvbmVudDxQIGV4dGVuZHMgVmlld0NvbXBvbmVudFByb3BzPiBleHRlbmRzIENvbXBvbmVudDxQLCBhbnk+IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiDnu4Tku7ZpZFxuICAgICAqL1xuICAgIGlkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOe7hOS7tuWkp+WwjzzmnKrlrp7njrA+XG4gICAgICog5Y+v6YCJ5YC8IGBkZWZhdWx0YCBgc21hbGxgIGBiaWdgXG4gICAgICovXG4gICAgc2l6ZTogUHJvcFR5cGVzLm9uZU9mKFtTaXplLnNtYWxsLCBTaXplLmRlZmF1bHQsIFNpemUubGFyZ2VdKSxcbiAgICAvKipcbiAgICAgKiDmoLflvI/lkI7nvIBcbiAgICAgKi9cbiAgICBzdWZmaXhDbHM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICog5qC35byP5YmN57yAXG4gICAgICovXG4gICAgcHJlZml4Q2xzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOaCrOa1ruaPkOekuu+8jOW7uuiurueUqFRvb2xUaXDnu4Tku7ZcbiAgICAgKi9cbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiAg5piv5ZCm56aB55SoXG4gICAgICovXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOaYr+WQpumakOiXj1xuICAgICAqL1xuICAgIGhpZGRlbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog6Ieq5Yqo6I635Y+W54Sm54K577yM5aSa5Liq57uE5Lu25ZCM5pe26K6+572u6K+l5Y+C5pWw5pe277yM5Lul6IqC54K55qCR55qE6aG65bqP5pyA5pyr55qE57uE5Lu26I635Y+W54Sm54K5XG4gICAgICovXG4gICAgYXV0b0ZvY3VzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDlhoXpk77moLflvI9cbiAgICAgKi9cbiAgICBzdHlsZTogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAvKipcbiAgICAgKiDoh6rlrprkuYnmoLflvI/lkI1cbiAgICAgKi9cbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICog6ZSu55uYVGFi6ZSu54Sm54K55bqP5Y+377yM6K6+5Li6LTHml7bkuI3kvJrojrflvpfnhKbngrnvvIzorr7kuLow5pe25Li66IqC54K55qCR55qE6aG65bqP44CCXG4gICAgICovXG4gICAgdGFiSW5kZXg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICog6K+t6KiAXG4gICAgICovXG4gICAgbGFuZzogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiDmi7zlhpnmoKHpqoxcbiAgICAgKi9cbiAgICBzcGVsbENoZWNrOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDojrflj5bnhKbngrnlm57osINcbiAgICAgKi9cbiAgICBvbkZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDlpLHljrvnhKbngrnlm57osINcbiAgICAgKi9cbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOWNleWHu+Wbnuiwg1xuICAgICAqL1xuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOWPjOWHu+Wbnuiwg1xuICAgICAqL1xuICAgIG9uRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOm8oOagh+aKrOi1t+Wbnuiwg1xuICAgICAqL1xuICAgIG9uTW91c2VVcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog6byg5qCH54K55LiL5Zue6LCDXG4gICAgICovXG4gICAgb25Nb3VzZURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOm8oOagh+enu+WKqOWbnuiwg1xuICAgICAqL1xuICAgIG9uTW91c2VNb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDpvKDmoIfov5vlhaXlm57osINcbiAgICAgKi9cbiAgICBvbk1vdXNlRW50ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOm8oOagh+emu+W8gOWbnuiwg1xuICAgICAqL1xuICAgIG9uTW91c2VMZWF2ZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog6byg5qCH6L+b5YWl5Zue6LCD77yM5LiOb25Nb3VzZUVudGVy5Yy65Yir5Zyo5LqO6byg5qCH6L+b5YWl5a2Q6IqC54K55pe25Lya6Kem5Y+Rb25Nb3VzZU91dFxuICAgICAqL1xuICAgIG9uTW91c2VPdmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDpvKDmoIfnprvlvIDlm57osIPvvIzkuI5vbk1vdXNlTGVhdmXljLrliKvlnKjkuo7lrZDoioLngrnnmoRvbk1vdXNlb3V05Lya5YaS5rOh6Kem5Y+R5pys5Zue6LCDXG4gICAgICovXG4gICAgb25Nb3VzZU91dDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog6byg5qCH5Y+z5Ye75ZCO55qE5Zue6LCDXG4gICAgICovXG4gICAgb25Db250ZXh0TWVudTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog6ZSu55uY5oyJ5LiL5pe255qE5Zue6LCDXG4gICAgICovXG4gICAgb25LZXlEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDplK7nm5jmiqzotbfml7bnmoTlm57osINcbiAgICAgKi9cbiAgICBvbktleVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDplK7nm5jmlbLlh7vlkI7nmoTlm57osINcbiAgICAgKi9cbiAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgfTtcblxuICBlbGVtZW50OiBhbnk7XG5cbiAgd3JhcHBlcjogYW55O1xuXG4gIGlzRm9jdXM6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgaXNGb2N1c2VkOiBib29sZWFuO1xuXG4gIEBvYnNlcnZhYmxlIG9ic2VydmFibGVQcm9wczogYW55O1xuXG4gIGdldCBwcmVmaXhDbHMoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHN1ZmZpeENscywgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBnZXRQcm9QcmVmaXhDbHMoc3VmZml4Q2xzISwgcHJlZml4Q2xzKTtcbiAgfVxuXG4gIGdldCBsYW5nKCk6IExhbmcge1xuICAgIGNvbnN0IHsgbGFuZyB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAobGFuZykge1xuICAgICAgcmV0dXJuIGxhbmchO1xuICAgIH1cbiAgICByZXR1cm4gbG9jYWxlQ29udGV4dC5sb2NhbGUubGFuZztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgIHRoaXMuc2V0T2JzZXJ2YWJsZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgfVxuXG4gIGdldE1lcmdlZENsYXNzTmFtZXMoLi4ucHJvcHMpIHtcbiAgICByZXR1cm4gY2xhc3NOYW1lcyh0aGlzLmdldENsYXNzTmFtZSgpLCB0aGlzLmdldFdyYXBwZXJDbGFzc05hbWVzKCksIC4uLnByb3BzKTtcbiAgfVxuXG4gIGdldE1lcmdlZFByb3BzKHByb3BzID0ge30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ubWVyZ2UodGhpcy5nZXRXcmFwcGVyUHJvcHMocHJvcHMpLCB0aGlzLmdldE90aGVyUHJvcHMoKSksXG4gICAgICBjbGFzc05hbWU6IHRoaXMuZ2V0TWVyZ2VkQ2xhc3NOYW1lcygpLFxuICAgIH07XG4gIH1cblxuICBnZXRPYnNlcnZhYmxlUHJvcHMoX3Byb3BzLCBfY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRPYnNlcnZhYmxlUHJvcHMocHJvcHMsIGNvbnRleHQ6IGFueSkge1xuICAgIHRoaXMub2JzZXJ2YWJsZVByb3BzID0gdGhpcy5nZXRPYnNlcnZhYmxlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICB9XG5cbiAgQGFjdGlvblxuICB1cGRhdGVPYnNlcnZhYmxlUHJvcHMocHJvcHMsIGNvbnRleHQ6IGFueSkge1xuICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICB0aGlzLm9ic2VydmFibGVQcm9wcyxcbiAgICAgIG9taXRCeSh0aGlzLmdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCksIGlzVW5kZWZpbmVkKSxcbiAgICAgIHRydWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldE90aGVyUHJvcHMoKSB7XG4gICAgY29uc3QgeyB0YWJJbmRleCwgbGFuZywgc3R5bGUgPSB7fSB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgb3RoZXJQcm9wczogYW55ID0gb21pdCh0aGlzLnByb3BzLCBbXG4gICAgICAncHJlZml4Q2xzJyxcbiAgICAgICdzdWZmaXhDbHMnLFxuICAgICAgJ2NsYXNzTmFtZScsXG4gICAgICAnZWxlbWVudENsYXNzTmFtZScsXG4gICAgICAnc3R5bGUnLFxuICAgICAgJ3NpemUnLFxuICAgICAgJ2F1dG9Gb2N1cycsXG4gICAgICAnb25Gb2N1cycsXG4gICAgICAnb25CbHVyJyxcbiAgICAgICdjaGlsZHJlbicsXG4gICAgICAnZGF0YVNldCcsXG4gICAgXSk7XG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICBvdGhlclByb3BzID0gb21pdChvdGhlclByb3BzLCBbXG4gICAgICAgICdvbkNsaWNrJyxcbiAgICAgICAgJ29uTW91c2VVcCcsXG4gICAgICAgICdvbk1vdXNlRG93bicsXG4gICAgICAgICdvbk1vdXNlRW50ZXInLFxuICAgICAgICAnb25Nb3VzZUxlYXZlJyxcbiAgICAgICAgJ29uTW91c2VPdmVyJyxcbiAgICAgICAgJ29uTW91c2VPdXQnLFxuICAgICAgICAnb25LZXlEb3duJyxcbiAgICAgICAgJ29uS2V5VXAnLFxuICAgICAgICAnb25LZXlQcmVzcycsXG4gICAgICAgICdvbkNvbnRleHRNZW51JyxcbiAgICAgIF0pO1xuICAgICAgaWYgKHRhYkluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3RoZXJQcm9wcy50YWJJbmRleCA9IC0xO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvdGhlclByb3BzLm9uRm9jdXMgPSB0aGlzLmhhbmRsZUZvY3VzO1xuICAgICAgb3RoZXJQcm9wcy5vbkJsdXIgPSB0aGlzLmhhbmRsZUJsdXI7XG4gICAgfVxuICAgIG90aGVyUHJvcHMucmVmID0gdGhpcy5lbGVtZW50UmVmZXJlbmNlO1xuICAgIG90aGVyUHJvcHMuZGlzYWJsZWQgPSB0aGlzLmlzRGlzYWJsZWQoKTtcbiAgICBvdGhlclByb3BzLmNsYXNzTmFtZSA9IHRoaXMuZ2V0Q2xhc3NOYW1lKCk7XG4gICAgaWYgKCdoZWlnaHQnIGluIHN0eWxlKSB7XG4gICAgICBvdGhlclByb3BzLnN0eWxlID0geyBoZWlnaHQ6IHN0eWxlLmhlaWdodCB9O1xuICAgIH1cbiAgICBvdGhlclByb3BzLmxhbmcgPSBub3JtYWxpemVMYW5ndWFnZShsYW5nKTtcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGdldENsYXNzTmFtZSguLi5wcm9wcyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHsgZWxlbWVudENsYXNzTmFtZSB9LFxuICAgIH0gPSB0aGlzO1xuICAgIHJldHVybiBjbGFzc05hbWVzKHByZWZpeENscywgZWxlbWVudENsYXNzTmFtZSwgLi4ucHJvcHMpO1xuICB9XG5cbiAgZ2V0V3JhcHBlclByb3BzKHByb3BzID0ge30pOiBhbnkge1xuICAgIGNvbnN0IHsgc3R5bGUsIGhpZGRlbiB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB3cmFwcGVyUHJvcHM6IGFueSA9IHtcbiAgICAgIHJlZjogdGhpcy53cmFwcGVyUmVmZXJlbmNlLFxuICAgICAgY2xhc3NOYW1lOiB0aGlzLmdldFdyYXBwZXJDbGFzc05hbWVzKCksXG4gICAgICBoaWRkZW4sXG4gICAgICAuLi5wcm9wcyxcbiAgICB9O1xuICAgIGlmIChzdHlsZSkge1xuICAgICAgd3JhcHBlclByb3BzLnN0eWxlID0gb21pdChzdHlsZSwgJ2hlaWdodCcpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcHBlclByb3BzO1xuICB9XG5cbiAgZ2V0V3JhcHBlckNsYXNzTmFtZXMoLi4uYXJncyk6IHN0cmluZyB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHsgY2xhc3NOYW1lLCBzaXplIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGNsYXNzTmFtZXMoXG4gICAgICBgJHtwcmVmaXhDbHN9LXdyYXBwZXJgLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS1zbWBdOiBzaXplID09PSAnc21hbGwnLFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1sZ2BdOiBzaXplID09PSAnbGFyZ2UnLFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1kaXNhYmxlZGBdOiB0aGlzLmlzRGlzYWJsZWQoKSxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tZm9jdXNlZGBdOiB0aGlzLmlzRm9jdXMsXG4gICAgICB9LFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICB9XG5cbiAgaXNEaXNhYmxlZCgpIHtcbiAgICBjb25zdCB7IGRpc2FibGVkIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBkaXNhYmxlZDtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBAYWN0aW9uXG4gIGhhbmRsZUZvY3VzKGUpIHtcbiAgICB0aGlzLmlzRm9jdXNlZCA9IHRydWU7XG4gICAgdGhpcy5pc0ZvY3VzID0gdHJ1ZTtcbiAgICBjb25zdCB7XG4gICAgICBwcm9wczogeyBvbkZvY3VzID0gbm9vcCB9LFxuICAgICAgcHJlZml4Q2xzLFxuICAgIH0gPSB0aGlzO1xuICAgIG9uRm9jdXMoZSk7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMud3JhcHBlciB8fCBmaW5kRE9NTm9kZSh0aGlzKTtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgY2xhc3NlcyhlbGVtZW50KS5hZGQoYCR7cHJlZml4Q2xzfS1mb2N1c2VkYCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgaGFuZGxlQmx1cihlKSB7XG4gICAgaWYgKCFlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHByb3BzOiB7IG9uQmx1ciA9IG5vb3AgfSxcbiAgICAgICAgcHJlZml4Q2xzLFxuICAgICAgfSA9IHRoaXM7XG4gICAgICBvbkJsdXIoZSk7XG4gICAgICBpZiAoIWUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0ZvY3VzID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLndyYXBwZXIgfHwgZmluZERPTU5vZGUodGhpcyk7XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgY2xhc3NlcyhlbGVtZW50KS5yZW1vdmUoYCR7cHJlZml4Q2xzfS1mb2N1c2VkYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb2N1cygpIHtcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICBibHVyKCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5ibHVyKCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGVsZW1lbnRSZWZlcmVuY2Uobm9kZSkge1xuICAgIHRoaXMuZWxlbWVudCA9IG5vZGU7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgQGFjdGlvblxuICB3cmFwcGVyUmVmZXJlbmNlKG5vZGUpIHtcbiAgICB0aGlzLndyYXBwZXIgPSBub2RlO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMsIG5leHRDb250ZXh0KSB7XG4gICAgdGhpcy51cGRhdGVPYnNlcnZhYmxlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgY29uc3QgeyB0YWJJbmRleCwgYXV0b0ZvY3VzIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghdGhpcy5pc0Rpc2FibGVkKCkgJiYgYXV0b0ZvY3VzICYmICh0YWJJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHRhYkluZGV4ID4gLTEpKSB7XG4gICAgICBkZWZlcigoKSA9PiB0aGlzLmZvY3VzKCkpO1xuICAgIH1cbiAgfVxufVxuIl0sInZlcnNpb24iOjN9