import capitalize from 'lodash/capitalize';
let supportsLocales;
export function toLocaleStringSupportsLocales() {
    if (supportsLocales === undefined) {
        try {
            (0).toLocaleString('i');
            supportsLocales = false;
        }
        catch (e) {
            supportsLocales = e.name === 'RangeError';
        }
    }
    return supportsLocales;
}
export function getNumberFormatOptions(type, options) {
    if (type === "number" /* number */) {
        return { style: 'decimal' };
    }
    if (options && options.currency) {
        return { style: 'currency' };
    }
    return { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
}
export function toLocaleStringPolyfill(value, type, options) {
    if (type === "number" /* number */) {
        const fraction = String(value).split('.')[1];
        return value.toLocaleString().split('.')[0] + (fraction ? `.${fraction}` : '');
    }
    const currency = options && options.currency;
    return `${currency ? `${currency} ` : ''}${value.toLocaleString()}`;
}
export function trimString(value, fieldTrim) {
    if (fieldTrim) {
        switch (fieldTrim) {
            case "both" /* both */:
                return value.trim();
            case "left" /* left */:
                return value.trimLeft();
            case "right" /* right */:
                return value.trimRight();
            default:
        }
    }
    return value;
}
export function transformString(value, format) {
    if (format) {
        switch (format) {
            case "uppercase" /* uppercase */:
                return value.toUpperCase();
            case "lowercase" /* lowercase */:
                return value.toLowerCase();
            case "capitalize" /* capitalize */:
                return capitalize(value);
            default:
        }
    }
    return value;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Zvcm1hdHRlci91dGlscy50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFHM0MsSUFBSSxlQUFlLENBQUM7QUFFcEIsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxJQUFJLGVBQWUsS0FBSyxTQUFTLEVBQUU7UUFDakMsSUFBSTtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLGVBQWUsR0FBRyxLQUFLLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLGVBQWUsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQztTQUMzQztLQUNGO0lBQ0QsT0FBTyxlQUFlLENBQUM7QUFDekIsQ0FBQztBQUVELE1BQU0sVUFBVSxzQkFBc0IsQ0FDcEMsSUFBZSxFQUNmLE9BQWtDO0lBRWxDLElBQUksSUFBSSwwQkFBcUIsRUFBRTtRQUM3QixPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDO0tBQzlCO0lBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2xGLENBQUM7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLEtBQWEsRUFDYixJQUFlLEVBQ2YsT0FBa0M7SUFFbEMsSUFBSSxJQUFJLDBCQUFxQixFQUFFO1FBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsT0FBTyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNoRjtJQUNELE1BQU0sUUFBUSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQzdDLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztBQUN0RSxDQUFDO0FBRUQsTUFBTSxVQUFVLFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBcUI7SUFDN0QsSUFBSSxTQUFTLEVBQUU7UUFDYixRQUFRLFNBQVMsRUFBRTtZQUNqQjtnQkFDRSxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QjtnQkFDRSxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQjtnQkFDRSxPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMzQixRQUFRO1NBQ1Q7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBYSxFQUFFLE1BQTZCO0lBQzFFLElBQUksTUFBTSxFQUFFO1FBQ1YsUUFBUSxNQUFNLEVBQUU7WUFDZDtnQkFDRSxPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QjtnQkFDRSxPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QjtnQkFDRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixRQUFRO1NBQ1Q7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vZm9ybWF0dGVyL3V0aWxzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2FwaXRhbGl6ZSBmcm9tICdsb2Rhc2gvY2FwaXRhbGl6ZSc7XG5pbXBvcnQgeyBGaWVsZEZvcm1hdCwgRmllbGRUcmltLCBGaWVsZFR5cGUgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcblxubGV0IHN1cHBvcnRzTG9jYWxlcztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvTG9jYWxlU3RyaW5nU3VwcG9ydHNMb2NhbGVzKCkge1xuICBpZiAoc3VwcG9ydHNMb2NhbGVzID09PSB1bmRlZmluZWQpIHtcbiAgICB0cnkge1xuICAgICAgKDApLnRvTG9jYWxlU3RyaW5nKCdpJyk7XG4gICAgICBzdXBwb3J0c0xvY2FsZXMgPSBmYWxzZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzdXBwb3J0c0xvY2FsZXMgPSBlLm5hbWUgPT09ICdSYW5nZUVycm9yJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1cHBvcnRzTG9jYWxlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE51bWJlckZvcm1hdE9wdGlvbnMoXG4gIHR5cGU6IEZpZWxkVHlwZSxcbiAgb3B0aW9ucz86IEludGwuTnVtYmVyRm9ybWF0T3B0aW9ucyxcbik6IEludGwuTnVtYmVyRm9ybWF0T3B0aW9ucyB7XG4gIGlmICh0eXBlID09PSBGaWVsZFR5cGUubnVtYmVyKSB7XG4gICAgcmV0dXJuIHsgc3R5bGU6ICdkZWNpbWFsJyB9O1xuICB9XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY3VycmVuY3kpIHtcbiAgICByZXR1cm4geyBzdHlsZTogJ2N1cnJlbmN5JyB9O1xuICB9XG4gIHJldHVybiB7IHN0eWxlOiAnZGVjaW1hbCcsIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiwgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0xvY2FsZVN0cmluZ1BvbHlmaWxsKFxuICB2YWx1ZTogbnVtYmVyLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIG9wdGlvbnM/OiBJbnRsLk51bWJlckZvcm1hdE9wdGlvbnMsXG4pIHtcbiAgaWYgKHR5cGUgPT09IEZpZWxkVHlwZS5udW1iZXIpIHtcbiAgICBjb25zdCBmcmFjdGlvbiA9IFN0cmluZyh2YWx1ZSkuc3BsaXQoJy4nKVsxXTtcbiAgICByZXR1cm4gdmFsdWUudG9Mb2NhbGVTdHJpbmcoKS5zcGxpdCgnLicpWzBdICsgKGZyYWN0aW9uID8gYC4ke2ZyYWN0aW9ufWAgOiAnJyk7XG4gIH1cbiAgY29uc3QgY3VycmVuY3kgPSBvcHRpb25zICYmIG9wdGlvbnMuY3VycmVuY3k7XG4gIHJldHVybiBgJHtjdXJyZW5jeSA/IGAke2N1cnJlbmN5fSBgIDogJyd9JHt2YWx1ZS50b0xvY2FsZVN0cmluZygpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltU3RyaW5nKHZhbHVlOiBzdHJpbmcsIGZpZWxkVHJpbT86IEZpZWxkVHJpbSk6IHN0cmluZyB7XG4gIGlmIChmaWVsZFRyaW0pIHtcbiAgICBzd2l0Y2ggKGZpZWxkVHJpbSkge1xuICAgICAgY2FzZSBGaWVsZFRyaW0uYm90aDpcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRyaW0oKTtcbiAgICAgIGNhc2UgRmllbGRUcmltLmxlZnQ6XG4gICAgICAgIHJldHVybiB2YWx1ZS50cmltTGVmdCgpO1xuICAgICAgY2FzZSBGaWVsZFRyaW0ucmlnaHQ6XG4gICAgICAgIHJldHVybiB2YWx1ZS50cmltUmlnaHQoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVN0cmluZyh2YWx1ZTogc3RyaW5nLCBmb3JtYXQ/OiBGaWVsZEZvcm1hdCB8IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChmb3JtYXQpIHtcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgY2FzZSBGaWVsZEZvcm1hdC51cHBlcmNhc2U6XG4gICAgICAgIHJldHVybiB2YWx1ZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgY2FzZSBGaWVsZEZvcm1hdC5sb3dlcmNhc2U6XG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY2FzZSBGaWVsZEZvcm1hdC5jYXBpdGFsaXplOlxuICAgICAgICByZXR1cm4gY2FwaXRhbGl6ZSh2YWx1ZSk7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iXSwidmVyc2lvbiI6M30=