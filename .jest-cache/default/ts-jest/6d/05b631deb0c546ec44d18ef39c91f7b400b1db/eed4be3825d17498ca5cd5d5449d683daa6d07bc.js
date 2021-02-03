import { __decorate } from "tslib";
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { TextField } from '../text-field/TextField';
import { $l } from '../locale-context';
let EmailField = class EmailField extends TextField {
    constructor() {
        super(...arguments);
        this.type = 'email';
    }
    getFieldType() {
        return "email" /* email */;
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('EmailField', label ? 'value_missing' : 'value_missing_no_label', { label }),
            typeMismatch: $l('EmailField', 'type_mismatch'),
        };
    }
};
EmailField.displayName = 'EmailField';
__decorate([
    computed
], EmailField.prototype, "defaultValidationMessages", null);
EmailField = __decorate([
    observer
], EmailField);
export default EmailField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2VtYWlsLWZpZWxkL0VtYWlsRmllbGQudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDaEMsT0FBTyxFQUFFLFNBQVMsRUFBa0IsTUFBTSx5QkFBeUIsQ0FBQztBQUVwRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNdkMsSUFBcUIsVUFBVSxHQUEvQixNQUFxQixVQUFXLFNBQVEsU0FBMEI7SUFBbEU7O1FBR0UsU0FBSSxHQUFXLE9BQU8sQ0FBQztJQWN6QixDQUFDO0lBWkMsWUFBWTtRQUNWLDJCQUF1QjtJQUN6QixDQUFDO0lBR0QsSUFBSSx5QkFBeUI7UUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxPQUFPO1lBQ0wsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDN0YsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDO1NBQ2hELENBQUM7SUFDSixDQUFDO0NBQ0YsQ0FBQTtBQWhCUSxzQkFBVyxHQUFHLFlBQVksQ0FBQztBQVNsQztJQURDLFFBQVE7MkRBT1I7QUFoQmtCLFVBQVU7SUFEOUIsUUFBUTtHQUNZLFVBQVUsQ0FpQjlCO2VBakJvQixVQUFVIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9lbWFpbC1maWVsZC9FbWFpbEZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgY29tcHV0ZWQgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IFRleHRGaWVsZCwgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICcuLi90ZXh0LWZpZWxkL1RleHRGaWVsZCc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uTWVzc2FnZXMgfSBmcm9tICcuLi92YWxpZGF0b3IvVmFsaWRhdG9yJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgRmllbGRUeXBlIH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW1haWxGaWVsZFByb3BzIGV4dGVuZHMgVGV4dEZpZWxkUHJvcHMge31cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbWFpbEZpZWxkIGV4dGVuZHMgVGV4dEZpZWxkPEVtYWlsRmllbGRQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnRW1haWxGaWVsZCc7XG5cbiAgdHlwZTogc3RyaW5nID0gJ2VtYWlsJztcblxuICBnZXRGaWVsZFR5cGUoKTogRmllbGRUeXBlIHtcbiAgICByZXR1cm4gRmllbGRUeXBlLmVtYWlsO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzKCk6IFZhbGlkYXRpb25NZXNzYWdlcyB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldFByb3AoJ2xhYmVsJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlTWlzc2luZzogJGwoJ0VtYWlsRmllbGQnLCBsYWJlbCA/ICd2YWx1ZV9taXNzaW5nJyA6ICd2YWx1ZV9taXNzaW5nX25vX2xhYmVsJywgeyBsYWJlbCB9KSxcbiAgICAgIHR5cGVNaXNtYXRjaDogJGwoJ0VtYWlsRmllbGQnLCAndHlwZV9taXNtYXRjaCcpLFxuICAgIH07XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==