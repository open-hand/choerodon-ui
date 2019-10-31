import { Moment } from 'moment';
import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class TimePicker extends DatePicker {
  static displayName = 'TimePicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.time,
  };

  getLimitWithType(limit: Moment, _minOrMax: 'min' | 'max') {
    return limit;
  }
}
