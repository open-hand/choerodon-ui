import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class TimePicker extends DatePicker {
  static displayName = 'TimePicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.time,
  };
}
