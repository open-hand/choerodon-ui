import CalendarLocale from '../../rc-components/calendar/locale/nl_NL';
import TimePickerLocale from '../../time-picker/locale/nl_NL';

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
// https://github.com/ant-design/ant-design/issues/424

export default locale;
