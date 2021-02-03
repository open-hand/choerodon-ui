import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import warning from '../_util/warning';
import SubMenu from './SubMenu';
import Item from './MenuItem';
import RcMenu, { Divider, ItemGroup } from '../rc-components/menu';
import { getPrefixCls } from '../configure';
export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.inlineOpenKeys = [];
        this.handleClick = (e) => {
            this.handleOpenChange([]);
            const { onClick } = this.props;
            if (onClick) {
                onClick(e);
            }
        };
        this.handleOpenChange = (openKeys) => {
            this.setOpenKeys(openKeys);
            const { onOpenChange } = this.props;
            if (onOpenChange) {
                onOpenChange(openKeys);
            }
        };
        warning(!('onOpen' in props || 'onClose' in props), '`onOpen` and `onClose` are removed, please use `onOpenChange` instead');
        warning(!('inlineCollapsed' in props && props.mode !== 'inline'), "`inlineCollapsed` should only be used when Menu's `mode` is inline.");
        let openKeys;
        if ('defaultOpenKeys' in props) {
            openKeys = props.defaultOpenKeys;
        }
        else if ('openKeys' in props) {
            openKeys = props.openKeys;
        }
        this.state = {
            openKeys: openKeys || [],
        };
    }
    getChildContext() {
        const { theme } = this.props;
        return {
            inlineCollapsed: this.getInlineCollapsed(),
            menuTheme: theme,
        };
    }
    getPrefixCls() {
        const { prefixCls } = this.props;
        return getPrefixCls('menu', prefixCls);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        const { mode, inlineCollapsed } = this.props;
        if (mode === 'inline' && nextProps.mode !== 'inline') {
            this.switchModeFromInline = true;
        }
        if ('openKeys' in nextProps) {
            this.setState({ openKeys: nextProps.openKeys });
            return;
        }
        const { openKeys } = this.state;
        const { siderCollapsed } = this.context;
        if ((nextProps.inlineCollapsed && !inlineCollapsed) ||
            (nextContext.siderCollapsed && !siderCollapsed)) {
            this.switchModeFromInline =
                !!openKeys.length &&
                    !!findDOMNode(this).querySelectorAll(`.${this.getPrefixCls()}-submenu-open`).length;
            this.inlineOpenKeys = openKeys;
            this.setState({ openKeys: [] });
        }
        if ((!nextProps.inlineCollapsed && inlineCollapsed) ||
            (!nextContext.siderCollapsed && siderCollapsed)) {
            this.setState({ openKeys: this.inlineOpenKeys });
            this.inlineOpenKeys = [];
        }
    }
    setOpenKeys(openKeys) {
        if (!('openKeys' in this.props)) {
            this.setState({ openKeys });
        }
    }
    getRealMenuMode() {
        const inlineCollapsed = this.getInlineCollapsed();
        if (this.switchModeFromInline && inlineCollapsed) {
            return 'inline';
        }
        const { mode } = this.props;
        return inlineCollapsed ? 'vertical' : mode;
    }
    getInlineCollapsed() {
        const { inlineCollapsed } = this.props;
        const { siderCollapsed = inlineCollapsed } = this.context;
        return siderCollapsed;
    }
    getMenuOpenAnimation(menuMode) {
        const { openAnimation, openTransitionName } = this.props;
        let menuOpenAnimation = openAnimation || openTransitionName;
        if (openAnimation === undefined && openTransitionName === undefined) {
            switch (menuMode) {
                case 'horizontal':
                    menuOpenAnimation = 'slide-up';
                    break;
                case 'vertical':
                case 'vertical-left':
                case 'vertical-right':
                    // When mode switch from inline
                    // submenu should hide without animation
                    if (this.switchModeFromInline) {
                        menuOpenAnimation = '';
                        this.switchModeFromInline = false;
                    }
                    else {
                        menuOpenAnimation = 'zoom-big';
                    }
                    break;
                case 'inline':
                    menuOpenAnimation = {
                        ...animation,
                        leave: (node, done) => animation.leave(node, () => {
                            // Make sure inline menu leave animation finished before mode is switched
                            this.switchModeFromInline = false;
                            this.setState({});
                            // when inlineCollapsed change false to true, all submenu will be unmounted,
                            // so that we don't need handle animation leaving.
                            if (this.getRealMenuMode() === 'vertical') {
                                return;
                            }
                            done();
                        }),
                    };
                    break;
                default:
            }
        }
        return menuOpenAnimation;
    }
    render() {
        const { className, theme } = this.props;
        const { openKeys } = this.state;
        const prefixCls = this.getPrefixCls();
        const menuMode = this.getRealMenuMode();
        const menuOpenAnimation = this.getMenuOpenAnimation(menuMode);
        const menuClassName = classNames(className, `${prefixCls}-${theme}`, {
            [`${prefixCls}-inline-collapsed`]: this.getInlineCollapsed(),
        });
        const menuProps = {
            openKeys,
            onOpenChange: this.handleOpenChange,
            className: menuClassName,
            mode: menuMode,
        };
        if (menuMode !== 'inline') {
            // closing vertical popup submenu after click it
            menuProps.onClick = this.handleClick;
            menuProps.openTransitionName = menuOpenAnimation;
        }
        else {
            menuProps.openAnimation = menuOpenAnimation;
        }
        const { collapsedWidth } = this.context;
        if (this.getInlineCollapsed() &&
            (collapsedWidth === 0 || collapsedWidth === '0' || collapsedWidth === '0px')) {
            return null;
        }
        return React.createElement(RcMenu, Object.assign({}, this.props, menuProps, { prefixCls: prefixCls }));
    }
}
Menu.displayName = 'Menu';
Menu.Divider = Divider;
Menu.Item = Item;
Menu.SubMenu = SubMenu;
Menu.ItemGroup = ItemGroup;
Menu.defaultProps = {
    className: '',
    theme: 'light',
    focusable: false,
};
Menu.childContextTypes = {
    inlineCollapsed: PropTypes.bool,
    menuTheme: PropTypes.string,
};
Menu.contextTypes = {
    siderCollapsed: PropTypes.bool,
    collapsedWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvbWVudS9pbmRleC50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQWlCLE1BQU0sT0FBTyxDQUFDO0FBQ3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLE9BQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUN2QyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFDaEMsT0FBTyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBRTlCLE9BQU8sTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFrRDVDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sSUFBSyxTQUFRLFNBQStCO0lBaUMvRCxZQUFZLEtBQWdCO1FBQzFCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUhmLG1CQUFjLEdBQWEsRUFBRSxDQUFDO1FBd0U5QixnQkFBVyxHQUFHLENBQUMsQ0FBYSxFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTFCLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9CLElBQUksT0FBTyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNaO1FBQ0gsQ0FBQyxDQUFDO1FBRUYscUJBQWdCLEdBQUcsQ0FBQyxRQUFrQixFQUFFLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUzQixNQUFNLEVBQUUsWUFBWSxF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T0FBTztJQUNkLFNBQVMsRUFBRSxLQUFLO0NBQ2pCLENBQUM7QUFFSyxzQkFBaUIsR0FBRztJQUN6QixlQUFlLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDL0IsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0NBQzVCLENBQUM7QUFFSyxpQkFBWSxHQUFHO0lBQ3BCLGNBQWMsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUM5QixjQUFjLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzFFLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvbWVudS9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCwgQ1NTUHJvcGVydGllcyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZpbmRET01Ob2RlIH0gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBhbmltYXRpb24gZnJvbSAnLi4vX3V0aWwvb3BlbkFuaW1hdGlvbic7XG5pbXBvcnQgd2FybmluZyBmcm9tICcuLi9fdXRpbC93YXJuaW5nJztcbmltcG9ydCBTdWJNZW51IGZyb20gJy4vU3ViTWVudSc7XG5pbXBvcnQgSXRlbSBmcm9tICcuL01lbnVJdGVtJztcbmltcG9ydCB7IFNpZGVyQ29udGV4dCB9IGZyb20gJy4uL2xheW91dC9TaWRlcic7XG5pbXBvcnQgUmNNZW51LCB7IERpdmlkZXIsIEl0ZW1Hcm91cCB9IGZyb20gJy4uL3JjLWNvbXBvbmVudHMvbWVudSc7XG5pbXBvcnQgeyBnZXRQcmVmaXhDbHMgfSBmcm9tICcuLi9jb25maWd1cmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdFBhcmFtIHtcbiAga2V5OiBzdHJpbmc7XG4gIGtleVBhdGg6IEFycmF5PHN0cmluZz47XG4gIGl0ZW06IGFueTtcbiAgZG9tRXZlbnQ6IGFueTtcbiAgc2VsZWN0ZWRLZXlzOiBBcnJheTxzdHJpbmc+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENsaWNrUGFyYW0ge1xuICBrZXk6IHN0cmluZztcbiAga2V5UGF0aDogQXJyYXk8c3RyaW5nPjtcbiAgaXRlbTogYW55O1xuICBkb21FdmVudDogYW55O1xufVxuXG5leHBvcnQgdHlwZSBNZW51TW9kZSA9ICd2ZXJ0aWNhbCcgfCAndmVydGljYWwtbGVmdCcgfCAndmVydGljYWwtcmlnaHQnIHwgJ2hvcml6b250YWwnIHwgJ2lubGluZSc7XG5cbmV4cG9ydCB0eXBlIE1lbnVUaGVtZSA9ICdsaWdodCcgfCAnZGFyayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVudVByb3BzIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHRoZW1lPzogTWVudVRoZW1lO1xuICBtb2RlPzogTWVudU1vZGU7XG4gIHNlbGVjdGFibGU/OiBib29sZWFuO1xuICBzZWxlY3RlZEtleXM/OiBBcnJheTxzdHJpbmc+O1xuICBkZWZhdWx0U2VsZWN0ZWRLZXlzPzogQXJyYXk8c3RyaW5nPjtcbiAgb3BlbktleXM/OiBBcnJheTxzdHJpbmc+O1xuICBkZWZhdWx0T3BlbktleXM/OiBBcnJheTxzdHJpbmc+O1xuICBvbk9wZW5DaGFuZ2U/OiAob3BlbktleXM6IHN0cmluZ1tdKSA9PiB2b2lkO1xuICBvblNlbGVjdD86IChwYXJhbTogU2VsZWN0UGFyYW0pID0+IHZvaWQ7XG4gIG9uRGVzZWxlY3Q/OiAocGFyYW06IFNlbGVjdFBhcmFtKSA9PiB2b2lkO1xuICBvbkNsaWNrPzogKHBhcmFtOiBDbGlja1BhcmFtKSA9PiB2b2lkO1xuICBzdHlsZT86IENTU1Byb3BlcnRpZXM7XG4gIG9wZW5BbmltYXRpb24/OiBzdHJpbmcgfCBPYmplY3Q7XG4gIG9wZW5UcmFuc2l0aW9uTmFtZT86IHN0cmluZyB8IE9iamVjdDtcbiAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICBwcmVmaXhDbHM/OiBzdHJpbmc7XG4gIG11bHRpcGxlPzogYm9vbGVhbjtcbiAgaW5saW5lSW5kZW50PzogbnVtYmVyO1xuICBpbmxpbmVDb2xsYXBzZWQ/OiBib29sZWFuO1xuICBzdWJNZW51Q2xvc2VEZWxheT86IG51bWJlcjtcbiAgc3ViTWVudU9wZW5EZWxheT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZW51U3RhdGUge1xuICBvcGVuS2V5czogc3RyaW5nW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbnUgZXh0ZW5kcyBDb21wb25lbnQ8TWVudVByb3BzLCBNZW51U3RhdGU+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ01lbnUnO1xuXG4gIHN0YXRpYyBEaXZpZGVyID0gRGl2aWRlcjtcblxuICBzdGF0aWMgSXRlbSA9IEl0ZW07XG5cbiAgc3RhdGljIFN1Yk1lbnUgPSBTdWJNZW51O1xuXG4gIHN0YXRpYyBJdGVtR3JvdXAgPSBJdGVtR3JvdXA7XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIHRoZW1lOiAnbGlnaHQnLCAvLyBvciBkYXJrXG4gICAgZm9jdXNhYmxlOiBmYWxzZSxcbiAgfTtcblxuICBzdGF0aWMgY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gICAgaW5saW5lQ29sbGFwc2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBtZW51VGhlbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGNvbnRleHRUeXBlcyA9IHtcbiAgICBzaWRlckNvbGxhcHNlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgY29sbGFwc2VkV2lkdGg6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5udW1iZXIsIFByb3BUeXBlcy5zdHJpbmddKSxcbiAgfTtcblxuICBzd2l0Y2hNb2RlRnJvbUlubGluZTogYm9vbGVhbjtcblxuICBsZWF2ZUFuaW1hdGlvbkV4ZWN1dGVkV2hlbklubGluZUNvbGxhcHNlZDogYm9vbGVhbjtcblxuICBpbmxpbmVPcGVuS2V5czogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogTWVudVByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgd2FybmluZyhcbiAgICAgICEoJ29uT3BlbicgaW4gcHJvcHMgfHwgJ29uQ2xvc2UnIGluIHByb3BzKSxcbiAgICAgICdgb25PcGVuYCBhbmQgYG9uQ2xvc2VgIGFyZSByZW1vdmVkLCBwbGVhc2UgdXNlIGBvbk9wZW5DaGFuZ2VgIGluc3RlYWQnLFxuICAgICk7XG5cbiAgICB3YXJuaW5nKFxuICAgICAgISgnaW5saW5lQ29sbGFwc2VkJyBpbiBwcm9wcyAmJiBwcm9wcy5tb2RlICE9PSAnaW5saW5lJyksXG4gICAgICBcImBpbmxpbmVDb2xsYXBzZWRgIHNob3VsZCBvbmx5IGJlIHVzZWQgd2hlbiBNZW51J3MgYG1vZGVgIGlzIGlubGluZS5cIixcbiAgICApO1xuXG4gICAgbGV0IG9wZW5LZXlzO1xuICAgIGlmICgnZGVmYXVsdE9wZW5LZXlzJyBpbiBwcm9wcykge1xuICAgICAgb3BlbktleXMgPSBwcm9wcy5kZWZhdWx0T3BlbktleXM7XG4gICAgfSBlbHNlIGlmICgnb3BlbktleXMnIGluIHByb3BzKSB7XG4gICAgICBvcGVuS2V5cyA9IHByb3BzLm9wZW5LZXlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvcGVuS2V5czogb3BlbktleXMgfHwgW10sXG4gICAgfTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICBjb25zdCB7IHRoZW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB7XG4gICAgICBpbmxpbmVDb2xsYXBzZWQ6IHRoaXMuZ2V0SW5saW5lQ29sbGFwc2VkKCksXG4gICAgICBtZW51VGhlbWU6IHRoZW1lLFxuICAgIH07XG4gIH1cblxuICBnZXRQcmVmaXhDbHMoKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGdldFByZWZpeENscygnbWVudScsIHByZWZpeENscyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogTWVudVByb3BzLCBuZXh0Q29udGV4dDogU2lkZXJDb250ZXh0KSB7XG4gICAgY29uc3QgeyBtb2RlLCBpbmxpbmVDb2xsYXBzZWQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG1vZGUgPT09ICdpbmxpbmUnICYmIG5leHRQcm9wcy5tb2RlICE9PSAnaW5saW5lJykge1xuICAgICAgdGhpcy5zd2l0Y2hNb2RlRnJvbUlubGluZSA9IHRydWU7XG4gICAgfVxuICAgIGlmICgnb3BlbktleXMnIGluIG5leHRQcm9wcykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG9wZW5LZXlzOiBuZXh0UHJvcHMub3BlbktleXMhIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7IG9wZW5LZXlzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgc2lkZXJDb2xsYXBzZWQgfSA9IHRoaXMuY29udGV4dDtcbiAgICBpZiAoXG4gICAgICAobmV4dFByb3BzLmlubGluZUNvbGxhcHNlZCAmJiAhaW5saW5lQ29sbGFwc2VkKSB8fFxuICAgICAgKG5leHRDb250ZXh0LnNpZGVyQ29sbGFwc2VkICYmICFzaWRlckNvbGxhcHNlZClcbiAgICApIHtcbiAgICAgIHRoaXMuc3dpdGNoTW9kZUZyb21JbmxpbmUgPVxuICAgICAgICAhIW9wZW5LZXlzLmxlbmd0aCAmJlxuICAgICAgICAhIShmaW5kRE9NTm9kZSh0aGlzKSBhcyBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICBgLiR7dGhpcy5nZXRQcmVmaXhDbHMoKX0tc3VibWVudS1vcGVuYCxcbiAgICAgICAgKS5sZW5ndGg7XG4gICAgICB0aGlzLmlubGluZU9wZW5LZXlzID0gb3BlbktleXM7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgb3BlbktleXM6IFtdIH0pO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAoIW5leHRQcm9wcy5pbmxpbmVDb2xsYXBzZWQgJiYgaW5saW5lQ29sbGFwc2VkKSB8fFxuICAgICAgKCFuZXh0Q29udGV4dC5zaWRlckNvbGxhcHNlZCAmJiBzaWRlckNvbGxhcHNlZClcbiAgICApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBvcGVuS2V5czogdGhpcy5pbmxpbmVPcGVuS2V5cyB9KTtcbiAgICAgIHRoaXMuaW5saW5lT3BlbktleXMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDbGljayA9IChlOiBDbGlja1BhcmFtKSA9PiB7XG4gICAgdGhpcy5oYW5kbGVPcGVuQ2hhbmdlKFtdKTtcblxuICAgIGNvbnN0IHsgb25DbGljayB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAob25DbGljaykge1xuICAgICAgb25DbGljayhlKTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlT3BlbkNoYW5nZSA9IChvcGVuS2V5czogc3RyaW5nW10pID0+IHtcbiAgICB0aGlzLnNldE9wZW5LZXlzKG9wZW5LZXlzKTtcblxuICAgIGNvbnN0IHsgb25PcGVuQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbk9wZW5DaGFuZ2UpIHtcbiAgICAgIG9uT3BlbkNoYW5nZShvcGVuS2V5cyk7XG4gICAgfVxuICB9O1xuXG4gIHNldE9wZW5LZXlzKG9wZW5LZXlzOiBzdHJpbmdbXSkge1xuICAgIGlmICghKCdvcGVuS2V5cycgaW4gdGhpcy5wcm9wcykpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBvcGVuS2V5cyB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRSZWFsTWVudU1vZGUoKSB7XG4gICAgY29uc3QgaW5saW5lQ29sbGFwc2VkID0gdGhpcy5nZXRJbmxpbmVDb2xsYXBzZWQoKTtcbiAgICBpZiAodGhpcy5zd2l0Y2hNb2RlRnJvbUlubGluZSAmJiBpbmxpbmVDb2xsYXBzZWQpIHtcbiAgICAgIHJldHVybiAnaW5saW5lJztcbiAgICB9XG4gICAgY29uc3QgeyBtb2RlIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBpbmxpbmVDb2xsYXBzZWQgPyAndmVydGljYWwnIDogbW9kZTtcbiAgfVxuXG4gIGdldElubGluZUNvbGxhcHNlZCgpIHtcbiAgICBjb25zdCB7IGlubGluZUNvbGxhcHNlZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHNpZGVyQ29sbGFwc2VkID0gaW5saW5lQ29sbGFwc2VkIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgcmV0dXJuIHNpZGVyQ29sbGFwc2VkO1xuICB9XG5cbiAgZ2V0TWVudU9wZW5BbmltYXRpb24obWVudU1vZGU6IE1lbnVNb2RlKSB7XG4gICAgY29uc3QgeyBvcGVuQW5pbWF0aW9uLCBvcGVuVHJhbnNpdGlvbk5hbWUgfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IG1lbnVPcGVuQW5pbWF0aW9uID0gb3BlbkFuaW1hdGlvbiB8fCBvcGVuVHJhbnNpdGlvbk5hbWU7XG4gICAgaWYgKG9wZW5BbmltYXRpb24gPT09IHVuZGVmaW5lZCAmJiBvcGVuVHJhbnNpdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc3dpdGNoIChtZW51TW9kZSkge1xuICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICBtZW51T3BlbkFuaW1hdGlvbiA9ICdzbGlkZS11cCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgY2FzZSAndmVydGljYWwtbGVmdCc6XG4gICAgICAgIGNhc2UgJ3ZlcnRpY2FsLXJpZ2h0JzpcbiAgICAgICAgICAvLyBXaGVuIG1vZGUgc3dpdGNoIGZyb20gaW5saW5lXG4gICAgICAgICAgLy8gc3VibWVudSBzaG91bGQgaGlkZSB3aXRob3V0IGFuaW1hdGlvblxuICAgICAgICAgIGlmICh0aGlzLnN3aXRjaE1vZGVGcm9tSW5saW5lKSB7XG4gICAgICAgICAgICBtZW51T3BlbkFuaW1hdGlvbiA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hNb2RlRnJvbUlubGluZSA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW51T3BlbkFuaW1hdGlvbiA9ICd6b29tLWJpZyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbmxpbmUnOlxuICAgICAgICAgIG1lbnVPcGVuQW5pbWF0aW9uID0ge1xuICAgICAgICAgICAgLi4uYW5pbWF0aW9uLFxuICAgICAgICAgICAgbGVhdmU6IChub2RlOiBIVE1MRWxlbWVudCwgZG9uZTogKCkgPT4gdm9pZCkgPT5cbiAgICAgICAgICAgICAgYW5pbWF0aW9uLmxlYXZlKG5vZGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgaW5saW5lIG1lbnUgbGVhdmUgYW5pbWF0aW9uIGZpbmlzaGVkIGJlZm9yZSBtb2RlIGlzIHN3aXRjaGVkXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hNb2RlRnJvbUlubGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe30pO1xuICAgICAgICAgICAgICAgIC8vIHdoZW4gaW5saW5lQ29sbGFwc2VkIGNoYW5nZSBmYWxzZSB0byB0cnVlLCBhbGwgc3VibWVudSB3aWxsIGJlIHVubW91bnRlZCxcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGRvbid0IG5lZWQgaGFuZGxlIGFuaW1hdGlvbiBsZWF2aW5nLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFJlYWxNZW51TW9kZSgpID09PSAndmVydGljYWwnKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lbnVPcGVuQW5pbWF0aW9uO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgY2xhc3NOYW1lLCB0aGVtZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IG9wZW5LZXlzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHByZWZpeENscyA9IHRoaXMuZ2V0UHJlZml4Q2xzKCk7XG4gICAgY29uc3QgbWVudU1vZGUgPSB0aGlzLmdldFJlYWxNZW51TW9kZSgpO1xuICAgIGNvbnN0IG1lbnVPcGVuQW5pbWF0aW9uID0gdGhpcy5nZXRNZW51T3BlbkFuaW1hdGlvbihtZW51TW9kZSEpO1xuXG4gICAgY29uc3QgbWVudUNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoY2xhc3NOYW1lLCBgJHtwcmVmaXhDbHN9LSR7dGhlbWV9YCwge1xuICAgICAgW2Ake3ByZWZpeENsc30taW5saW5lLWNvbGxhcHNlZGBdOiB0aGlzLmdldElubGluZUNvbGxhcHNlZCgpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWVudVByb3BzOiBNZW51UHJvcHMgPSB7XG4gICAgICBvcGVuS2V5cyxcbiAgICAgIG9uT3BlbkNoYW5nZTogdGhpcy5oYW5kbGVPcGVuQ2hhbmdlLFxuICAgICAgY2xhc3NOYW1lOiBtZW51Q2xhc3NOYW1lLFxuICAgICAgbW9kZTogbWVudU1vZGUsXG4gICAgfTtcblxuICAgIGlmIChtZW51TW9kZSAhPT0gJ2lubGluZScpIHtcbiAgICAgIC8vIGNsb3NpbmcgdmVydGljYWwgcG9wdXAgc3VibWVudSBhZnRlciBjbGljayBpdFxuICAgICAgbWVudVByb3BzLm9uQ2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrO1xuICAgICAgbWVudVByb3BzLm9wZW5UcmFuc2l0aW9uTmFtZSA9IG1lbnVPcGVuQW5pbWF0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZW51UHJvcHMub3BlbkFuaW1hdGlvbiA9IG1lbnVPcGVuQW5pbWF0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IHsgY29sbGFwc2VkV2lkdGggfSA9IHRoaXMuY29udGV4dDtcbiAgICBpZiAoXG4gICAgICB0aGlzLmdldElubGluZUNvbGxhcHNlZCgpICYmXG4gICAgICAoY29sbGFwc2VkV2lkdGggPT09IDAgfHwgY29sbGFwc2VkV2lkdGggPT09ICcwJyB8fCBjb2xsYXBzZWRXaWR0aCA9PT0gJzBweCcpXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gPFJjTWVudSB7Li4udGhpcy5wcm9wc30gey4uLm1lbnVQcm9wc30gcHJlZml4Q2xzPXtwcmVmaXhDbHN9IC8+O1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=