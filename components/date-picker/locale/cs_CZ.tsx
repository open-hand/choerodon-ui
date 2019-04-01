import CalendarLocale from '../../rc-components/calendar/locale/cs_CZ';
import TimePickerLocale from '../../time-picker/locale/cs_CZ';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Vybrat datum',
    rangePlaceholder: ['Od', 'Do'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
