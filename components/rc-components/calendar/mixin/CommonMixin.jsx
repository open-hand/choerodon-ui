import noop from 'lodash/noop';
import enUs from '../locale/en_US';

export default {
  getDefaultProps() {
    return {
      locale: enUs,
      style: {},
      visible: true,
      prefixCls: 'rc-calendar',
      className: '',
      onSelect: noop,
      onChange: noop,
      onClear: noop,
      renderFooter() {
        return null;
      },
      renderSidebar() {
        return null;
      },
    };
  },

  shouldComponentUpdate(nextProps) {
    return this.props.visible || nextProps.visible;
  },

  getFormat() {
    let { format } = this.props;
    const { locale, timePicker } = this.props;
    if (!format) {
      if (timePicker) {
        format = locale.dateTimeFormat;
      } else {
        format = locale.dateFormat;
      }
    }
    return format;
  },

  focus() {
    if (this.rootInstance) {
      this.rootInstance.focus();
    }
  },

  saveRoot(root) {
    this.rootInstance = root;
  },
};
