import CalendarLocale from '../../rc-components/calendar/locale/en_US';
import TimePickerLocale from '../../time-picker/locale/en_US';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Chọn thời điểm',
    rangePlaceholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
