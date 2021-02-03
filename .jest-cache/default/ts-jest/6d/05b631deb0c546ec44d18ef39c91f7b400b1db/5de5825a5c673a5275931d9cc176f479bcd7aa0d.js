import React, { Component } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';
export default class CheckableTag extends Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            const { checked, onChange } = this.props;
            if (onChange) {
                onChange(!checked);
            }
        };
    }
    render() {
        const { prefixCls: customizePrefixCls, className, checked, ...restProps } = this.props;
        const prefixCls = getPrefixCls('tag', customizePrefixCls);
        const cls = classNames(prefixCls, {
            [`${prefixCls}-checkable`]: true,
            [`${prefixCls}-checkable-checked`]: checked,
        }, className);
        delete restProps.onChange; // TypeScript cannot check delete now.
        return React.createElement("div", Object.assign({}, restProps, { className: cls, onClick: this.handleClick }));
    }
}
CheckableTag.displayName = 'CheckableTag';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvdGFnL0NoZWNrYWJsZVRhZy50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFTNUMsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFhLFNBQVEsU0FBNEI7SUFBdEU7O1FBR0UsZ0JBQVcsR0FBRyxHQUFHLEVBQUU7WUFDakIsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNaLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3BCO1FBQ0gsQ0FBQyxDQUFDO0lBaUJKLENBQUM7SUFmQyxNQUFNO1FBQ0osTUFBTSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2RixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDMUQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUNwQixTQUFTLEVBQ1Q7WUFDRSxDQUFDLEdBQUcsU0FBUyxZQUFZLENBQUMsRUFBRSxJQUFJO1lBQ2hDLENBQUMsR0FBRyxTQUFTLG9CQUFvQixDQUFDLEVBQUUsT0FBTztTQUM1QyxFQUNELFNBQVMsQ0FDVixDQUFDO1FBRUYsT0FBUSxTQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLHNDQUFzQztRQUMxRSxPQUFPLDZDQUFVLFNBQWlCLElBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDO0lBQ3BGLENBQUM7O0FBdkJNLHdCQUFXLEdBQUcsY0FBYyxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzL3RhZy9DaGVja2FibGVUYWcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IGdldFByZWZpeENscyB9IGZyb20gJy4uL2NvbmZpZ3VyZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hlY2thYmxlVGFnUHJvcHMge1xuICBwcmVmaXhDbHM/OiBzdHJpbmc7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgY2hlY2tlZDogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoY2hlY2tlZDogYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2thYmxlVGFnIGV4dGVuZHMgQ29tcG9uZW50PENoZWNrYWJsZVRhZ1Byb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdDaGVja2FibGVUYWcnO1xuXG4gIGhhbmRsZUNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgY2hlY2tlZCwgb25DaGFuZ2UgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZSghY2hlY2tlZCk7XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByZWZpeENsczogY3VzdG9taXplUHJlZml4Q2xzLCBjbGFzc05hbWUsIGNoZWNrZWQsIC4uLnJlc3RQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBwcmVmaXhDbHMgPSBnZXRQcmVmaXhDbHMoJ3RhZycsIGN1c3RvbWl6ZVByZWZpeENscyk7XG4gICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyhcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHtcbiAgICAgICAgW2Ake3ByZWZpeENsc30tY2hlY2thYmxlYF06IHRydWUsXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWNoZWNrYWJsZS1jaGVja2VkYF06IGNoZWNrZWQsXG4gICAgICB9LFxuICAgICAgY2xhc3NOYW1lLFxuICAgICk7XG5cbiAgICBkZWxldGUgKHJlc3RQcm9wcyBhcyBhbnkpLm9uQ2hhbmdlOyAvLyBUeXBlU2NyaXB0IGNhbm5vdCBjaGVjayBkZWxldGUgbm93LlxuICAgIHJldHVybiA8ZGl2IHsuLi4ocmVzdFByb3BzIGFzIGFueSl9IGNsYXNzTmFtZT17Y2xzfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfSAvPjtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9