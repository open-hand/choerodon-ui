import CalendarLocale from '../../rc-components/calendar/locale/nl_BE';
import TimePickerLocale from '../../time-picker/locale/nl_BE';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Selecteer datum',
    rangePlaceholder: ['Begin datum', 'Eind datum'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
