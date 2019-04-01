import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class DateTimePicker extends DatePicker {
  static displayName = 'DateTimePicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.dateTime,
  };
}
