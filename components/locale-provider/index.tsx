import React, { Component, ReactNode } from 'react';
import moment from 'moment';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { LocaleReceiverContext } from './LocaleReceiver';
import { changeRuntimeLocale } from './utils';

export interface Locale {
  locale: string;
  Pagination?: Record<string, any>;
  Cascader?: Record<string, any>;
  DatePicker?: Record<string, any>;
  TimePicker?: Record<string, any>;
  Calendar?: Record<string, any>;
  Table?: Record<string, any>;
  Modal?: ModalLocale;
  Popconfirm?: Record<string, any>;
  Transfer?: Record<string, any>;
  Select?: Record<string, any>;
  Upload?: Record<string, any>;
  imageCrop?: imageCrop;
  performanceTable?: PerformanceTable;
  Notification?: NoticeLocale;
  Collapse?: Record<string, any>;
}

export interface ModalLocale {
  okText: string;
  cancelText: string;
  justOkText: string;
}

export interface NoticeLocale {
  total: string;
  message: string;
  closeAll: string;
}

export interface imageCrop {
  editImage: string;
  avatarUploadError: string;
  avatarServerError: string;
  avatarUpload: string;
  avatarReminder: string;
  preview: string;
  reUpload: string;
  imageTooLarge: string;
  imageUploadError: string;
  imageDragHere: string;
  pleaseUpload: string;
  uploadType: string;
  picture: string;
  cancelButton: string;
  saveButton: string;
  changeAvatar: string;
}

export interface PerformanceTable {
  emptyMessage: string;
  loading: string;
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: ReactNode;
}

export const LocaleContext = getContext<LocaleReceiverContext>(Symbols.LocaleContext, {});

function setMomentLocale(locale: Locale) {
  if (locale && locale.locale) {
    moment.locale(locale.locale);
  } else {
    moment.locale('en');
  }
}

export default class LocaleProvider extends Component<LocaleProviderProps, any> {
  static defaultProps = {
    locale: {},
  };

  getContextValue() {
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
    changeRuntimeLocale(locale);
  }

  componentWillUnmount() {
    changeRuntimeLocale();
  }

  render() {
    const { children } = this.props;
    return (
      <LocaleContext.Provider value={this.getContextValue()}>
        {children}
      </LocaleContext.Provider>
    );
  }
}
