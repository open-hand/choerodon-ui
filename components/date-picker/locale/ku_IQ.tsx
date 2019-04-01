import CalendarLocale from '../../rc-components/calendar/locale/ku_IQ';
import TimePickerLocale from '../../time-picker/locale/ku_IQ';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Dîrok hilbijêre',
    rangePlaceholder: ['Dîroka destpêkê', 'Dîroka dawîn'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
