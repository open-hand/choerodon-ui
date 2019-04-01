import CalendarLocale from '../../rc-components/calendar/locale/fa_IR';
import TimePickerLocale from '../../time-picker/locale/fa_IR';

// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'انتخاب تاریخ',
    rangePlaceholder: ['تاریخ شروع', 'تاریخ پایان'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:

export default locale;
