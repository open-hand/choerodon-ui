import { __decorate } from "tslib";
import React, { Component } from 'react';
import { observer } from 'mobx-react';
const Toolbar = (props) => {
    const { id, prefixCls } = props;
    return (React.createElement("div", { id: id || 'toolbar', className: `${prefixCls}-toolbar` },
        React.createElement("button", { type: "button", className: "ql-bold" }),
        React.createElement("button", { type: "button", className: "ql-italic" }),
        React.createElement("button", { type: "button", className: "ql-underline" }),
        React.createElement("button", { type: "button", className: "ql-strike" }),
        React.createElement("button", { type: "button", className: "ql-blockquote" }),
        React.createElement("button", { type: "button", className: "ql-list", value: "ordered" }),
        React.createElement("button", { type: "button", className: "ql-list", value: "bullet" }),
        React.createElement("button", { type: "button", className: "ql-image" }),
        React.createElement("button", { type: "button", className: "ql-link" }),
        React.createElement("select", { className: "ql-color" })));
};
let RichTextToolbar = class RichTextToolbar extends Component {
    renderToolBar(props) {
        const { prefixCls } = this.props;
        return React.createElement(Toolbar, Object.assign({ key: "toolbar", prefixCls: prefixCls }, props));
    }
    render() {
        const { id, toolbar, dataSet } = this.props;
        const props = {
            id,
            dataSet,
        };
        if (typeof toolbar === 'function') {
            return toolbar(props);
        }
        switch (toolbar) {
            case "normal" /* normal */:
                return this.renderToolBar(props);
            default:
                return null;
        }
    }
};
RichTextToolbar.displayName = 'RichTextToolbar';
RichTextToolbar = __decorate([
    observer
], RichTextToolbar);
export default RichTextToolbar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3JpY2gtdGV4dC90b29sYmFyL2luZGV4LnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQVl0QyxNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ3hCLE1BQU0sRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ2hDLE9BQU8sQ0FDTCw2QkFBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLFVBQVU7UUFDekQsZ0NBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsU0FBUyxHQUFHO1FBQzVDLGdDQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLFdBQVcsR0FBRztRQUM5QyxnQ0FBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxjQUFjLEdBQUc7UUFDakQsZ0NBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsV0FBVyxHQUFHO1FBQzlDLGdDQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLGVBQWUsR0FBRztRQUNsRCxnQ0FBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLFNBQVMsR0FBRztRQUM1RCxnQ0FBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLFFBQVEsR0FBRztRQUMzRCxnQ0FBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxVQUFVLEdBQUc7UUFDN0MsZ0NBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsU0FBUyxHQUFHO1FBQzVDLGdDQUFRLFNBQVMsRUFBQyxVQUFVLEdBQUcsQ0FDM0IsQ0FDUCxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBR0YsSUFBcUIsZUFBZSxHQUFwQyxNQUFxQixlQUFnQixTQUFRLFNBQStCO0lBRzFFLGFBQWEsQ0FBQyxLQUErQjtRQUMzQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxPQUFPLG9CQUFDLE9BQU8sa0JBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUUsU0FBUyxJQUFNLEtBQUssRUFBSSxDQUFDO0lBQ3BFLENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM1QyxNQUFNLEtBQUssR0FBNkI7WUFDdEMsRUFBRTtZQUNGLE9BQU87U0FDUixDQUFDO1FBQ0YsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7WUFDakMsT0FBUSxPQUErQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsUUFBUSxPQUFPLEVBQUU7WUFDZjtnQkFDRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkM7Z0JBQ0UsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNILENBQUM7Q0FDRixDQUFBO0FBdkJRLDJCQUFXLEdBQUcsaUJBQWlCLENBQUM7QUFEcEIsZUFBZTtJQURuQyxRQUFRO0dBQ1ksZUFBZSxDQXdCbkM7ZUF4Qm9CLGVBQWUiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3JpY2gtdGV4dC90b29sYmFyL2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7IFJpY2hUZXh0VG9vbGJhckhvb2ssIFJpY2hUZXh0VG9vbGJhckhvb2tQcm9wcyB9IGZyb20gJy4uL1JpY2hUZXh0JztcbmltcG9ydCB7IFJpY2hUZXh0VG9vbGJhclR5cGUgfSBmcm9tICcuLi9lbnVtJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uLy4uL2RhdGEtc2V0L0RhdGFTZXQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJpY2hUZXh0VG9vbGJhclByb3BzIHtcbiAgcHJlZml4Q2xzPzogc3RyaW5nO1xuICBpZD86IHN0cmluZztcbiAgdG9vbGJhcj86IFJpY2hUZXh0VG9vbGJhclR5cGUgfCBSaWNoVGV4dFRvb2xiYXJIb29rO1xuICBkYXRhU2V0PzogRGF0YVNldDtcbn1cblxuY29uc3QgVG9vbGJhciA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IGlkLCBwcmVmaXhDbHMgfSA9IHByb3BzO1xuICByZXR1cm4gKFxuICAgIDxkaXYgaWQ9e2lkIHx8ICd0b29sYmFyJ30gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXRvb2xiYXJgfT5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInFsLWJvbGRcIiAvPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwicWwtaXRhbGljXCIgLz5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInFsLXVuZGVybGluZVwiIC8+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJxbC1zdHJpa2VcIiAvPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwicWwtYmxvY2txdW90ZVwiIC8+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJxbC1saXN0XCIgdmFsdWU9XCJvcmRlcmVkXCIgLz5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cInFsLWxpc3RcIiB2YWx1ZT1cImJ1bGxldFwiIC8+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJxbC1pbWFnZVwiIC8+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJxbC1saW5rXCIgLz5cbiAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwicWwtY29sb3JcIiAvPlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSaWNoVGV4dFRvb2xiYXIgZXh0ZW5kcyBDb21wb25lbnQ8UmljaFRleHRUb29sYmFyUHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ1JpY2hUZXh0VG9vbGJhcic7XG5cbiAgcmVuZGVyVG9vbEJhcihwcm9wczogUmljaFRleHRUb29sYmFySG9va1Byb3BzKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIDxUb29sYmFyIGtleT1cInRvb2xiYXJcIiBwcmVmaXhDbHM9e3ByZWZpeENsc30gey4uLnByb3BzfSAvPjtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGlkLCB0b29sYmFyLCBkYXRhU2V0IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHByb3BzOiBSaWNoVGV4dFRvb2xiYXJIb29rUHJvcHMgPSB7XG4gICAgICBpZCxcbiAgICAgIGRhdGFTZXQsXG4gICAgfTtcbiAgICBpZiAodHlwZW9mIHRvb2xiYXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAodG9vbGJhciBhcyBSaWNoVGV4dFRvb2xiYXJIb29rKShwcm9wcyk7XG4gICAgfVxuICAgIHN3aXRjaCAodG9vbGJhcikge1xuICAgICAgY2FzZSBSaWNoVGV4dFRvb2xiYXJUeXBlLm5vcm1hbDpcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9vbEJhcihwcm9wcyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==