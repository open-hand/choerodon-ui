import CalendarLocale from '../../rc-components/calendar/locale/bg_BG';
import TimePickerLocale from '../../time-picker/locale/bg_BG';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Избор на дата',
    rangePlaceholder: ['Начална', 'Крайна'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
