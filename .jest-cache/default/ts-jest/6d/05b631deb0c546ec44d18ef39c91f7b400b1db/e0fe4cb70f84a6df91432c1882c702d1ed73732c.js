import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import Element from './Element';
import { getPrefixCls } from '../configure';
// eslint-disable-next-line react/prefer-stateless-function
class SkeletonInput extends React.Component {
    constructor() {
        super(...arguments);
        this.renderSkeletonInput = () => {
            const { prefixCls: customizePrefixCls, className, active } = this.props;
            const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
            const otherProps = omit(this.props, ['prefixCls']);
            const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
                [`${prefixCls}-active`]: active,
            });
            return (React.createElement("div", { className: cls },
                React.createElement(Element, Object.assign({ prefixCls: `${prefixCls}-input` }, otherProps))));
        };
    }
    render() {
        return React.createElement(React.Fragment, null, this.renderSkeletonInput());
    }
}
SkeletonInput.defaultProps = {
    size: 'default',
};
export default SkeletonInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvc2tlbGV0b24vSW5wdXQudHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxPQUFpQyxNQUFNLFdBQVcsQ0FBQztBQUMxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBTTVDLDJEQUEyRDtBQUMzRCxNQUFNLGFBQWMsU0FBUSxLQUFLLENBQUMsU0FBa0M7SUFBcEU7O1FBS0Usd0JBQW1CLEdBQUcsR0FBRyxFQUFFO1lBQ3pCLE1BQU0sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEUsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLFNBQVMsVUFBVSxFQUFFO2dCQUNuRSxDQUFDLEdBQUcsU0FBUyxTQUFTLENBQUMsRUFBRSxNQUFNO2FBQ2hDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FDTCw2QkFBSyxTQUFTLEVBQUUsR0FBRztnQkFDakIsb0JBQUMsT0FBTyxrQkFBQyxTQUFTLEVBQUUsR0FBRyxTQUFTLFFBQVEsSUFBTSxVQUFVLEVBQUksQ0FDeEQsQ0FDUCxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBS0osQ0FBQztJQUhDLE1BQU07UUFDSixPQUFPLDBDQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFJLENBQUM7SUFDM0MsQ0FBQzs7QUFwQk0sMEJBQVksR0FBZ0M7SUFDakQsSUFBSSxFQUFFLFNBQVM7Q0FDaEIsQ0FBQztBQXFCSixlQUFlLGFBQWEsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy9za2VsZXRvbi9JbnB1dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgRWxlbWVudCwgeyBTa2VsZXRvbkVsZW1lbnRQcm9wcyB9IGZyb20gJy4vRWxlbWVudCc7XG5pbXBvcnQgeyBnZXRQcmVmaXhDbHMgfSBmcm9tICcuLi9jb25maWd1cmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNrZWxldG9uSW5wdXRQcm9wcyBleHRlbmRzIE9taXQ8U2tlbGV0b25FbGVtZW50UHJvcHMsICdzaXplJyB8ICdzaGFwZSc+IHtcbiAgc2l6ZT86ICdsYXJnZScgfCAnc21hbGwnIHwgJ2RlZmF1bHQnO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuY2xhc3MgU2tlbGV0b25JbnB1dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxTa2VsZXRvbklucHV0UHJvcHMsIGFueT4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzOiBQYXJ0aWFsPFNrZWxldG9uSW5wdXRQcm9wcz4gPSB7XG4gICAgc2l6ZTogJ2RlZmF1bHQnLFxuICB9O1xuXG4gIHJlbmRlclNrZWxldG9uSW5wdXQgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHM6IGN1c3RvbWl6ZVByZWZpeENscywgY2xhc3NOYW1lLCBhY3RpdmUgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gZ2V0UHJlZml4Q2xzKCdza2VsZXRvbicsIGN1c3RvbWl6ZVByZWZpeENscyk7XG4gICAgY29uc3Qgb3RoZXJQcm9wcyA9IG9taXQodGhpcy5wcm9wcywgWydwcmVmaXhDbHMnXSk7XG4gICAgY29uc3QgY2xzID0gY2xhc3NOYW1lcyhwcmVmaXhDbHMsIGNsYXNzTmFtZSwgYCR7cHJlZml4Q2xzfS1lbGVtZW50YCwge1xuICAgICAgW2Ake3ByZWZpeENsc30tYWN0aXZlYF06IGFjdGl2ZSxcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Nsc30+XG4gICAgICAgIDxFbGVtZW50IHByZWZpeENscz17YCR7cHJlZml4Q2xzfS1pbnB1dGB9IHsuLi5vdGhlclByb3BzfSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDw+e3RoaXMucmVuZGVyU2tlbGV0b25JbnB1dCgpfTwvPjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTa2VsZXRvbklucHV0O1xuIl0sInZlcnNpb24iOjN9