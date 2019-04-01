import CalendarLocale from '../../rc-components/calendar/locale/et_EE';
import TimePickerLocale from '../../time-picker/locale/et_EE';

// 统一合并为完整的 Locale
const locale = {
  lang: {
    placeholder: 'Vali kuupäev',
    rangePlaceholder: ['Algus kuupäev', 'Lõpu kuupäev'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
