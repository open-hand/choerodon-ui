import { __decorate } from "tslib";
import React from 'react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import isString from 'lodash/isString';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import { getConfig } from 'choerodon-ui/lib/configure';
import Validity from './Validity';
import ValidationResult from './ValidationResult';
import validationRules from './rules';
import valueMissing from './rules/valueMissing';
import getReactNodeText from '../_util/getReactNodeText';
export default class Validator {
    constructor(field, control) {
        runInAction(() => {
            this.field = field;
            this.control = control;
            this.innerValidationResults = [];
        });
    }
    get props() {
        const { control, field } = this;
        const controlProps = control && omitBy(control.getValidatorProps(), isUndefined);
        const fieldProps = field && field.getValidatorProps();
        return {
            ...fieldProps,
            ...controlProps,
            defaultValidationMessages: {
                ...(controlProps && controlProps.defaultValidationMessages),
                ...getConfig('defaultValidationMessages'),
                ...(fieldProps && fieldProps.defaultValidationMessages),
            },
        };
    }
    get uniqueRefFields() {
        const { name, unique, record } = this.props;
        if (record && isString(unique)) {
            return [...record.fields.values()].filter(field => field.name !== name &&
                field.get('unique') === unique &&
                !field.get('multiple') &&
                !field.get('range'));
        }
        return [];
    }
    // @computed
    // private get bindingFieldWithValidationResult(): Field | undefined {
    //   const { name, record, type } = this.props;
    //   if (record && name && type === FieldType.object) {
    //     return findBindField(name, record.fields, field => !field.isValid());
    //   }
    //   return undefined;
    // }
    get uniqueRefValidationResult() {
        const { uniqueRefFields } = this;
        let validationResult;
        if (uniqueRefFields.length &&
            this.innerValidationResults.every(result => result.ruleName !== 'uniqueError')) {
            uniqueRefFields.some(uniqueRefField => {
                validationResult = uniqueRefField.validator.innerValidationResults.find(result => result.ruleName === 'uniqueError');
                return !!validationResult;
            });
        }
        return validationResult;
    }
    get validationResults() {
        const { uniqueRefValidationResult } = this;
        if (uniqueRefValidationResult) {
            return [uniqueRefValidationResult];
        }
        const { innerValidationResults } = this;
        if (innerValidationResults.length) {
            return innerValidationResults;
        }
        // const { bindingFieldWithValidationResult } = this;
        // if (bindingFieldWithValidationResult) {
        //   return bindingFieldWithValidationResult.getValidationErrorValues();
        // }
        return [];
    }
    get currentValidationResult() {
        const { validationResults } = this;
        return validationResults.length ? validationResults[0] : undefined;
    }
    get validity() {
        const { currentValidationResult } = this;
        return new Validity(currentValidationResult ? { [currentValidationResult.ruleName]: true } : undefined);
    }
    get injectionOptions() {
        const { currentValidationResult } = this;
        return (currentValidationResult && currentValidationResult.injectionOptions) || {};
    }
    get validationMessage() {
        const { currentValidationResult } = this;
        return currentValidationResult && currentValidationResult.validationMessage;
    }
    reset() {
        this.clearErrors();
        const { uniqueRefFields } = this;
        if (uniqueRefFields.length) {
            uniqueRefFields.forEach(uniqueRefField => uniqueRefField.validator.clearErrors());
        }
    }
    async report(ret) {
        const { name, dataSet, record } = this.props;
        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            const { validationMessage, value } = ret;
            const reportMessage = [
                'validation:',
                isString(validationMessage)
                    ? validationMessage
                    : await getReactNodeText(React.createElement("span", null, validationMessage)),
            ];
            if (dataSet) {
                const { name: dsName, id } = dataSet;
                if (dsName || id) {
                    reportMessage.push(`
[dataSet<${dsName || id}>]:`, dataSet);
                }
                else {
                    reportMessage.push('\n[dataSet]:', dataSet);
                }
            }
            if (record) {
                if (dataSet) {
                    reportMessage.push(`
[record<${dataSet.indexOf(record)}>]:`, record);
                }
                else {
                    reportMessage.push(`\n[record]:`, record);
                }
                reportMessage.push(`
[field<${name}>]:`, record.getField(name));
            }
            else {
                reportMessage.push('[field]:', name);
            }
            reportMessage.push('\n[value]:', value);
            console.warn(...reportMessage);
        }
    }
    clearErrors() {
        this.innerValidationResults = [];
    }
    addError(result) {
        this.innerValidationResults.push(result);
        this.report(result);
    }
    async execute(rules, value) {
        const { props } = this;
        const method = rules.shift();
        if (method) {
            const results = await Promise.all(value.map(item => method(item, props)));
            results.forEach(result => {
                if (result instanceof ValidationResult) {
                    this.addError(result);
                    const index = value.indexOf(result.value);
                    if (index !== -1) {
                        value.splice(index, 1);
                    }
                }
            });
            if (value.length) {
                await this.execute(rules, value);
            }
        }
    }
    async checkValidity(value = null) {
        const valueMiss = valueMissing(value, this.props);
        this.clearErrors();
        if (valueMiss !== true) {
            this.addError(valueMiss);
        }
        else {
            const { multiple } = this.props;
            await this.execute(validationRules.slice(), multiple && isArrayLike(value) ? value.slice() : [value]);
        }
        return this.validity.valid;
    }
}
__decorate([
    observable
], Validator.prototype, "field", void 0);
__decorate([
    observable
], Validator.prototype, "control", void 0);
__decorate([
    observable
], Validator.prototype, "innerValidationResults", void 0);
__decorate([
    computed
], Validator.prototype, "props", null);
__decorate([
    computed
], Validator.prototype, "uniqueRefFields", null);
__decorate([
    computed
], Validator.prototype, "uniqueRefValidationResult", null);
__decorate([
    computed
], Validator.prototype, "validationResults", null);
__decorate([
    computed
], Validator.prototype, "currentValidationResult", null);
__decorate([
    computed
], Validator.prototype, "validity", null);
__decorate([
    computed
], Validator.prototype, "injectionOptions", null);
__decorate([
    computed
], Validator.prototype, "validationMessage", null);
__decorate([
    action
], Validator.prototype, "reset", null);
__decorate([
    action
], Validator.prototype, "report", null);
__decorate([
    action
], Validator.prototype, "clearErrors", null);
__decorate([
    action
], Validator.prototype, "addError", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3ZhbGlkYXRvci9WYWxpZGF0b3IudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQW9CLE1BQU0sT0FBTyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlFLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sZ0JBQWdCLE1BQU0sb0JBQW9CLENBQUM7QUFHbEQsT0FBTyxlQUFpRSxNQUFNLFNBQVMsQ0FBQztBQUN4RixPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQztBQUNoRCxPQUFPLGdCQUFnQixNQUFNLDJCQUEyQixDQUFDO0FBNkJ6RCxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUE0RzVCLFlBQVksS0FBYSxFQUFFLE9BQXdCO1FBQ2pELFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQTFHRCxJQUFJLEtBQUs7UUFDUCxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztRQUNoQyxNQUFNLFlBQVksR0FBRyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FB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QUNuQixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQjthQUFNO1lBQ0wsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDaEMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUNoQixlQUFlLENBQUMsS0FBSyxFQUFFLEVBQ3ZCLFFBQVEsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDekQsQ0FBQztTQUNIO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUF6TmE7SUFBWCxVQUFVO3dDQUF1QjtBQUV0QjtJQUFYLFVBQVU7MENBQWtDO0FBRWpDO0lBQVgsVUFBVTt5REFBb0Q7QUFHL0Q7SUFEQyxRQUFRO3NDQWNSO0FBR0Q7SUFEQyxRQUFRO2dEQWFSO0FBWUQ7SUFEQyxRQUFROzBEQWdCUjtBQUdEO0lBREMsUUFBUTtrREFlUjtBQUdEO0lBREMsUUFBUTt3REFJUjtBQUdEO0lBREMsUUFBUTt5Q0FNUjtBQUdEO0lBREMsUUFBUTtpREFJUjtBQUdEO0lBREMsUUFBUTtrREFJUjtBQVdEO0lBREMsTUFBTTtzQ0FPTjtBQUdEO0lBREMsTUFBTTt1Q0E0Q047QUFHRDtJQURDLE1BQU07NENBR047QUFHRDtJQURDLE1BQU07eUNBSU4iLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3ZhbGlkYXRvci9WYWxpZGF0b3IudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBhY3Rpb24sIGNvbXB1dGVkLCBpc0FycmF5TGlrZSwgb2JzZXJ2YWJsZSwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IG9taXRCeSBmcm9tICdsb2Rhc2gvb21pdEJ5JztcbmltcG9ydCBpc1VuZGVmaW5lZCBmcm9tICdsb2Rhc2gvaXNVbmRlZmluZWQnO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jb25maWd1cmUnO1xuaW1wb3J0IFZhbGlkaXR5IGZyb20gJy4vVmFsaWRpdHknO1xuaW1wb3J0IFZhbGlkYXRpb25SZXN1bHQgZnJvbSAnLi9WYWxpZGF0aW9uUmVzdWx0JztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi4vZGF0YS1zZXQvUmVjb3JkJztcbmltcG9ydCBGb3JtIGZyb20gJy4uL2Zvcm0vRm9ybSc7XG5pbXBvcnQgdmFsaWRhdGlvblJ1bGVzLCB7IG1ldGhvZFJldHVybiwgdmFsaWRhdGlvblJ1bGUsIFZhbGlkYXRvclByb3BzIH0gZnJvbSAnLi9ydWxlcyc7XG5pbXBvcnQgdmFsdWVNaXNzaW5nIGZyb20gJy4vcnVsZXMvdmFsdWVNaXNzaW5nJztcbmltcG9ydCBnZXRSZWFjdE5vZGVUZXh0IGZyb20gJy4uL191dGlsL2dldFJlYWN0Tm9kZVRleHQnO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uL2RhdGEtc2V0L0ZpZWxkJztcbmltcG9ydCB7IEZvcm1GaWVsZCB9IGZyb20gJy4uL2ZpZWxkL0Zvcm1GaWVsZCc7XG4vLyBpbXBvcnQgeyBGaWVsZFR5cGUgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcbi8vIGltcG9ydCB7IGZpbmRCaW5kRmllbGQgfSBmcm9tICcuLi9kYXRhLXNldC91dGlscyc7XG5cbmV4cG9ydCB0eXBlIEN1c3RvbVZhbGlkYXRvciA9IChcbiAgdmFsdWU6IGFueSxcbiAgbmFtZT86IHN0cmluZyxcbiAgcmVjb3JkPzogUmVjb3JkIHwgRm9ybSxcbikgPT4gUHJvbWlzZTxib29sZWFuIHwgc3RyaW5nIHwgdW5kZWZpbmVkPjtcblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uTWVzc2FnZXMge1xuICBiYWRJbnB1dD86IFJlYWN0Tm9kZTtcbiAgcGF0dGVybk1pc21hdGNoPzogUmVhY3ROb2RlO1xuICByYW5nZU92ZXJmbG93PzogUmVhY3ROb2RlO1xuICByYW5nZVVuZGVyZmxvdz86IFJlYWN0Tm9kZTtcbiAgc3RlcE1pc21hdGNoPzogUmVhY3ROb2RlO1xuICBzdGVwTWlzbWF0Y2hCZXR3ZWVuPzogUmVhY3ROb2RlO1xuICB0b29Mb25nPzogUmVhY3ROb2RlO1xuICB0b29TaG9ydD86IFJlYWN0Tm9kZTtcbiAgdHlwZU1pc21hdGNoPzogUmVhY3ROb2RlO1xuICB2YWx1ZU1pc3Npbmc/OiBSZWFjdE5vZGU7XG4gIHZhbHVlTWlzc2luZ05vTGFiZWw/OiBSZWFjdE5vZGU7XG4gIGN1c3RvbUVycm9yPzogUmVhY3ROb2RlO1xuICB1bmlxdWVFcnJvcj86IFJlYWN0Tm9kZTtcbiAgdW5rbm93bj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRhdG9yIHtcbiAgQG9ic2VydmFibGUgcHJpdmF0ZSBmaWVsZD86IEZpZWxkO1xuXG4gIEBvYnNlcnZhYmxlIHByaXZhdGUgY29udHJvbD86IEZvcm1GaWVsZDxhbnk+O1xuXG4gIEBvYnNlcnZhYmxlIHByaXZhdGUgaW5uZXJWYWxpZGF0aW9uUmVzdWx0czogVmFsaWRhdGlvblJlc3VsdFtdO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgcHJvcHMoKTogVmFsaWRhdG9yUHJvcHMge1xuICAgIGNvbnN0IHsgY29udHJvbCwgZmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgY29udHJvbFByb3BzID0gY29udHJvbCAmJiBvbWl0QnkoY29udHJvbC5nZXRWYWxpZGF0b3JQcm9wcygpLCBpc1VuZGVmaW5lZCk7XG4gICAgY29uc3QgZmllbGRQcm9wcyA9IGZpZWxkICYmIGZpZWxkLmdldFZhbGlkYXRvclByb3BzKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkUHJvcHMsXG4gICAgICAuLi5jb250cm9sUHJvcHMsXG4gICAgICBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzOiB7XG4gICAgICAgIC4uLihjb250cm9sUHJvcHMgJiYgY29udHJvbFByb3BzLmRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMpLFxuICAgICAgICAuLi5nZXRDb25maWcoJ2RlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMnKSxcbiAgICAgICAgLi4uKGZpZWxkUHJvcHMgJiYgZmllbGRQcm9wcy5kZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzKSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBwcml2YXRlIGdldCB1bmlxdWVSZWZGaWVsZHMoKTogRmllbGRbXSB7XG4gICAgY29uc3QgeyBuYW1lLCB1bmlxdWUsIHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAocmVjb3JkICYmIGlzU3RyaW5nKHVuaXF1ZSkpIHtcbiAgICAgIHJldHVybiBbLi4ucmVjb3JkLmZpZWxkcy52YWx1ZXMoKV0uZmlsdGVyKFxuICAgICAgICBmaWVsZCA9PlxuICAgICAgICAgIGZpZWxkLm5hbWUgIT09IG5hbWUgJiZcbiAgICAgICAgICBmaWVsZC5nZXQoJ3VuaXF1ZScpID09PSB1bmlxdWUgJiZcbiAgICAgICAgICAhZmllbGQuZ2V0KCdtdWx0aXBsZScpICYmXG4gICAgICAgICAgIWZpZWxkLmdldCgncmFuZ2UnKSxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIEBjb21wdXRlZFxuICAvLyBwcml2YXRlIGdldCBiaW5kaW5nRmllbGRXaXRoVmFsaWRhdGlvblJlc3VsdCgpOiBGaWVsZCB8IHVuZGVmaW5lZCB7XG4gIC8vICAgY29uc3QgeyBuYW1lLCByZWNvcmQsIHR5cGUgfSA9IHRoaXMucHJvcHM7XG4gIC8vICAgaWYgKHJlY29yZCAmJiBuYW1lICYmIHR5cGUgPT09IEZpZWxkVHlwZS5vYmplY3QpIHtcbiAgLy8gICAgIHJldHVybiBmaW5kQmluZEZpZWxkKG5hbWUsIHJlY29yZC5maWVsZHMsIGZpZWxkID0+ICFmaWVsZC5pc1ZhbGlkKCkpO1xuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gdW5kZWZpbmVkO1xuICAvLyB9XG5cbiAgQGNvbXB1dGVkXG4gIHByaXZhdGUgZ2V0IHVuaXF1ZVJlZlZhbGlkYXRpb25SZXN1bHQoKTogVmFsaWRhdGlvblJlc3VsdCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB1bmlxdWVSZWZGaWVsZHMgfSA9IHRoaXM7XG4gICAgbGV0IHZhbGlkYXRpb25SZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQgfCB1bmRlZmluZWQ7XG4gICAgaWYgKFxuICAgICAgdW5pcXVlUmVmRmllbGRzLmxlbmd0aCAmJlxuICAgICAgdGhpcy5pbm5lclZhbGlkYXRpb25SZXN1bHRzLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQucnVsZU5hbWUgIT09ICd1bmlxdWVFcnJvcicpXG4gICAgKSB7XG4gICAgICB1bmlxdWVSZWZGaWVsZHMuc29tZSh1bmlxdWVSZWZGaWVsZCA9PiB7XG4gICAgICAgIHZhbGlkYXRpb25SZXN1bHQgPSB1bmlxdWVSZWZGaWVsZC52YWxpZGF0b3IuaW5uZXJWYWxpZGF0aW9uUmVzdWx0cy5maW5kKFxuICAgICAgICAgIHJlc3VsdCA9PiByZXN1bHQucnVsZU5hbWUgPT09ICd1bmlxdWVFcnJvcicsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiAhIXZhbGlkYXRpb25SZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHZhbGlkYXRpb25SZXN1bHRzKCk6IFZhbGlkYXRpb25SZXN1bHRbXSB7XG4gICAgY29uc3QgeyB1bmlxdWVSZWZWYWxpZGF0aW9uUmVzdWx0IH0gPSB0aGlzO1xuICAgIGlmICh1bmlxdWVSZWZWYWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW3VuaXF1ZVJlZlZhbGlkYXRpb25SZXN1bHRdO1xuICAgIH1cbiAgICBjb25zdCB7IGlubmVyVmFsaWRhdGlvblJlc3VsdHMgfSA9IHRoaXM7XG4gICAgaWYgKGlubmVyVmFsaWRhdGlvblJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaW5uZXJWYWxpZGF0aW9uUmVzdWx0cztcbiAgICB9XG4gICAgLy8gY29uc3QgeyBiaW5kaW5nRmllbGRXaXRoVmFsaWRhdGlvblJlc3VsdCB9ID0gdGhpcztcbiAgICAvLyBpZiAoYmluZGluZ0ZpZWxkV2l0aFZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICAvLyAgIHJldHVybiBiaW5kaW5nRmllbGRXaXRoVmFsaWRhdGlvblJlc3VsdC5nZXRWYWxpZGF0aW9uRXJyb3JWYWx1ZXMoKTtcbiAgICAvLyB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjdXJyZW50VmFsaWRhdGlvblJlc3VsdCgpOiBWYWxpZGF0aW9uUmVzdWx0IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHZhbGlkYXRpb25SZXN1bHRzIH0gPSB0aGlzO1xuICAgIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0cy5sZW5ndGggPyB2YWxpZGF0aW9uUmVzdWx0c1swXSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsaWRpdHkoKTogVmFsaWRpdHkge1xuICAgIGNvbnN0IHsgY3VycmVudFZhbGlkYXRpb25SZXN1bHQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBWYWxpZGl0eShcbiAgICAgIGN1cnJlbnRWYWxpZGF0aW9uUmVzdWx0ID8geyBbY3VycmVudFZhbGlkYXRpb25SZXN1bHQucnVsZU5hbWVdOiB0cnVlIH0gOiB1bmRlZmluZWQsXG4gICAgKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaW5qZWN0aW9uT3B0aW9ucygpOiBvYmplY3Qge1xuICAgIGNvbnN0IHsgY3VycmVudFZhbGlkYXRpb25SZXN1bHQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChjdXJyZW50VmFsaWRhdGlvblJlc3VsdCAmJiBjdXJyZW50VmFsaWRhdGlvblJlc3VsdC5pbmplY3Rpb25PcHRpb25zKSB8fCB7fTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsaWRhdGlvbk1lc3NhZ2UoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IGN1cnJlbnRWYWxpZGF0aW9uUmVzdWx0IH0gPSB0aGlzO1xuICAgIHJldHVybiBjdXJyZW50VmFsaWRhdGlvblJlc3VsdCAmJiBjdXJyZW50VmFsaWRhdGlvblJlc3VsdC52YWxpZGF0aW9uTWVzc2FnZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGZpZWxkPzogRmllbGQsIGNvbnRyb2w/OiBGb3JtRmllbGQ8YW55Pikge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuZmllbGQgPSBmaWVsZDtcbiAgICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgICB0aGlzLmlubmVyVmFsaWRhdGlvblJlc3VsdHMgPSBbXTtcbiAgICB9KTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5jbGVhckVycm9ycygpO1xuICAgIGNvbnN0IHsgdW5pcXVlUmVmRmllbGRzIH0gPSB0aGlzO1xuICAgIGlmICh1bmlxdWVSZWZGaWVsZHMubGVuZ3RoKSB7XG4gICAgICB1bmlxdWVSZWZGaWVsZHMuZm9yRWFjaCh1bmlxdWVSZWZGaWVsZCA9PiB1bmlxdWVSZWZGaWVsZC52YWxpZGF0b3IuY2xlYXJFcnJvcnMoKSk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBhc3luYyByZXBvcnQocmV0OiBWYWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgY29uc3QgeyBuYW1lLCBkYXRhU2V0LCByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB7IHZhbGlkYXRpb25NZXNzYWdlLCB2YWx1ZSB9ID0gcmV0O1xuICAgICAgY29uc3QgcmVwb3J0TWVzc2FnZTogYW55W10gPSBbXG4gICAgICAgICd2YWxpZGF0aW9uOicsXG4gICAgICAgIGlzU3RyaW5nKHZhbGlkYXRpb25NZXNzYWdlKVxuICAgICAgICAgID8gdmFsaWRhdGlvbk1lc3NhZ2VcbiAgICAgICAgICA6IGF3YWl0IGdldFJlYWN0Tm9kZVRleHQoPHNwYW4+e3ZhbGlkYXRpb25NZXNzYWdlfTwvc3Bhbj4pLFxuICAgICAgXTtcbiAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgIGNvbnN0IHsgbmFtZTogZHNOYW1lLCBpZCB9ID0gZGF0YVNldDtcbiAgICAgICAgaWYgKGRzTmFtZSB8fCBpZCkge1xuICAgICAgICAgIHJlcG9ydE1lc3NhZ2UucHVzaChcbiAgICAgICAgICAgIGBcbltkYXRhU2V0PCR7ZHNOYW1lIHx8IGlkfT5dOmAsXG4gICAgICAgICAgICBkYXRhU2V0LFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVwb3J0TWVzc2FnZS5wdXNoKCdcXG5bZGF0YVNldF06JywgZGF0YVNldCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgICAgICByZXBvcnRNZXNzYWdlLnB1c2goXG4gICAgICAgICAgICBgXG5bcmVjb3JkPCR7ZGF0YVNldC5pbmRleE9mKHJlY29yZCl9Pl06YCxcbiAgICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcG9ydE1lc3NhZ2UucHVzaChgXFxuW3JlY29yZF06YCwgcmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgICByZXBvcnRNZXNzYWdlLnB1c2goXG4gICAgICAgICAgYFxuW2ZpZWxkPCR7bmFtZX0+XTpgLFxuICAgICAgICAgIHJlY29yZC5nZXRGaWVsZChuYW1lKSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcG9ydE1lc3NhZ2UucHVzaCgnW2ZpZWxkXTonLCBuYW1lKTtcbiAgICAgIH1cbiAgICAgIHJlcG9ydE1lc3NhZ2UucHVzaCgnXFxuW3ZhbHVlXTonLCB2YWx1ZSk7XG4gICAgICBjb25zb2xlLndhcm4oLi4ucmVwb3J0TWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBjbGVhckVycm9ycygpIHtcbiAgICB0aGlzLmlubmVyVmFsaWRhdGlvblJlc3VsdHMgPSBbXTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgYWRkRXJyb3IocmVzdWx0OiBWYWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgdGhpcy5pbm5lclZhbGlkYXRpb25SZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB0aGlzLnJlcG9ydChyZXN1bHQpO1xuICB9XG5cbiAgYXN5bmMgZXhlY3V0ZShydWxlczogdmFsaWRhdGlvblJ1bGVbXSwgdmFsdWU6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzO1xuICAgIGNvbnN0IG1ldGhvZCA9IHJ1bGVzLnNoaWZ0KCk7XG4gICAgaWYgKG1ldGhvZCkge1xuICAgICAgY29uc3QgcmVzdWx0czogbWV0aG9kUmV0dXJuW10gPSBhd2FpdCBQcm9taXNlLmFsbDxtZXRob2RSZXR1cm4+KFxuICAgICAgICB2YWx1ZS5tYXAoaXRlbSA9PiBtZXRob2QoaXRlbSwgcHJvcHMpKSxcbiAgICAgICk7XG4gICAgICByZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICAgICAgICB0aGlzLmFkZEVycm9yKHJlc3VsdCk7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB2YWx1ZS5pbmRleE9mKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgdmFsdWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHZhbHVlLmxlbmd0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGUocnVsZXMsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja1ZhbGlkaXR5KHZhbHVlOiBhbnkgPSBudWxsKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgdmFsdWVNaXNzOiBtZXRob2RSZXR1cm4gPSB2YWx1ZU1pc3NpbmcodmFsdWUsIHRoaXMucHJvcHMpO1xuICAgIHRoaXMuY2xlYXJFcnJvcnMoKTtcbiAgICBpZiAodmFsdWVNaXNzICE9PSB0cnVlKSB7XG4gICAgICB0aGlzLmFkZEVycm9yKHZhbHVlTWlzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHsgbXVsdGlwbGUgfSA9IHRoaXMucHJvcHM7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoXG4gICAgICAgIHZhbGlkYXRpb25SdWxlcy5zbGljZSgpLFxuICAgICAgICBtdWx0aXBsZSAmJiBpc0FycmF5TGlrZSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogW3ZhbHVlXSxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZhbGlkaXR5LnZhbGlkO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=