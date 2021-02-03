import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import formatReactTemplate from '../../formatter/formatReactTemplate';
export default function tooLong(value, props) {
    const { maxLength, defaultValidationMessages } = props;
    if (!isEmpty(value)) {
        const { length } = value.toString();
        if (!!maxLength && maxLength > 0 && length > maxLength) {
            const injectionOptions = { maxLength, length };
            const ruleName = 'tooLong';
            const { [ruleName]: validationMessage = $l('Validator', 'too_long'), } = defaultValidationMessages;
            return new ValidationResult({
                validationMessage: formatReactTemplate(validationMessage, injectionOptions),
                injectionOptions,
                value,
                ruleName,
            });
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3ZhbGlkYXRvci9ydWxlcy90b29Mb25nLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxxQkFBcUIsQ0FBQztBQUMxQyxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUUxQyxPQUFPLG1CQUFtQixNQUFNLHFDQUFxQyxDQUFDO0FBRXRFLE1BQU0sQ0FBQyxPQUFPLFVBQVUsT0FBTyxDQUFDLEtBQVUsRUFBRSxLQUFxQjtJQUMvRCxNQUFNLEVBQUUsU0FBUyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO1lBQ3RELE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzNCLE1BQU0sRUFDSixDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQzVELEdBQUcseUJBQXlCLENBQUM7WUFDOUIsT0FBTyxJQUFJLGdCQUFnQixDQUFDO2dCQUMxQixpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDM0UsZ0JBQWdCO2dCQUNoQixLQUFLO2dCQUNMLFFBQVE7YUFDVCxDQUFDLENBQUM7U0FDSjtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby92YWxpZGF0b3IvcnVsZXMvdG9vTG9uZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGlzRW1wdHkgZnJvbSAnLi4vLi4vX3V0aWwvaXNFbXB0eSc7XG5pbXBvcnQgVmFsaWRhdGlvblJlc3VsdCBmcm9tICcuLi9WYWxpZGF0aW9uUmVzdWx0JztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgbWV0aG9kUmV0dXJuLCBWYWxpZGF0b3JQcm9wcyB9IGZyb20gJy4nO1xuaW1wb3J0IGZvcm1hdFJlYWN0VGVtcGxhdGUgZnJvbSAnLi4vLi4vZm9ybWF0dGVyL2Zvcm1hdFJlYWN0VGVtcGxhdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b29Mb25nKHZhbHVlOiBhbnksIHByb3BzOiBWYWxpZGF0b3JQcm9wcyk6IG1ldGhvZFJldHVybiB7XG4gIGNvbnN0IHsgbWF4TGVuZ3RoLCBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzIH0gPSBwcm9wcztcbiAgaWYgKCFpc0VtcHR5KHZhbHVlKSkge1xuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIGlmICghIW1heExlbmd0aCAmJiBtYXhMZW5ndGggPiAwICYmIGxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgY29uc3QgaW5qZWN0aW9uT3B0aW9ucyA9IHsgbWF4TGVuZ3RoLCBsZW5ndGggfTtcbiAgICAgIGNvbnN0IHJ1bGVOYW1lID0gJ3Rvb0xvbmcnO1xuICAgICAgY29uc3Qge1xuICAgICAgICBbcnVsZU5hbWVdOiB2YWxpZGF0aW9uTWVzc2FnZSA9ICRsKCdWYWxpZGF0b3InLCAndG9vX2xvbmcnKSxcbiAgICAgIH0gPSBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzO1xuICAgICAgcmV0dXJuIG5ldyBWYWxpZGF0aW9uUmVzdWx0KHtcbiAgICAgICAgdmFsaWRhdGlvbk1lc3NhZ2U6IGZvcm1hdFJlYWN0VGVtcGxhdGUodmFsaWRhdGlvbk1lc3NhZ2UsIGluamVjdGlvbk9wdGlvbnMpLFxuICAgICAgICBpbmplY3Rpb25PcHRpb25zLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgcnVsZU5hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4iXSwidmVyc2lvbiI6M30=