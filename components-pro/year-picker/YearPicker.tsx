import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class YearPicker extends DatePicker {
  static displayName = 'YearPicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.year,
  };

  getWrapperClassNames() {
    const { prefixCls } = this;
    return super.getWrapperClassNames(`${prefixCls}-year-picker-wrapper`);
  }
}
