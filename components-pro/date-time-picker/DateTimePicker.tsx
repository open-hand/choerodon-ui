import { Moment } from 'moment';
import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class DateTimePicker extends DatePicker {
  static displayName = 'DateTimePicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.dateTime,
  };

  getWrapperClassNames() {
    const { prefixCls } = this;
    return super.getWrapperClassNames(`${prefixCls}-date-time-picker-wrapper`);
  }

  getLimitWithType(limit: Moment, _minOrMax: 'min' | 'max') {
    return limit;
  }
}
