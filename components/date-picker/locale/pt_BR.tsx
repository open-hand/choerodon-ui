import CalendarLocale from '../../rc-components/calendar/locale/pt_BR';
import TimePickerLocale from '../../time-picker/locale/pt_BR';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Selecionar data',
    rangePlaceholder: ['Data de início', 'Data de fim'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
