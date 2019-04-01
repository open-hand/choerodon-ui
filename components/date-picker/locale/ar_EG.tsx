import CalendarLocale from '../../rc-components/calendar/locale/ar_EG';
import TimePickerLocale from '../../time-picker/locale/ar_EG';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'اختيار التاريخ',
    rangePlaceholder: ['البداية', 'النهاية'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
