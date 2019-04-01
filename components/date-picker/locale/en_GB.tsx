import CalendarLocale from '../../rc-components/calendar/locale/en_GB';
import TimePickerLocale from '../../time-picker/locale/en_GB';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Select date',
    rangePlaceholder: ['Start date', 'End date'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
