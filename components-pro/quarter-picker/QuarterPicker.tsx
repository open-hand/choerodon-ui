import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class QuarterPicker extends DatePicker {
  static displayName = 'QuarterPicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.quarter,
  };

  getWrapperClassNames() {
    const { prefixCls } = this;
    return super.getWrapperClassNames(`${prefixCls}-quarter-picker-wrapper`);
  }
}
