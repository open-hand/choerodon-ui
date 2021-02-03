import React, { Component } from 'react';
import classNames from 'classnames';
import Lazyload from 'react-lazy-load';
import Checkbox from '../checkbox';
import PureRenderMixin from '../rc-components/util/PureRenderMixin';
export default class Item extends Component {
    shouldComponentUpdate(...args) {
        return PureRenderMixin.shouldComponentUpdate.apply(this, args);
    }
    render() {
        const { renderedText, renderedEl, item, lazy, checked, prefixCls, onClick } = this.props;
        const className = classNames({
            [`${prefixCls}-content-item`]: true,
            [`${prefixCls}-content-item-disabled`]: item.disabled,
        });
        const listItem = (React.createElement("li", { className: className, title: renderedText, onClick: item.disabled ? undefined : () => onClick(item) },
            React.createElement(Checkbox, { checked: checked, disabled: item.disabled }),
            React.createElement("span", null, renderedEl)));
        let children = null;
        if (lazy) {
            const lazyProps = {
                height: 32,
                offset: 500,
                throttle: 0,
                debounce: false,
                ...lazy,
            };
            children = React.createElement(Lazyload, Object.assign({}, lazyProps), listItem);
        }
        else {
            children = listItem;
        }
        return children;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvdHJhbnNmZXIvaXRlbS50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLGVBQWUsTUFBTSx1Q0FBdUMsQ0FBQztBQUVwRSxNQUFNLENBQUMsT0FBTyxPQUFPLElBQUssU0FBUSxTQUFtQjtJQUNuRCxxQkFBcUIsQ0FBQyxHQUFHLElBQVc7UUFDbEMsT0FBTyxlQUFlLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsTUFBTTtRQUNKLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRXpGLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztZQUMzQixDQUFDLEdBQUcsU0FBUyxlQUFlLENBQUMsRUFBRSxJQUFJO1lBQ25DLENBQUMsR0FBRyxTQUFTLHdCQUF3QixDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDdEQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsQ0FDZiw0QkFDRSxTQUFTLEVBQUUsU0FBUyxFQUNwQixLQUFLLEVBQUUsWUFBWSxFQUNuQixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXhELG9CQUFDLFFBQVEsSUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFJO1lBQ3ZELGtDQUFPLFVBQVUsQ0FBUSxDQUN0QixDQUNOLENBQUM7UUFDRixJQUFJLFFBQVEsR0FBdUIsSUFBSSxDQUFDO1FBQ3hDLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxTQUFTLEdBQUc7Z0JBQ2hCLE1BQU0sRUFBRSxFQUFFO2dCQUNWLE1BQU0sRUFBRSxHQUFHO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxLQUFLO2dCQUNmLEdBQUcsSUFBSTthQUNSLENBQUM7WUFDRixRQUFRLEdBQUcsb0JBQUMsUUFBUSxvQkFBSyxTQUFTLEdBQUcsUUFBUSxDQUFZLENBQUM7U0FDM0Q7YUFBTTtZQUNMLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDckI7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0YiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvdHJhbnNmZXIvaXRlbS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IExhenlsb2FkIGZyb20gJ3JlYWN0LWxhenktbG9hZCc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vY2hlY2tib3gnO1xuaW1wb3J0IFB1cmVSZW5kZXJNaXhpbiBmcm9tICcuLi9yYy1jb21wb25lbnRzL3V0aWwvUHVyZVJlbmRlck1peGluJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSXRlbSBleHRlbmRzIENvbXBvbmVudDxhbnksIGFueT4ge1xuICBzaG91bGRDb21wb25lbnRVcGRhdGUoLi4uYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHJlbmRlcmVkVGV4dCwgcmVuZGVyZWRFbCwgaXRlbSwgbGF6eSwgY2hlY2tlZCwgcHJlZml4Q2xzLCBvbkNsaWNrIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyh7XG4gICAgICBbYCR7cHJlZml4Q2xzfS1jb250ZW50LWl0ZW1gXTogdHJ1ZSxcbiAgICAgIFtgJHtwcmVmaXhDbHN9LWNvbnRlbnQtaXRlbS1kaXNhYmxlZGBdOiBpdGVtLmRpc2FibGVkLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGlzdEl0ZW0gPSAoXG4gICAgICA8bGlcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgIHRpdGxlPXtyZW5kZXJlZFRleHR9XG4gICAgICAgIG9uQ2xpY2s9e2l0ZW0uZGlzYWJsZWQgPyB1bmRlZmluZWQgOiAoKSA9PiBvbkNsaWNrKGl0ZW0pfVxuICAgICAgPlxuICAgICAgICA8Q2hlY2tib3ggY2hlY2tlZD17Y2hlY2tlZH0gZGlzYWJsZWQ9e2l0ZW0uZGlzYWJsZWR9IC8+XG4gICAgICAgIDxzcGFuPntyZW5kZXJlZEVsfTwvc3Bhbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgICBsZXQgY2hpbGRyZW46IEpTWC5FbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKGxhenkpIHtcbiAgICAgIGNvbnN0IGxhenlQcm9wcyA9IHtcbiAgICAgICAgaGVpZ2h0OiAzMixcbiAgICAgICAgb2Zmc2V0OiA1MDAsXG4gICAgICAgIHRocm90dGxlOiAwLFxuICAgICAgICBkZWJvdW5jZTogZmFsc2UsXG4gICAgICAgIC4uLmxhenksXG4gICAgICB9O1xuICAgICAgY2hpbGRyZW4gPSA8TGF6eWxvYWQgey4uLmxhenlQcm9wc30+e2xpc3RJdGVtfTwvTGF6eWxvYWQ+O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbiA9IGxpc3RJdGVtO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9