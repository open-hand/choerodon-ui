import CalendarLocale from '../../rc-components/calendar/locale/ca_ES';
import TimePickerLocale from '../../time-picker/locale/ca_ES';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Seleccionar data',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
