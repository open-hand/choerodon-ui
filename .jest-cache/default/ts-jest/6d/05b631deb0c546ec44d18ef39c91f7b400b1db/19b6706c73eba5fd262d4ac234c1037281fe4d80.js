import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormField } from '../field/FormField';
import Icon from '../icon';
import Progress from '../progress';
export default class UploadList extends FormField {
    render() {
        const { prefixCls, props: { items, remove, showPreviewImage, previewImageWidth, }, } = this;
        const list = items.map(file => {
            let previewImg;
            let progress;
            let removeIcon;
            const progressProps = {
                value: file.percent,
                size: "small" /* small */,
                showInfo: false,
            };
            if (showPreviewImage && file.type.startsWith('image')) {
                // temporarily set img[width] to 100
                previewImg = React.createElement("img", { width: previewImageWidth, alt: file.filename, src: file.url });
            }
            if (file.status === 'uploading') {
                progress = (React.createElement("div", { className: `${prefixCls}-item-progress` },
                    React.createElement(Progress, Object.assign({}, progressProps))));
            }
            else {
                const rmProps = {
                    className: classnames(`${prefixCls}-item-icon`, {
                        [`${prefixCls}-item-remove`]: true,
                    }),
                    type: 'close',
                    onClick: () => {
                        remove(file);
                    },
                };
                removeIcon = React.createElement(Icon, Object.assign({}, rmProps));
            }
            const listProps = {
                className: classnames(`${prefixCls}-item`, {
                    [`${prefixCls}-item-error`]: file.status === 'error',
                    [`${prefixCls}-item-success`]: file.status === 'success',
                }),
            };
            return (React.createElement("div", Object.assign({}, listProps, { key: file.uid }),
                previewImg,
                React.createElement("span", { className: `${prefixCls}-item-name` }, file.name),
                progress,
                removeIcon));
        });
        const listWrapperCls = items.length ? `${prefixCls}` : `${prefixCls}-empty`;
        return (React.createElement("div", { className: listWrapperCls }, list));
    }
}
UploadList.displayName = 'UploadList';
UploadList.propTypes = {
    items: PropTypes.array,
    remove: PropTypes.func,
    ...FormField.propTypes,
};
UploadList.defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload-list',
    items: [],
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3VwbG9hZC9VcGxvYWRMaXN0LnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLG9CQUFvQixDQUFDO0FBQy9ELE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUM7QUFXbkMsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFXLFNBQVEsU0FBMEI7SUFlaEUsTUFBTTtRQUNKLE1BQU0sRUFDSixTQUFTLEVBQ1QsS0FBSyxFQUFFLEVBQ0wsS0FBSyxFQUNMLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsaUJBQWlCLEdBQ2xCLEdBQ0YsR0FBRyxJQUFJLENBQUM7UUFFVCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLElBQUksVUFBZSxDQUFDO1lBQ3BCLElBQUksUUFBUSxDQUFDO1lBQ2IsSUFBSSxVQUFVLENBQUM7WUFDZixNQUFNLGFBQWEsR0FBRztnQkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNuQixJQUFJLHFCQUFZO2dCQUNoQixRQUFRLEVBQUUsS0FBSzthQUNoQixDQUFDO1lBQ0YsSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckQsb0NBQW9DO2dCQUNwQyxVQUFVLEdBQUcsNkJBQUssS0FBSyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFJLENBQUM7YUFDbkY7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO2dCQUMvQixRQUFRLEdBQUcsQ0FDVCw2QkFBSyxTQUFTLEVBQUUsR0FBRyxTQUFTLGdCQUFnQjtvQkFDMUMsb0JBQUMsUUFBUSxvQkFBSyxhQUFhLEVBQUksQ0FDM0IsQ0FBQyxDQUFDO2FBQ1g7aUJBQU07Z0JBQ0wsTUFBTSxPQUFPLEdBQUc7b0JBQ2QsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFNBQVMsWUFBWSxFQUFFO3dCQUM5QyxDQUFDLEdBQUcsU0FBUyxjQUFjLENBQUMsRUFBRSxJQUFJO3FCQUNuQyxDQUFDO29CQUNGLElBQUksRUFBRSxPQUFPO29CQUNiLE9BQU8sRUFBRSxHQUFHLEVBQUU7d0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNmLENBQUM7aUJBQ0YsQ0FBQztnQkFDRixVQUFVLEdBQUcsb0JBQUMsSUFBSSxvQkFBSyxPQUFPLEVBQUksQ0FBQzthQUNwQztZQUNELE1BQU0sU0FBUyxHQUFHO2dCQUNoQixTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsU0FBUyxPQUFPLEVBQUU7b0JBQ3pDLENBQUMsR0FBRyxTQUFTLGFBQWEsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssT0FBTztvQkFDcEQsQ0FBQyxHQUFHLFNBQVMsZUFBZSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTO2lCQUN6RCxDQUFDO2FBQ0gsQ0FBQztZQUVGLE9BQU8sQ0FDTCw2Q0FBUyxTQUFTLElBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2dCQUM5QixVQUFVO2dCQUNYLDhCQUFNLFNBQVMsRUFBRSxHQUFHLFNBQVMsWUFBWSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQVE7Z0JBQzVELFFBQVE7Z0JBQ1IsVUFBVSxDQUNQLENBQ1AsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLFFBQVEsQ0FBQztRQUU1RSxPQUFPLENBQ0wsNkJBQUssU0FBUyxFQUFFLGNBQWMsSUFDM0IsSUFBSSxDQUNELENBQ1AsQ0FBQztJQUNKLENBQUM7O0FBL0VNLHNCQUFXLEdBQUcsWUFBWSxDQUFDO0FBRTNCLG9CQUFTLEdBQUc7SUFDakIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO0lBQ3RCLE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN0QixHQUFHLFNBQVMsQ0FBQyxTQUFTO0NBQ3ZCLENBQUM7QUFFSyx1QkFBWSxHQUFHO0lBQ3BCLEdBQUcsU0FBUyxDQUFDLFlBQVk7SUFDekIsU0FBUyxFQUFFLGFBQWE7SUFDeEIsS0FBSyxFQUFFLEVBQUU7Q0FDVixDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby91cGxvYWQvVXBsb2FkTGlzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IEZvcm1GaWVsZCwgRm9ybUZpZWxkUHJvcHMgfSBmcm9tICcuLi9maWVsZC9Gb3JtRmllbGQnO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgUHJvZ3Jlc3MgZnJvbSAnLi4vcHJvZ3Jlc3MnO1xuaW1wb3J0IHsgU2l6ZSB9IGZyb20gJy4uL2NvcmUvZW51bSc7XG5pbXBvcnQgeyBVcGxvYWRGaWxlIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZExpc3RQcm9wcyBleHRlbmRzIEZvcm1GaWVsZFByb3BzIHtcbiAgaXRlbXM6IFVwbG9hZEZpbGVbXTtcbiAgc2hvd1ByZXZpZXdJbWFnZTogYm9vbGVhbjtcbiAgcHJldmlld0ltYWdlV2lkdGg6IG51bWJlcjtcbiAgcmVtb3ZlOiAoZmlsZTogVXBsb2FkRmlsZSkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXBsb2FkTGlzdCBleHRlbmRzIEZvcm1GaWVsZDxVcGxvYWRMaXN0UHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ1VwbG9hZExpc3QnO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaXRlbXM6IFByb3BUeXBlcy5hcnJheSxcbiAgICByZW1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIC4uLkZvcm1GaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5Gb3JtRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ3VwbG9hZC1saXN0JyxcbiAgICBpdGVtczogW10sXG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGl0ZW1zLFxuICAgICAgICByZW1vdmUsXG4gICAgICAgIHNob3dQcmV2aWV3SW1hZ2UsXG4gICAgICAgIHByZXZpZXdJbWFnZVdpZHRoLFxuICAgICAgfSxcbiAgICB9ID0gdGhpcztcblxuICAgIGNvbnN0IGxpc3QgPSBpdGVtcy5tYXAoZmlsZSA9PiB7XG4gICAgICBsZXQgcHJldmlld0ltZzogYW55O1xuICAgICAgbGV0IHByb2dyZXNzO1xuICAgICAgbGV0IHJlbW92ZUljb247XG4gICAgICBjb25zdCBwcm9ncmVzc1Byb3BzID0ge1xuICAgICAgICB2YWx1ZTogZmlsZS5wZXJjZW50LFxuICAgICAgICBzaXplOiBTaXplLnNtYWxsLFxuICAgICAgICBzaG93SW5mbzogZmFsc2UsXG4gICAgICB9O1xuICAgICAgaWYgKHNob3dQcmV2aWV3SW1hZ2UgJiYgZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlJykpIHtcbiAgICAgICAgLy8gdGVtcG9yYXJpbHkgc2V0IGltZ1t3aWR0aF0gdG8gMTAwXG4gICAgICAgIHByZXZpZXdJbWcgPSA8aW1nIHdpZHRoPXtwcmV2aWV3SW1hZ2VXaWR0aH0gYWx0PXtmaWxlLmZpbGVuYW1lfSBzcmM9e2ZpbGUudXJsfSAvPjtcbiAgICAgIH1cbiAgICAgIGlmIChmaWxlLnN0YXR1cyA9PT0gJ3VwbG9hZGluZycpIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30taXRlbS1wcm9ncmVzc2B9PlxuICAgICAgICAgICAgPFByb2dyZXNzIHsuLi5wcm9ncmVzc1Byb3BzfSAvPlxuICAgICAgICAgIDwvZGl2Pik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBybVByb3BzID0ge1xuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NuYW1lcyhgJHtwcmVmaXhDbHN9LWl0ZW0taWNvbmAsIHtcbiAgICAgICAgICAgIFtgJHtwcmVmaXhDbHN9LWl0ZW0tcmVtb3ZlYF06IHRydWUsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICByZW1vdmUoZmlsZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgcmVtb3ZlSWNvbiA9IDxJY29uIHsuLi5ybVByb3BzfSAvPjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxpc3RQcm9wcyA9IHtcbiAgICAgICAgY2xhc3NOYW1lOiBjbGFzc25hbWVzKGAke3ByZWZpeENsc30taXRlbWAsIHtcbiAgICAgICAgICBbYCR7cHJlZml4Q2xzfS1pdGVtLWVycm9yYF06IGZpbGUuc3RhdHVzID09PSAnZXJyb3InLFxuICAgICAgICAgIFtgJHtwcmVmaXhDbHN9LWl0ZW0tc3VjY2Vzc2BdOiBmaWxlLnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgey4uLmxpc3RQcm9wc30ga2V5PXtmaWxlLnVpZH0+XG4gICAgICAgICAge3ByZXZpZXdJbWd9XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWl0ZW0tbmFtZWB9PntmaWxlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgIHtwcm9ncmVzc31cbiAgICAgICAgICB7cmVtb3ZlSWNvbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgbGlzdFdyYXBwZXJDbHMgPSBpdGVtcy5sZW5ndGggPyBgJHtwcmVmaXhDbHN9YCA6IGAke3ByZWZpeENsc30tZW1wdHlgO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtsaXN0V3JhcHBlckNsc30+XG4gICAgICAgIHtsaXN0fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9