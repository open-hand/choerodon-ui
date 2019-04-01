import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class MonthPicker extends DatePicker {
  static displayName = 'MonthPicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.month,
  };
}
