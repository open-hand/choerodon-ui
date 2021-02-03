import React, { cloneElement, isValidElement, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Trigger from '../trigger/Trigger';
import builtinPlacements from './placements';
const popupStyle = { whiteSpace: 'nowrap' };
export default class Dropdown extends PureComponent {
    constructor(props) {
        super(props);
        /**
         * 调用传入的onHiddenChange方法
         *
         * @param {boolean} hidden
         */
        this.handlePopupHiddenChange = (hidden) => {
            const { onHiddenChange, onVisibleChange, hidden: propsHidden, visible: propsVisible, } = this.props;
            if (propsHidden === undefined && propsVisible === undefined) {
                this.setState({
                    hidden,
                });
            }
            if (onHiddenChange) {
                onHiddenChange(hidden);
            }
            if (onVisibleChange) {
                onVisibleChange(!hidden);
            }
        };
        this.handleClick = e => {
            const { onOverlayClick, overlay, hidden, visible } = this.props;
            const { onClick } = ((isValidElement(overlay) && overlay.props) || {});
            if (onOverlayClick) {
                onOverlayClick(e);
            }
            if (onClick) {
                onClick(e);
            }
            if (hidden === undefined && visible === undefined) {
                this.setState({
                    hidden: true,
                });
            }
        };
        if ('hidden' in props) {
            this.state = {
                hidden: props.hidden,
            };
        }
        else if ('visible' in props) {
            this.state = {
                hidden: !props.visible,
            };
        }
        else if ('defaultHidden' in props) {
            this.state = {
                hidden: props.defaultHidden,
            };
        }
        else {
            this.state = {
                hidden: !props.defaultVisible,
            };
        }
    }
    get triggerAction() {
        const { trigger } = this.props;
        return trigger;
    }
    get transitionName() {
        const { placement } = this.props;
        let result = 'slide-up';
        if (placement && placement.startsWith('top')) {
            result = 'slide-down';
        }
        return result;
    }
    get prefixCls() {
        const { suffixCls, prefixCls } = this.props;
        return getProPrefixCls(suffixCls, prefixCls);
    }
    getMenuElement() {
        const { overlay } = this.props;
        if (isValidElement(overlay)) {
            return cloneElement(overlay, {
                onClick: this.handleClick,
            });
        }
    }
    componentWillReceiveProps({ hidden, visible }) {
        if (hidden !== undefined) {
            this.setState({
                hidden,
            });
        }
        else if (visible !== undefined) {
            this.setState({
                hidden: !visible,
            });
        }
    }
    render() {
        const { prefixCls, state: { hidden }, props: { children, placement, popupClassName }, } = this;
        return (React.createElement(Trigger, { prefixCls: prefixCls, action: this.triggerAction, builtinPlacements: builtinPlacements, popupPlacement: placement, popupContent: this.getMenuElement(), popupStyle: popupStyle, popupClassName: popupClassName, onPopupHiddenChange: this.handlePopupHiddenChange, popupHidden: hidden }, children));
    }
}
Dropdown.displayName = 'Dropdown';
Dropdown.propTypes = {
    trigger: PropTypes.arrayOf(PropTypes.oneOf(["focus" /* focus */, "hover" /* hover */, "click" /* click */, "contextMenu" /* contextMenu */])),
    overlay: PropTypes.any,
    placement: PropTypes.oneOf([
        "bottomLeft" /* bottomLeft */,
        "bottomCenter" /* bottomCenter */,
        "bottomRight" /* bottomRight */,
        "topLeft" /* topLeft */,
        "topCenter" /* topCenter */,
        "topRight" /* topRight */,
    ]),
    hidden: PropTypes.bool,
    visible: PropTypes.bool,
    onHiddenChange: PropTypes.func,
    onVisibleChange: PropTypes.func,
    onOverlayClick: PropTypes.func,
    suffixCls: PropTypes.string,
    prefixCls: PropTypes.string,
    defaultHidden: PropTypes.bool,
    defaultVisible: PropTypes.bool,
    popupClassName: PropTypes.string,
};
Dropdown.defaultProps = {
    suffixCls: 'dropdown',
    placement: "bottomLeft" /* bottomLeft */,
    trigger: ["hover" /* hover */, "focus" /* focus */],
    defaultHidden: true,
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Ryb3Bkb3duL0Ryb3Bkb3duLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBaUIsY0FBYyxFQUFFLGFBQWEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUMxRixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBR3pDLE9BQU8saUJBQWlCLE1BQU0sY0FBYyxDQUFDO0FBRTdDLE1BQU0sVUFBVSxHQUFrQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQTRCM0QsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFTLFNBQVEsYUFBNEI7SUF3RGhFLFlBQVksS0FBSztRQUNmLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQW9CZjs7OztXQUlHO1FBQ0gsNEJBQXVCLEdBQUcsQ0FBQyxNQUFlLEVBQUUsRUFBRTtZQUM1QyxNQUFNLEVBQ0osY0FBYyxFQUNkLGVBQWUsRUFDZixNQUFNLEVBQUUsV0FBVyxFQUNuQixPQUFPLEVBQUUsWUFBWSxHQUN0QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDZixJQUFJLFdBQVcsS0FBSyxTQUFTLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDWixNQUFNO2lCQUNQLENBQUMsQ0FBQzthQUNKO1lBQ0QsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN4QjtZQUNELElBQUksZUFBZSxFQUFFO2dCQUNuQixlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQjtRQUNILENBQUMsQ0FBQztRQUVGLGdCQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDaEIsTUFBTSxFQUFF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QixTQUFTLCtCQUF1QjtJQUNoQyxPQUFPLEVBQUUsMENBQTRCO0lBQ3JDLGFBQWEsRUFBRSxJQUFJO0NBQ3BCLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Ryb3Bkb3duL0Ryb3Bkb3duLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY2xvbmVFbGVtZW50LCBDU1NQcm9wZXJ0aWVzLCBpc1ZhbGlkRWxlbWVudCwgUHVyZUNvbXBvbmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBnZXRQcm9QcmVmaXhDbHMgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbmZpZ3VyZSc7XG5pbXBvcnQgVHJpZ2dlciBmcm9tICcuLi90cmlnZ2VyL1RyaWdnZXInO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi4vdHJpZ2dlci9lbnVtJztcbmltcG9ydCB7IFBsYWNlbWVudHMgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IGJ1aWx0aW5QbGFjZW1lbnRzIGZyb20gJy4vcGxhY2VtZW50cyc7XG5cbmNvbnN0IHBvcHVwU3R5bGU6IENTU1Byb3BlcnRpZXMgPSB7IHdoaXRlU3BhY2U6ICdub3dyYXAnIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcERvd25Qcm9wcyB7XG4gIHRyaWdnZXI/OiBBY3Rpb25bXTtcbiAgb3ZlcmxheTogUmVhY3QuUmVhY3ROb2RlO1xuICBvbkhpZGRlbkNoYW5nZT86IChoaWRkZW4/OiBib29sZWFuKSA9PiB2b2lkO1xuICBvblZpc2libGVDaGFuZ2U/OiAodmlzaWJsZT86IGJvb2xlYW4pID0+IHZvaWQ7XG4gIG9uT3ZlcmxheUNsaWNrPzogKGUpID0+IHZvaWQ7XG4gIGhpZGRlbj86IGJvb2xlYW47XG4gIHZpc2libGU/OiBib29sZWFuO1xuICBkZWZhdWx0SGlkZGVuPzogYm9vbGVhbjtcbiAgZGVmYXVsdFZpc2libGU/OiBib29sZWFuO1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG4gIGFsaWduPzogT2JqZWN0O1xuICBnZXRQb3B1cENvbnRhaW5lcj86ICh0cmlnZ2VyTm9kZTogRWxlbWVudCkgPT4gSFRNTEVsZW1lbnQ7XG4gIHN1ZmZpeENscz86IHN0cmluZztcbiAgcHJlZml4Q2xzPzogc3RyaW5nO1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb25OYW1lPzogc3RyaW5nO1xuICBwbGFjZW1lbnQ/OiBQbGFjZW1lbnRzO1xuICBmb3JjZVJlbmRlcj86IGJvb2xlYW47XG4gIHBvcHVwQ2xhc3NOYW1lPzpzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcGRvd25TdGF0ZSB7XG4gIGhpZGRlbj86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyb3Bkb3duIGV4dGVuZHMgUHVyZUNvbXBvbmVudDxEcm9wRG93blByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdEcm9wZG93bic7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB0cmlnZ2VyOiBQcm9wVHlwZXMuYXJyYXlPZihcbiAgICAgIFByb3BUeXBlcy5vbmVPZihbQWN0aW9uLmZvY3VzLCBBY3Rpb24uaG92ZXIsIEFjdGlvbi5jbGljaywgQWN0aW9uLmNvbnRleHRNZW51XSksXG4gICAgKSxcbiAgICBvdmVybGF5OiBQcm9wVHlwZXMuYW55LFxuICAgIHBsYWNlbWVudDogUHJvcFR5cGVzLm9uZU9mKFtcbiAgICAgIFBsYWNlbWVudHMuYm90dG9tTGVmdCxcbiAgICAgIFBsYWNlbWVudHMuYm90dG9tQ2VudGVyLFxuICAgICAgUGxhY2VtZW50cy5ib3R0b21SaWdodCxcbiAgICAgIFBsYWNlbWVudHMudG9wTGVmdCxcbiAgICAgIFBsYWNlbWVudHMudG9wQ2VudGVyLFxuICAgICAgUGxhY2VtZW50cy50b3BSaWdodCxcbiAgICBdKSxcbiAgICBoaWRkZW46IFByb3BUeXBlcy5ib29sLFxuICAgIHZpc2libGU6IFByb3BUeXBlcy5ib29sLFxuICAgIG9uSGlkZGVuQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblZpc2libGVDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uT3ZlcmxheUNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzdWZmaXhDbHM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcHJlZml4Q2xzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRlZmF1bHRIaWRkZW46IFByb3BUeXBlcy5ib29sLFxuICAgIGRlZmF1bHRWaXNpYmxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBwb3B1cENsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIHN1ZmZpeENsczogJ2Ryb3Bkb3duJyxcbiAgICBwbGFjZW1lbnQ6IFBsYWNlbWVudHMuYm90dG9tTGVmdCxcbiAgICB0cmlnZ2VyOiBbQWN0aW9uLmhvdmVyLCBBY3Rpb24uZm9jdXNdLFxuICAgIGRlZmF1bHRIaWRkZW46IHRydWUsXG4gIH07XG5cbiAgZ2V0IHRyaWdnZXJBY3Rpb24oKTogQWN0aW9uW10ge1xuICAgIGNvbnN0IHsgdHJpZ2dlciB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gdHJpZ2dlciBhcyBBY3Rpb25bXTtcbiAgfVxuXG4gIGdldCB0cmFuc2l0aW9uTmFtZSgpIHtcbiAgICBjb25zdCB7IHBsYWNlbWVudCB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgcmVzdWx0ID0gJ3NsaWRlLXVwJztcbiAgICBpZiAocGxhY2VtZW50ICYmIHBsYWNlbWVudC5zdGFydHNXaXRoKCd0b3AnKSkge1xuICAgICAgcmVzdWx0ID0gJ3NsaWRlLWRvd24nO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0IHByZWZpeENscygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgc3VmZml4Q2xzLCBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIGdldFByb1ByZWZpeENscyhzdWZmaXhDbHMhLCBwcmVmaXhDbHMpO1xuICB9XG5cbiAgc3RhdGU6IERyb3Bkb3duU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgaWYgKCdoaWRkZW4nIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBoaWRkZW46IHByb3BzLmhpZGRlbixcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICgndmlzaWJsZScgaW4gcHJvcHMpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGhpZGRlbjogIXByb3BzLnZpc2libGUsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoJ2RlZmF1bHRIaWRkZW4nIGluIHByb3BzKSB7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBoaWRkZW46IHByb3BzLmRlZmF1bHRIaWRkZW4sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBoaWRkZW46ICFwcm9wcy5kZWZhdWx0VmlzaWJsZSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOiwg+eUqOS8oOWFpeeahG9uSGlkZGVuQ2hhbmdl5pa55rOVXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlkZGVuXG4gICAqL1xuICBoYW5kbGVQb3B1cEhpZGRlbkNoYW5nZSA9IChoaWRkZW46IGJvb2xlYW4pID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBvbkhpZGRlbkNoYW5nZSxcbiAgICAgIG9uVmlzaWJsZUNoYW5nZSxcbiAgICAgIGhpZGRlbjogcHJvcHNIaWRkZW4sXG4gICAgICB2aXNpYmxlOiBwcm9wc1Zpc2libGUsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHByb3BzSGlkZGVuID09PSB1bmRlZmluZWQgJiYgcHJvcHNWaXNpYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBoaWRkZW4sXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG9uSGlkZGVuQ2hhbmdlKSB7XG4gICAgICBvbkhpZGRlbkNoYW5nZShoaWRkZW4pO1xuICAgIH1cbiAgICBpZiAob25WaXNpYmxlQ2hhbmdlKSB7XG4gICAgICBvblZpc2libGVDaGFuZ2UoIWhpZGRlbik7XG4gICAgfVxuICB9O1xuXG4gIGhhbmRsZUNsaWNrID0gZSA9PiB7XG4gICAgY29uc3QgeyBvbk92ZXJsYXlDbGljaywgb3ZlcmxheSwgaGlkZGVuLCB2aXNpYmxlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgb25DbGljayB9ID0gKChpc1ZhbGlkRWxlbWVudChvdmVybGF5KSAmJiBvdmVybGF5LnByb3BzKSB8fCB7fSkgYXMgeyBvbkNsaWNrIH07XG4gICAgaWYgKG9uT3ZlcmxheUNsaWNrKSB7XG4gICAgICBvbk92ZXJsYXlDbGljayhlKTtcbiAgICB9XG4gICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgIG9uQ2xpY2soZSk7XG4gICAgfVxuICAgIGlmIChoaWRkZW4gPT09IHVuZGVmaW5lZCAmJiB2aXNpYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBoaWRkZW46IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZ2V0TWVudUVsZW1lbnQoKSB7XG4gICAgY29uc3QgeyBvdmVybGF5IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChpc1ZhbGlkRWxlbWVudChvdmVybGF5KSkge1xuICAgICAgcmV0dXJuIGNsb25lRWxlbWVudDxhbnk+KG92ZXJsYXksIHtcbiAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVDbGljayxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoeyBoaWRkZW4sIHZpc2libGUgfTogRHJvcERvd25Qcm9wcykge1xuICAgIGlmIChoaWRkZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGhpZGRlbixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodmlzaWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaGlkZGVuOiAhdmlzaWJsZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBzdGF0ZTogeyBoaWRkZW4gfSxcbiAgICAgIHByb3BzOiB7IGNoaWxkcmVuLCBwbGFjZW1lbnQsIHBvcHVwQ2xhc3NOYW1lIH0sXG4gICAgfSA9IHRoaXM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFRyaWdnZXJcbiAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgIGFjdGlvbj17dGhpcy50cmlnZ2VyQWN0aW9ufVxuICAgICAgICBidWlsdGluUGxhY2VtZW50cz17YnVpbHRpblBsYWNlbWVudHN9XG4gICAgICAgIHBvcHVwUGxhY2VtZW50PXtwbGFjZW1lbnR9XG4gICAgICAgIHBvcHVwQ29udGVudD17dGhpcy5nZXRNZW51RWxlbWVudCgpfVxuICAgICAgICBwb3B1cFN0eWxlPXtwb3B1cFN0eWxlfVxuICAgICAgICBwb3B1cENsYXNzTmFtZT17cG9wdXBDbGFzc05hbWV9XG4gICAgICAgIG9uUG9wdXBIaWRkZW5DaGFuZ2U9e3RoaXMuaGFuZGxlUG9wdXBIaWRkZW5DaGFuZ2V9XG4gICAgICAgIHBvcHVwSGlkZGVuPXtoaWRkZW59XG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvVHJpZ2dlcj5cbiAgICApO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=