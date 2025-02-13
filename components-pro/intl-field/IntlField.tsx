import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, computed, isArrayLike } from 'mobx';
import classNames from 'classnames';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import Record from '../data-set/Record';
import TextArea, { TextAreaProps } from '../text-area/TextArea';
import { TextField } from '../text-field/TextField';
import { ResizeType, AutoSizeType } from '../text-area/enum';
import Icon from '../icon';
import IntlList from './IntlList';
import { IntlType } from './enum';
import Modal, { ModalProps } from '../modal/Modal';
import localeContext, { $l } from '../locale-context';
import Progress from '../progress';
import { Size, Tooltip as TextTooltip } from '../core/enum';
import message from '../message';
import exception from '../_util/exception';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import isSame from '../_util/isSame';
import isEmpty from '../_util/isEmpty';
import { show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import { TooltipProps } from '../tooltip/Tooltip';

export interface IntlFieldProps extends TextAreaProps {
  modalProps?: ModalProps;
  maxLengths?: object;
  type?: IntlType;
  displayOutput?: boolean;
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
    const suffixCls = this.props.displayOutput
      ? 'output'
      : (this.props.type !== IntlType.multipleLine ? 'input' : 'textarea');
    this.prefixCls = this.getContextProPrefixCls(suffixCls, props.prefixCls);
  }

  get range(): boolean {
    return false;
  }

  @computed
  get readOnly(): boolean {
    if (this.props.displayOutput) {
      return true;
    }
    return this.isReadOnly();
  }

  get resize(): ResizeType | undefined {
    if (this.props.displayOutput) {
      return ResizeType.none;
    }
    return super.resize;
  }

  get autoSize(): boolean | AutoSizeType | undefined {
    if (this.props.displayOutput) {
      return false;
    }
    return super.autoSize;
  }

  get border(): boolean | undefined {
    if (this.props.displayOutput) {
      return false;
    }
    return super.border;
  }

  get tooltip(): TextTooltip | [TextTooltip, TooltipProps] | undefined {
    if (this.disabled) {
      return super.tooltip;
    }
    const { tooltip, type } = this.props;
    const { getTooltip } = this.context;
    return type === IntlType.multipleLine
      ? (tooltip || TextTooltip.none)
      : (tooltip || getTooltip('text-field'));
  }

  @autobind
  @action
  saveSuffixRef(node) {
    this.suffixRef = node;
  }

  getEditorTextInfo(rangeTarget?: 0 | 1): { text: string; width: number; placeholder?: string } {
    const superText = super.getEditorTextInfo(rangeTarget);
    return this.props.displayOutput ? { ...superText, placeholder: undefined } : superText;
  }

  getPlaceholders(): string[] {
    if (this.props.displayOutput) {
      return [];
    }
    return super.getPlaceholders();
  }

  isEditable(): boolean {
    if (this.props.displayOutput) {
      return false;
    }
    return super.isEditable();
  }

  openModal = async () => {
    if (!this.modal) {
      const { modalProps, maxLengths, type, rows, cols, resize, displayOutput } = this.props;
      const { record, lang, name, element } = this;
      const maxLength = this.getProp('maxLength');
      const { supports } = localeContext;
      const maxLengthList = {};
      Object.keys(supports).map(key => {
        maxLengthList[key] = maxLengths && (key !== lang || isNil(maxLength))
          ? maxLengths[key] || maxLength
          : maxLength;
        return null;
      });
      if (record && name) {
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
        this.storeLocales(record, name);
      }

      this.modal = Modal.open({
        title: $l('IntlField', displayOutput ? 'output_modal_title' : 'modal_title'),
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
            displayOutput={displayOutput}
            getConfig={this.getContextConfig}
          />
        ),
        onClose: this.handleIntlListClose,
        onOk: this.handleIntlListOk,
        onCancel: this.handleIntlListCancel,
        okButton: !this.disabled && !this.readOnly,
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
    if (!this.props.displayOutput) {
      this.focus();
    }
  };

  @autobind
  async handleIntlListOk() {
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    const { record, name, field } = this;
    if (record && field) {
      const tlsKey = this.getContextConfig('tlsKey');
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
    if (this.disabled || this.readOnly) {
      return;
    }
    const { record, locales } = this;
    if (record && locales) {
      record.set(locales);
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

  storeLocales(record: Record, name: string) {
    const tlsKey = `${this.getContextConfig('tlsKey')}.${name}`;
    const tls = record.get(tlsKey);
    const locales = { [name]: record.get(name) };

    if (tls) {
      const { locale: { lang: defaultLang }, supports } = localeContext;
      Object.keys(supports).forEach(lang => {
        const value = tls[lang];
        if (lang === defaultLang) {
          locales[`${tlsKey}.${lang}`] = locales[name];
        } else {
          locales[`${tlsKey}.${lang}`] = value;
        }
      });
    }
    this.locales = locales;
  }

  getOmitPropsKeys(): string[] {
    if (this.props.type === IntlType.multipleLine && !this.props.displayOutput) {
      return super.getOmitPropsKeys().concat([
        'type',
        'displayOutput',
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
      'displayOutput',
      'modalProps',
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
        onClick: debounce(this.openModal, 200),
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

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.type !== this.props.type ||
      nextProps.displayOutput !== this.props.displayOutput
    ) {
      const suffixCls = nextProps.displayOutput
        ? 'output'
        : (nextProps.type !== IntlType.multipleLine ? 'input' : 'textarea');
      this.prefixCls = this.getContextProPrefixCls(suffixCls, nextProps.prefixCls);
    }
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
  }

  renderWrapper(): ReactNode {
    if (this.props.displayOutput) {
      return this.renderOutput();
    }
    if (this.props.type === IntlType.multipleLine) {
      return super.renderWrapper();
    }
    return this.renderGroup();
  }

  showTooltip(e): boolean {
    if (super.showTooltip(e)) {
      return true;
    }
    if (this.props.displayOutput) {
      const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
      const { tooltip = getTooltip('output') } = this.props;
      const { element, field } = this;
      if (element && !(field && field.get('multiLine', this.record)) && (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(element)))) {
        const title = this.getRenderedValue();
        if (title) {
          show(element, {
            title,
            placement: getTooltipPlacement('output') || 'right',
            theme: getTooltipTheme('output'),
          });
          return true;
        }
      }
    }
    return false;
  }

  renderOutput(): ReactNode {
    const result = this.getRenderedValue();
    const text = isEmpty(result) || (isArrayLike(result) && !result.length) ? this.getContextConfig('renderEmpty')('Output') : result;
    const floatLabel = this.renderFloatLabel();
    const suffix = this.getSuffix();
    const className = classNames(`${this.prefixCls}-intl-wrapper`);
    if (floatLabel) {
      return (
        <span {...this.getWrapperProps()}>
          {floatLabel}
          <span className={className}>
            <span {...this.getOtherProps()}>{text}</span>
            {suffix}
          </span>
        </span>
      );
    }
    return (
      <span className={className}>
        <span {...this.getMergedProps()}>{text}</span>
        {suffix}
      </span>
    );
  }
}
