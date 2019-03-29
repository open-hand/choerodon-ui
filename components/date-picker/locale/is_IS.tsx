import CalendarLocale from '../../rc-components/calendar/locale/is_IS';
import TimePickerLocale from '../../time-picker/locale/is_IS';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Veldu dag',
    rangePlaceholder: ['Upphafsdagur', 'Lokadagur'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
