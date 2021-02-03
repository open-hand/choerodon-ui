import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';
import Element from './Element';
// eslint-disable-next-line react/prefer-stateless-function
class SkeletonAvatar extends React.Component {
    constructor() {
        super(...arguments);
        this.renderSkeletonAvatar = () => {
            const { prefixCls: customizePrefixCls, className, active } = this.props;
            const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
            const otherProps = omit(this.props, ['prefixCls']);
            const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
                [`${prefixCls}-active`]: active,
            });
            return (React.createElement("div", { className: cls },
                React.createElement(Element, Object.assign({ prefixCls: `${prefixCls}-avatar` }, otherProps))));
        };
    }
    render() {
        return React.createElement(React.Fragment, null, this.renderSkeletonAvatar());
    }
}
SkeletonAvatar.defaultProps = {
    size: 'default',
    shape: 'circle',
};
export default SkeletonAvatar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvc2tlbGV0b24vQXZhdGFyLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDNUMsT0FBTyxPQUFpQyxNQUFNLFdBQVcsQ0FBQztBQU0xRCwyREFBMkQ7QUFDM0QsTUFBTSxjQUFlLFNBQVEsS0FBSyxDQUFDLFNBQTJCO0lBQTlEOztRQU1FLHlCQUFvQixHQUFHLEdBQUcsRUFBRTtZQUMxQixNQUFNLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3hFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLFVBQVUsRUFBRTtnQkFDbkUsQ0FBQyxHQUFHLFNBQVMsU0FBUyxDQUFDLEVBQUUsTUFBTTthQUNoQyxDQUFDLENBQUM7WUFDSCxPQUFPLENBQ0wsNkJBQUssU0FBUyxFQUFFLEdBQUc7Z0JBQ2pCLG9CQUFDLE9BQU8sa0JBQUMsU0FBUyxFQUFFLEdBQUcsU0FBUyxTQUFTLElBQU0sVUFBVSxFQUFJLENBQ3pELENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUtKLENBQUM7SUFIQyxNQUFNO1FBQ0osT0FBTywwQ0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBSSxDQUFDO0lBQzVDLENBQUM7O0FBckJNLDJCQUFZLEdBQXlCO0lBQzFDLElBQUksRUFBRSxTQUFTO0lBQ2YsS0FBSyxFQUFFLFFBQVE7Q0FDaEIsQ0FBQztBQXFCSixlQUFlLGNBQWMsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy9za2VsZXRvbi9BdmF0YXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgZ2V0UHJlZml4Q2xzIH0gZnJvbSAnLi4vY29uZmlndXJlJztcbmltcG9ydCBFbGVtZW50LCB7IFNrZWxldG9uRWxlbWVudFByb3BzIH0gZnJvbSAnLi9FbGVtZW50JztcblxuZXhwb3J0IGludGVyZmFjZSBBdmF0YXJQcm9wcyBleHRlbmRzIE9taXQ8U2tlbGV0b25FbGVtZW50UHJvcHMsICdzaGFwZSc+IHtcbiAgc2hhcGU/OiAnY2lyY2xlJyB8ICdzcXVhcmUnO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuY2xhc3MgU2tlbGV0b25BdmF0YXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8QXZhdGFyUHJvcHMsIGFueT4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzOiBQYXJ0aWFsPEF2YXRhclByb3BzPiA9IHtcbiAgICBzaXplOiAnZGVmYXVsdCcsXG4gICAgc2hhcGU6ICdjaXJjbGUnLFxuICB9O1xuXG4gIHJlbmRlclNrZWxldG9uQXZhdGFyID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzOiBjdXN0b21pemVQcmVmaXhDbHMsIGNsYXNzTmFtZSwgYWN0aXZlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHByZWZpeENscyA9IGdldFByZWZpeENscygnc2tlbGV0b24nLCBjdXN0b21pemVQcmVmaXhDbHMpO1xuICAgIGNvbnN0IG90aGVyUHJvcHMgPSBvbWl0KHRoaXMucHJvcHMsIFsncHJlZml4Q2xzJ10pO1xuICAgIGNvbnN0IGNscyA9IGNsYXNzTmFtZXMocHJlZml4Q2xzLCBjbGFzc05hbWUsIGAke3ByZWZpeENsc30tZWxlbWVudGAsIHtcbiAgICAgIFtgJHtwcmVmaXhDbHN9LWFjdGl2ZWBdOiBhY3RpdmUsXG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbHN9PlxuICAgICAgICA8RWxlbWVudCBwcmVmaXhDbHM9e2Ake3ByZWZpeENsc30tYXZhdGFyYH0gey4uLm90aGVyUHJvcHN9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPD57dGhpcy5yZW5kZXJTa2VsZXRvbkF2YXRhcigpfTwvPjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTa2VsZXRvbkF2YXRhcjtcbiJdLCJ2ZXJzaW9uIjozfQ==