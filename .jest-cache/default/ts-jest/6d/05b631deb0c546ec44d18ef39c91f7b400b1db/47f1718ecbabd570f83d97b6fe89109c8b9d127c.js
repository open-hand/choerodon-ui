import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { TextField } from '../text-field/TextField';
import autobind from '../_util/autobind';
import Icon from '../icon';
// let selectionStart;
// let selectionEnd;
let Password = class Password extends TextField {
    constructor() {
        super(...arguments);
        this.type = 'password';
    }
    getOtherProps() {
        return omit(super.getOtherProps(), ['reveal']);
    }
    getOtherPrevNode() {
        return React.createElement("input", { tabIndex: -1, className: `${this.prefixCls}-fix-autofill` });
    }
    getInnerSpanButton() {
        const { reveal } = this.props;
        if (reveal) {
            return this.wrapperInnerSpanButton(React.createElement(Icon, { type: this.reveal ? 'visibility' : 'visibility_off', onClick: this.handleToggleReveal }));
        }
    }
    handleToggleReveal(e) {
        e.preventDefault();
        if (!this.isFocused) {
            this.focus();
        }
        const target = this.element;
        if (target) {
            if (target.type === 'password') {
                this.doReveal(target);
            }
            else {
                this.resetReveal(target);
            }
        }
    }
    doReveal(target) {
        this.selectionEnd = target.selectionEnd;
        this.selectionStart = target.selectionStart;
        target.type = 'text';
        this.type = target.type;
        this.reveal = true;
    }
    resetReveal(target) {
        const { selectionStart, selectionEnd } = this;
        target.type = 'password';
        this.type = target.type;
        if (typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
            target.setSelectionRange(selectionStart, selectionEnd);
            this.selectionStart = undefined;
            this.selectionEnd = undefined;
        }
        this.reveal = false;
    }
};
Password.displayName = 'Password';
Password.propTypes = {
    /**
     * 是否可揭示
     * @default true
     */
    reveal: PropTypes.bool,
    ...TextField.propTypes,
};
Password.defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'password',
    reveal: true,
};
__decorate([
    observable
], Password.prototype, "reveal", void 0);
__decorate([
    autobind
], Password.prototype, "handleToggleReveal", null);
__decorate([
    action
], Password.prototype, "doReveal", null);
__decorate([
    action
], Password.prototype, "resetReveal", null);
Password = __decorate([
    observer
], Password);
export default Password;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3Bhc3N3b3JkL1Bhc3N3b3JkLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFvQixNQUFNLE9BQU8sQ0FBQztBQUN6QyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBa0IsTUFBTSx5QkFBeUIsQ0FBQztBQUNwRSxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLElBQUksTUFBTSxTQUFTLENBQUM7QUFVM0Isc0JBQXNCO0FBQ3RCLG9CQUFvQjtBQUdwQixJQUFxQixRQUFRLEdBQTdCLE1BQXFCLFFBQVMsU0FBUSxTQUF3QjtJQUE5RDs7UUFrQkUsU0FBSSxHQUFXLFVBQVUsQ0FBQztJQWlFNUIsQ0FBQztJQXpEQyxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsT0FBTywrQkFBTyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsZUFBZSxHQUFJLENBQUM7SUFDOUUsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUNoQyxvQkFBQyxJQUFJLElBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQ25ELE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEdBQ2hDLENBQ0gsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQUdELGtCQUFrQixDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNkO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QixJQUFJLE1BQU0sRUFBRTtZQUNWLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDdkI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQjtTQUNGO0lBQ0gsQ0FBQztJQUdELFFBQVEsQ0FBQyxNQUFNO1FBQ2IsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM1QyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUdELFdBQVcsQ0FBQyxNQUFNO1FBQ2hCLE1BQU0sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUU7WUFDaEYsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztTQUMvQjtRQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLENBQUM7Q0FDRixDQUFBO0FBbEZRLG9CQUFXLEdBQUcsVUFBVSxDQUFDO0FBRXpCLGtCQUFTLEdBQUc7SUFDakI7OztPQUdHO0lBQ0gsTUFBTSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3RCLEdBQUcsU0FBUyxDQUFDLFNBQVM7Q0FDdkIsQ0FBQztBQUVLLHFCQUFZLEdBQUc7SUFDcEIsR0FBRyxTQUFTLENBQUMsWUFBWTtJQUN6QixTQUFTLEVBQUUsVUFBVTtJQUNyQixNQUFNLEVBQUUsSUFBSTtDQUNiLENBQUM7QUFJVTtJQUFYLFVBQVU7d0NBQWtCO0FBMkI3QjtJQURDLFFBQVE7a0RBY1I7QUFHRDtJQURDLE1BQU07d0NBT047QUFHRDtJQURDLE1BQU07MkNBV047QUFsRmtCLFFBQVE7SUFENUIsUUFBUTtHQUNZLFFBQVEsQ0FtRjVCO2VBbkZvQixRQUFRIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9wYXNzd29yZC9QYXNzd29yZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBUZXh0RmllbGQsIFRleHRGaWVsZFByb3BzIH0gZnJvbSAnLi4vdGV4dC1maWVsZC9UZXh0RmllbGQnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhc3N3b3JkUHJvcHMgZXh0ZW5kcyBUZXh0RmllbGRQcm9wcyB7XG4gIC8qKlxuICAgKiDmmK/lkKblj6/mj63npLpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgcmV2ZWFsPzogYm9vbGVhbjtcbn1cblxuLy8gbGV0IHNlbGVjdGlvblN0YXJ0O1xuLy8gbGV0IHNlbGVjdGlvbkVuZDtcblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXNzd29yZCBleHRlbmRzIFRleHRGaWVsZDxQYXNzd29yZFByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdQYXNzd29yZCc7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiDmmK/lkKblj6/mj63npLpcbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgcmV2ZWFsOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAuLi5UZXh0RmllbGQucHJvcFR5cGVzLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgLi4uVGV4dEZpZWxkLmRlZmF1bHRQcm9wcyxcbiAgICBzdWZmaXhDbHM6ICdwYXNzd29yZCcsXG4gICAgcmV2ZWFsOiB0cnVlLFxuICB9O1xuXG4gIHR5cGU6IHN0cmluZyA9ICdwYXNzd29yZCc7XG5cbiAgQG9ic2VydmFibGUgcmV2ZWFsPzogYm9vbGVhbjtcblxuICBzZWxlY3Rpb25FbmQ/OiBudW1iZXI7XG5cbiAgc2VsZWN0aW9uU3RhcnQ/OiBudW1iZXI7XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICByZXR1cm4gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFsncmV2ZWFsJ10pO1xuICB9XG5cbiAgZ2V0T3RoZXJQcmV2Tm9kZSgpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiA8aW5wdXQgdGFiSW5kZXg9ey0xfSBjbGFzc05hbWU9e2Ake3RoaXMucHJlZml4Q2xzfS1maXgtYXV0b2ZpbGxgfSAvPjtcbiAgfVxuXG4gIGdldElubmVyU3BhbkJ1dHRvbigpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgcmV2ZWFsIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChyZXZlYWwpIHtcbiAgICAgIHJldHVybiB0aGlzLndyYXBwZXJJbm5lclNwYW5CdXR0b24oXG4gICAgICAgIDxJY29uXG4gICAgICAgICAgdHlwZT17dGhpcy5yZXZlYWwgPyAndmlzaWJpbGl0eScgOiAndmlzaWJpbGl0eV9vZmYnfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlVG9nZ2xlUmV2ZWFsfVxuICAgICAgICAvPixcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVRvZ2dsZVJldmVhbChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5lbGVtZW50O1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQudHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICB0aGlzLmRvUmV2ZWFsKHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlc2V0UmV2ZWFsKHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBkb1JldmVhbCh0YXJnZXQpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkVuZCA9IHRhcmdldC5zZWxlY3Rpb25FbmQ7XG4gICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRhcmdldC5zZWxlY3Rpb25TdGFydDtcbiAgICB0YXJnZXQudHlwZSA9ICd0ZXh0JztcbiAgICB0aGlzLnR5cGUgPSB0YXJnZXQudHlwZTtcbiAgICB0aGlzLnJldmVhbCA9IHRydWU7XG4gIH1cblxuICBAYWN0aW9uXG4gIHJlc2V0UmV2ZWFsKHRhcmdldCkge1xuICAgIGNvbnN0IHsgc2VsZWN0aW9uU3RhcnQsIHNlbGVjdGlvbkVuZCB9ID0gdGhpcztcbiAgICB0YXJnZXQudHlwZSA9ICdwYXNzd29yZCc7XG4gICAgdGhpcy50eXBlID0gdGFyZ2V0LnR5cGU7XG4gICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHNlbGVjdGlvbkVuZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRhcmdldC5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcbiAgICAgIHRoaXMuc2VsZWN0aW9uU3RhcnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNlbGVjdGlvbkVuZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5yZXZlYWwgPSBmYWxzZTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9