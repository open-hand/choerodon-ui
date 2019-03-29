import CalendarLocale from '../../rc-components/calendar/locale/sr_RS';
import TimePickerLocale from '../../time-picker/locale/sr_RS';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Izaberite datum',
    rangePlaceholder: ['Početni datum', 'Krajnji datum'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
