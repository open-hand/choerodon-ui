import { __decorate } from "tslib";
import { action, computed, observable } from 'mobx';
export default class Validity {
    constructor(props) {
        this.init(props);
    }
    get valid() {
        return Object.keys(this)
            .filter(key => key !== 'valid')
            .every(key => !this[key]);
    }
    reset() {
        this.init();
    }
    init(props) {
        this.badInput = false;
        this.customError = false;
        this.patternMismatch = false;
        this.rangeOverflow = false;
        this.rangeUnderflow = false;
        this.stepMismatch = false;
        this.tooLong = false;
        this.tooShort = false;
        this.typeMismatch = false;
        this.valueMissing = false;
        this.uniqueError = false;
        if (props) {
            Object.assign(this, props);
        }
    }
}
__decorate([
    observable
], Validity.prototype, "badInput", void 0);
__decorate([
    observable
], Validity.prototype, "customError", void 0);
__decorate([
    observable
], Validity.prototype, "patternMismatch", void 0);
__decorate([
    observable
], Validity.prototype, "rangeOverflow", void 0);
__decorate([
    observable
], Validity.prototype, "rangeUnderflow", void 0);
__decorate([
    observable
], Validity.prototype, "stepMismatch", void 0);
__decorate([
    observable
], Validity.prototype, "tooLong", void 0);
__decorate([
    observable
], Validity.prototype, "tooShort", void 0);
__decorate([
    observable
], Validity.prototype, "typeMismatch", void 0);
__decorate([
    observable
], Validity.prototype, "valueMissing", void 0);
__decorate([
    observable
], Validity.prototype, "uniqueError", void 0);
__decorate([
    computed
], Validity.prototype, "valid", null);
__decorate([
    action
], Validity.prototype, "init", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3ZhbGlkYXRvci9WYWxpZGl0eS50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwRCxNQUFNLENBQUMsT0FBTyxPQUFPLFFBQVE7SUE4QjNCLFlBQVksS0FBYztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFSRCxJQUFJLEtBQUs7UUFDUCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUM7YUFDOUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBTUQsS0FBSztRQUNILElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFHRCxJQUFJLENBQUMsS0FBYztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLEtBQUssRUFBRTtZQUNULE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQztDQUNGO0FBdERhO0lBQVgsVUFBVTswQ0FBbUI7QUFFbEI7SUFBWCxVQUFVOzZDQUFzQjtBQUVyQjtJQUFYLFVBQVU7aURBQTBCO0FBRXpCO0lBQVgsVUFBVTsrQ0FBd0I7QUFFdkI7SUFBWCxVQUFVO2dEQUF5QjtBQUV4QjtJQUFYLFVBQVU7OENBQXVCO0FBRXRCO0lBQVgsVUFBVTt5Q0FBa0I7QUFFakI7SUFBWCxVQUFVOzBDQUFtQjtBQUVsQjtJQUFYLFVBQVU7OENBQXVCO0FBRXRCO0lBQVgsVUFBVTs4Q0FBdUI7QUFFdEI7SUFBWCxVQUFVOzZDQUFzQjtBQUdqQztJQURDLFFBQVE7cUNBS1I7QUFXRDtJQURDLE1BQU07b0NBZ0JOIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby92YWxpZGF0b3IvVmFsaWRpdHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQsIG9ic2VydmFibGUgfSBmcm9tICdtb2J4JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRpdHkge1xuICBAb2JzZXJ2YWJsZSBiYWRJbnB1dDogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSBjdXN0b21FcnJvcjogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSBwYXR0ZXJuTWlzbWF0Y2g6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgcmFuZ2VPdmVyZmxvdzogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSByYW5nZVVuZGVyZmxvdzogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSBzdGVwTWlzbWF0Y2g6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgdG9vTG9uZzogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSB0b29TaG9ydDogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSB0eXBlTWlzbWF0Y2g6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgdmFsdWVNaXNzaW5nOiBib29sZWFuO1xuXG4gIEBvYnNlcnZhYmxlIHVuaXF1ZUVycm9yOiBib29sZWFuO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMpXG4gICAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09ICd2YWxpZCcpXG4gICAgICAuZXZlcnkoa2V5ID0+ICF0aGlzW2tleV0pO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHM/OiBvYmplY3QpIHtcbiAgICB0aGlzLmluaXQocHJvcHMpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGluaXQocHJvcHM/OiBvYmplY3QpIHtcbiAgICB0aGlzLmJhZElucHV0ID0gZmFsc2U7XG4gICAgdGhpcy5jdXN0b21FcnJvciA9IGZhbHNlO1xuICAgIHRoaXMucGF0dGVybk1pc21hdGNoID0gZmFsc2U7XG4gICAgdGhpcy5yYW5nZU92ZXJmbG93ID0gZmFsc2U7XG4gICAgdGhpcy5yYW5nZVVuZGVyZmxvdyA9IGZhbHNlO1xuICAgIHRoaXMuc3RlcE1pc21hdGNoID0gZmFsc2U7XG4gICAgdGhpcy50b29Mb25nID0gZmFsc2U7XG4gICAgdGhpcy50b29TaG9ydCA9IGZhbHNlO1xuICAgIHRoaXMudHlwZU1pc21hdGNoID0gZmFsc2U7XG4gICAgdGhpcy52YWx1ZU1pc3NpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnVuaXF1ZUVycm9yID0gZmFsc2U7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BzKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==