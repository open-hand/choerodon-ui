import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import TextArea, { TextAreaProps } from '../text-area/TextArea';
import { TextField } from '../text-field/TextField';
import { ResizeType } from '../text-area/enum';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import IntlList from './IntlList';
import { IntlType } from './enum';
import { ModalProps } from '../modal/Modal';
import localeContext, { $l } from '../locale-context';
import Progress from '../progress';
import { Size } from '../core/enum';
import message from '../message';
import exception from '../_util/exception';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import isSame from '../_util/isSame';

export interface IntlFieldProps extends TextAreaProps {
  modalProps?: ModalProps;
  maxLengths?: object;
  type?: IntlType;
}

@observer
export default class IntlField extends TextArea<IntlFieldProps> {
  static displayName = 'IntlField';

  static defaultProps = {
    ...TextArea.defaultProps,
    rows: 3,
    resize: ResizeType.vertical,
    type: IntlType.singleLine,
  };

  modal;

  locales?: object;

  @observable loading?: boolean;

  constructor(props, context) {
    super(props, context);
    const suffixCls = this.props.type !== IntlType.multipleLine ? 'input' : 'textarea';
    this.prefixCls = getProPrefixCls(suffixCls, props.prefixCls);
  }
  
  openModal = async () => {
    if (!this.modal) {
      const { modalProps, maxLengths, type, rows, cols, resize } = this.props;
      const { record, lang, name, element } = this;
      const { supports } = localeContext;
      const maxLengthList = {};
      Object.keys(supports).map(key => {
        maxLengthList[key] = maxLengths && key !== lang ? maxLengths[key] || element.maxLength : element.maxLength;
        return null;
      });
      if (record) {
        this.setLoading(true);
        try {
          if (element && !isSame(this.getValue(), element.value)) {
            this.syncValueOnBlur(element.value);
          }
          await record.tls(name);
        } catch (err) {
          message.error(exception(err));
          return;
        } finally {
          this.setLoading(false);
        }
      }
      this.storeLocales();

      this.modal = open({
        title: $l('IntlField', 'modal_title'),
        children: (
          <IntlList
            readOnly={this.readOnly}
            disabled={this.disabled}
            record={record}
            name={name}
            lang={lang}
            maxLengths={maxLengthList}
            type={type}
            rows={rows}
            cols={cols}
            resize={resize}
          />
        ),
        onClose: this.handleIntlListClose,
        onOk: this.handleIntlListOk,
        onCancel: this.handleIntlListCancel,
        destroyOnClose: true,
        ...modalProps,
      } as ModalProps & { children });
    }
  };

  @action
  setLoading(loading) {
    this.loading = loading;
  }

  handleIntlListClose = async () => {
    delete this.modal;
    this.focus();
  };

  @autobind
  async handleIntlListOk() {
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    const { record, name, field } = this;
    if (record && field) {
      const tlsKey = getConfig('tlsKey');
      return (await Promise.all(
        languages.map(language => {
          const intlField = record.dataSet.getField(`${tlsKey}.${name}.${language}`);
          return intlField ? intlField.checkValidity(record) : true;
        }),
      )).every(Boolean);
    }
  }

  @autobind
  async handleIntlListCancel() {
    const { name, record } = this;
    if (record) {
      const tlsKey = getConfig('tlsKey');
      record.set(`${tlsKey}.${name}`, this.locales);
    }
  }

  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.DOWN && this.props.type !== IntlType.multipleLine) {
      stopEvent(e);
      this.openModal();
    }
    super.handleKeyDown(e);
  }

  @autobind
  handleBlur(e) {
    if (this.modal) {
      e.preventDefault();
    }
    super.handleBlur(e);
  }

  storeLocales() {
    const { name, record } = this;
    if (record) {
      const tlsKey = getConfig('tlsKey');
      this.locales = { ...record.get(`${tlsKey}.${name}`) };
    }
  }

  getOmitPropsKeys(): string[] {
    if (this.props.type === IntlType.multipleLine) {
      return super.getOmitPropsKeys().concat([
        'type',
      ]);
    }
    return super.getOmitPropsKeys().concat([
      'cols',
      'rows',
      'wrap',
      'resize',
      'autoSize',
      'onResize',
      'type',
    ]);
  }

  getOtherProps() {
    if (this.props.type === IntlType.multipleLine) {
      return super.getOtherProps();
    }
    return TextField.prototype.getOtherProps.call(this);
  }

  getWrapperClassNames(...args): string {
    return super.getWrapperClassNames(
      `${this.prefixCls}-intl`,
      ...args,
    );
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(
      this.loading ? (
        <Progress size={Size.small} type={ProgressType.loading} />
      ) : (
        suffix || <Icon className={`${this.prefixCls}-intl`} type="language" />
      ),
      {
        onClick: this.openModal,
      },
    );
  }

  handleEnterDown(e) {
    if (this.props.type === IntlType.multipleLine) {
      super.handleEnterDown(e);
    } else {
      TextField.prototype.handleEnterDown.call(this, e);
    }
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
  }

  renderWrapper(): ReactNode {
    if (this.props.type === IntlType.multipleLine) {
      return super.renderWrapper();
    }
    return this.renderGroup();
  }
}
