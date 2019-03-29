import CalendarLocale from '../../rc-components/calendar/locale/uk_UA';
import TimePickerLocale from '../../time-picker/locale/uk_UA';

const locale = {
  lang: {
    placeholder: 'Оберіть дату',
    rangePlaceholder: ['Початкова дата', 'Кінцева дата'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
