import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element from './Element';
import { getPrefixCls } from '../configure';
// eslint-disable-next-line react/prefer-stateless-function
class SkeletonButton extends React.Component {
    constructor() {
        super(...arguments);
        this.renderSkeletonButton = () => {
            const { prefixCls: customizePrefixCls, className, active } = this.props;
            const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
            const otherProps = omit(this.props, ['prefixCls']);
            const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
                [`${prefixCls}-active`]: active,
            });
            return (React.createElement("div", { className: cls },
                React.createElement(Element, Object.assign({ prefixCls: `${prefixCls}-button` }, otherProps))));
        };
    }
    render() {
        return React.createElement(React.Fragment, null, this.renderSkeletonButton());
    }
}
SkeletonButton.defaultProps = {
    size: 'default',
};
export default SkeletonButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvc2tlbGV0b24vQnV0dG9uLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sT0FBaUMsTUFBTSxXQUFXLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQU01QywyREFBMkQ7QUFDM0QsTUFBTSxjQUFlLFNBQVEsS0FBSyxDQUFDLFNBQW1DO0lBQXRFOztRQUtFLHlCQUFvQixHQUFHLEdBQUcsRUFBRTtZQUMxQixNQUFNLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3hFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLFVBQVUsRUFBRTtnQkFDbkUsQ0FBQyxHQUFHLFNBQVMsU0FBUyxDQUFDLEVBQUUsTUFBTTthQUNoQyxDQUFDLENBQUM7WUFDSCxPQUFPLENBQ0wsNkJBQUssU0FBUyxFQUFFLEdBQUc7Z0JBQ2pCLG9CQUFDLE9BQU8sa0JBQUMsU0FBUyxFQUFFLEdBQUcsU0FBUyxTQUFTLElBQU0sVUFBVSxFQUFJLENBQ3pELENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUtKLENBQUM7SUFIQyxNQUFNO1FBQ0osT0FBTywwQ0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBSSxDQUFDO0lBQzVDLENBQUM7O0FBcEJNLDJCQUFZLEdBQWlDO0lBQ2xELElBQUksRUFBRSxTQUFTO0NBQ2hCLENBQUM7QUFxQkosZUFBZSxjQUFjLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvc2tlbGV0b24vQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBFbGVtZW50LCB7IFNrZWxldG9uRWxlbWVudFByb3BzIH0gZnJvbSAnLi9FbGVtZW50JztcbmltcG9ydCB7IGdldFByZWZpeENscyB9IGZyb20gJy4uL2NvbmZpZ3VyZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2tlbGV0b25CdXR0b25Qcm9wcyBleHRlbmRzIE9taXQ8U2tlbGV0b25FbGVtZW50UHJvcHMsICdzaXplJz4ge1xuICBzaXplPzogJ2xhcmdlJyB8ICdzbWFsbCcgfCAnZGVmYXVsdCc7XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC9wcmVmZXItc3RhdGVsZXNzLWZ1bmN0aW9uXG5jbGFzcyBTa2VsZXRvbkJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxTa2VsZXRvbkJ1dHRvblByb3BzLCBhbnk+IHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wczogUGFydGlhbDxTa2VsZXRvbkJ1dHRvblByb3BzPiA9IHtcbiAgICBzaXplOiAnZGVmYXVsdCcsXG4gIH07XG5cbiAgcmVuZGVyU2tlbGV0b25CdXR0b24gPSAoKSA9PiB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHM6IGN1c3RvbWl6ZVByZWZpeENscywgY2xhc3NOYW1lLCBhY3RpdmUgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gZ2V0UHJlZml4Q2xzKCdza2VsZXRvbicsIGN1c3RvbWl6ZVByZWZpeENscyk7XG4gICAgY29uc3Qgb3RoZXJQcm9wcyA9IG9taXQodGhpcy5wcm9wcywgWydwcmVmaXhDbHMnXSk7XG4gICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyhwcmVmaXhDbHMsIGNsYXNzTmFtZSwgYCR7cHJlZml4Q2xzfS1lbGVtZW50YCwge1xuICAgICAgW2Ake3ByZWZpeENsc30tYWN0aXZlYF06IGFjdGl2ZSxcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Nsc30+XG4gICAgICAgIDxFbGVtZW50IHByZWZpeENscz17YCR7cHJlZml4Q2xzfS1idXR0b25gfSB7Li4ub3RoZXJQcm9wc30gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8Pnt0aGlzLnJlbmRlclNrZWxldG9uQnV0dG9uKCl9PC8+O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNrZWxldG9uQnV0dG9uO1xuIl0sInZlcnNpb24iOjN9