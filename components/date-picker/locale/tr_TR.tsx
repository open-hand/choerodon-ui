import CalendarLocale from '../../rc-components/calendar/locale/tr_TR';
import TimePickerLocale from '../../time-picker/locale/tr_TR';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Tarih Seç',
    rangePlaceholder: ['Başlangıç Tarihi', 'Bitiş Tarihi'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
