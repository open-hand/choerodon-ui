import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class WeekPicker extends DatePicker {
  static displayName = 'WeekPicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.week,
  };
}
