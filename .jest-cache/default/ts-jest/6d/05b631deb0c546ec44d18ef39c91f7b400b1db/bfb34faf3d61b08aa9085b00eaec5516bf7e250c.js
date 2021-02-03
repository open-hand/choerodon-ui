import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import formatReactTemplate from '../../formatter/formatReactTemplate';
export default function tooShort(value, props) {
    const { minLength, defaultValidationMessages } = props;
    if (!isEmpty(value)) {
        const { length } = value.toString();
        if (!!minLength && minLength > 0 && length < minLength) {
            const injectionOptions = { minLength, length };
            const ruleName = 'tooShort';
            const { [ruleName]: validationMessage = $l('Validator', 'too_short'), } = defaultValidationMessages;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3ZhbGlkYXRvci9ydWxlcy90b29TaG9ydC50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxnQkFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFMUMsT0FBTyxtQkFBbUIsTUFBTSxxQ0FBcUMsQ0FBQztBQUV0RSxNQUFNLENBQUMsT0FBTyxVQUFVLFFBQVEsQ0FBQyxLQUFVLEVBQUUsS0FBcUI7SUFDaEUsTUFBTSxFQUFFLFNBQVMsRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ25CLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksTUFBTSxHQUFHLFNBQVMsRUFBRTtZQUN0RCxNQUFNLGdCQUFnQixHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUM1QixNQUFNLEVBQ0osQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxHQUM3RCxHQUFHLHlCQUF5QixDQUFDO1lBQzlCLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQztnQkFDMUIsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQzNFLGdCQUFnQjtnQkFDaEIsS0FBSztnQkFDTCxRQUFRO2FBQ1QsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vdmFsaWRhdG9yL3J1bGVzL3Rvb1Nob3J0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNFbXB0eSBmcm9tICcuLi8uLi9fdXRpbC9pc0VtcHR5JztcbmltcG9ydCBWYWxpZGF0aW9uUmVzdWx0IGZyb20gJy4uL1ZhbGlkYXRpb25SZXN1bHQnO1xuaW1wb3J0IHsgJGwgfSBmcm9tICcuLi8uLi9sb2NhbGUtY29udGV4dCc7XG5pbXBvcnQgeyBtZXRob2RSZXR1cm4sIFZhbGlkYXRvclByb3BzIH0gZnJvbSAnLic7XG5pbXBvcnQgZm9ybWF0UmVhY3RUZW1wbGF0ZSBmcm9tICcuLi8uLi9mb3JtYXR0ZXIvZm9ybWF0UmVhY3RUZW1wbGF0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvb1Nob3J0KHZhbHVlOiBhbnksIHByb3BzOiBWYWxpZGF0b3JQcm9wcyk6IG1ldGhvZFJldHVybiB7XG4gIGNvbnN0IHsgbWluTGVuZ3RoLCBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzIH0gPSBwcm9wcztcbiAgaWYgKCFpc0VtcHR5KHZhbHVlKSkge1xuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIGlmICghIW1pbkxlbmd0aCAmJiBtaW5MZW5ndGggPiAwICYmIGxlbmd0aCA8IG1pbkxlbmd0aCkge1xuICAgICAgY29uc3QgaW5qZWN0aW9uT3B0aW9ucyA9IHsgbWluTGVuZ3RoLCBsZW5ndGggfTtcbiAgICAgIGNvbnN0IHJ1bGVOYW1lID0gJ3Rvb1Nob3J0JztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgW3J1bGVOYW1lXTogdmFsaWRhdGlvbk1lc3NhZ2UgPSAkbCgnVmFsaWRhdG9yJywgJ3Rvb19zaG9ydCcpLFxuICAgICAgfSA9IGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXM7XG4gICAgICByZXR1cm4gbmV3IFZhbGlkYXRpb25SZXN1bHQoe1xuICAgICAgICB2YWxpZGF0aW9uTWVzc2FnZTogZm9ybWF0UmVhY3RUZW1wbGF0ZSh2YWxpZGF0aW9uTWVzc2FnZSwgaW5qZWN0aW9uT3B0aW9ucyksXG4gICAgICAgIGluamVjdGlvbk9wdGlvbnMsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBydWxlTmFtZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==