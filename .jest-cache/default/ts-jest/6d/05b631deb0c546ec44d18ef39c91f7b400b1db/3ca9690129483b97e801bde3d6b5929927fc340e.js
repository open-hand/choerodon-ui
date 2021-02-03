import { __decorate } from "tslib";
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { TextField } from '../text-field/TextField';
import { $l } from '../locale-context';
let UrlField = class UrlField extends TextField {
    constructor() {
        super(...arguments);
        this.type = 'url';
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('UrlField', label ? 'value_missing' : 'value_missing_no_label', { label }),
            typeMismatch: $l('UrlField', 'type_mismatch'),
        };
    }
    getFieldType() {
        return "url" /* url */;
    }
};
UrlField.displayName = 'UrlField';
__decorate([
    computed
], UrlField.prototype, "defaultValidationMessages", null);
UrlField = __decorate([
    observer
], UrlField);
export default UrlField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3VybC1maWVsZC9VcmxGaWVsZC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLHlCQUF5QixDQUFDO0FBRXBFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU12QyxJQUFxQixRQUFRLEdBQTdCLE1BQXFCLFFBQVMsU0FBUSxTQUF3QjtJQUE5RDs7UUFHRSxTQUFJLEdBQVcsS0FBSyxDQUFDO0lBY3ZCLENBQUM7SUFYQyxJQUFJLHlCQUF5QjtRQUMzQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLE9BQU87WUFDTCxZQUFZLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUMzRixZQUFZLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUM7U0FDOUMsQ0FBQztJQUNKLENBQUM7SUFFRCxZQUFZO1FBQ1YsdUJBQXFCO0lBQ3ZCLENBQUM7Q0FDRixDQUFBO0FBaEJRLG9CQUFXLEdBQUcsVUFBVSxDQUFDO0FBS2hDO0lBREMsUUFBUTt5REFPUjtBQVprQixRQUFRO0lBRDVCLFFBQVE7R0FDWSxRQUFRLENBaUI1QjtlQWpCb0IsUUFBUSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vdXJsLWZpZWxkL1VybEZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgY29tcHV0ZWQgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IFRleHRGaWVsZCwgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICcuLi90ZXh0LWZpZWxkL1RleHRGaWVsZCc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uTWVzc2FnZXMgfSBmcm9tICcuLi92YWxpZGF0b3IvVmFsaWRhdG9yJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgRmllbGRUeXBlIH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXJsRmllbGRQcm9wcyBleHRlbmRzIFRleHRGaWVsZFByb3BzIHt9XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXJsRmllbGQgZXh0ZW5kcyBUZXh0RmllbGQ8VXJsRmllbGRQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVXJsRmllbGQnO1xuXG4gIHR5cGU6IHN0cmluZyA9ICd1cmwnO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgZGVmYXVsdFZhbGlkYXRpb25NZXNzYWdlcygpOiBWYWxpZGF0aW9uTWVzc2FnZXMge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRQcm9wKCdsYWJlbCcpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZU1pc3Npbmc6ICRsKCdVcmxGaWVsZCcsIGxhYmVsID8gJ3ZhbHVlX21pc3NpbmcnIDogJ3ZhbHVlX21pc3Npbmdfbm9fbGFiZWwnLCB7IGxhYmVsIH0pLFxuICAgICAgdHlwZU1pc21hdGNoOiAkbCgnVXJsRmllbGQnLCAndHlwZV9taXNtYXRjaCcpLFxuICAgIH07XG4gIH1cblxuICBnZXRGaWVsZFR5cGUoKTogRmllbGRUeXBlIHtcbiAgICByZXR1cm4gRmllbGRUeXBlLnVybDtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9