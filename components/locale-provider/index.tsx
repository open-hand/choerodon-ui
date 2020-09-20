import { Children, Component, ReactElement } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import interopDefault from '../_util/interopDefault';
import { changeConfirmLocale, ModalLocale } from '../modal/locale';

export interface Locale {
  locale: string;
  Pagination?: Object;
  Cascader?: Object;
  DatePicker?: Object;
  TimePicker?: Object;
  Calendar?: Object;
  Table?: Object;
  Modal?: ModalLocale;
  Popconfirm?: Object;
  Transfer?: Object;
  Select?: Object;
  Upload?: Object;
  imageCrop?: imageCrop;
  performanceTable?: PerformanceTable;
}

export interface imageCrop {
  editImage: string,
  avatarUploadError: string,
  avatarServerError: string,
  avatarUpload: string,
  avatarReminder: string,
  preview: string,
  reUpload: string,
  imageTooLarge: string,
  imageUploadError: string,
  imageDragHere: string,
  pleaseUpload: string,
  uploadType: string,
  picture: string,
  cancelButton: string,
  saveButton: string,
  changeAvatar: string,
}

export interface PerformanceTable {
  emptyMessage: string;
  loading:string;
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: ReactElement<any>;
}

function setMomentLocale(locale: Locale) {
  if (locale && locale.locale) {
    interopDefault(moment).locale(locale.locale);
  } else {
    interopDefault(moment).locale('en');
  }
}

export default class LocaleProvider extends Component<LocaleProviderProps, any> {
  static propTypes = {
    locale: PropTypes.object,
  };

  static defaultProps = {
    locale: {},
  };

  static childContextTypes = {
    c7nLocale: PropTypes.object,
  };

  getChildContext() {
    const { locale } = this.props;
    return {
      c7nLocale: {
        ...locale,
        exist: true,
      },
    };
  }

  componentWillMount() {
    const { locale } = this.props;
    setMomentLocale(locale);
    this.componentDidUpdate();
  }

  componentWillReceiveProps(nextProps: LocaleProviderProps) {
    const { locale } = this.props;
    const nextLocale = nextProps.locale;
    if (locale !== nextLocale) {
      setMomentLocale(nextProps.locale);
    }
  }

  componentDidUpdate() {
    const { locale } = this.props;
    changeConfirmLocale(locale && locale.Modal);
  }

  componentWillUnmount() {
    changeConfirmLocale();
  }

  render() {
    const { children } = this.props;
    return Children.only(children);
  }
}
