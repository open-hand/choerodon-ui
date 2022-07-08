import React, { ReactNode, CSSProperties } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import { toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { DISABLED_FIELD } from '../select/Select';
import { SelectBox, SelectBoxProps } from '../select-box/SelectBox';
import ObserverRadio from '../radio/Radio';
import { ViewMode } from '../radio/enum';
import Option, { OptionProps } from '../option/Option';
import autobind from '../_util/autobind';
import Record from '../data-set/Record';

export interface SegmentedProps extends SelectBoxProps {
  fullWidth?: boolean;
}

function recordIsDisabled(record: Record): boolean {
  return record.get(DISABLED_FIELD) || record.disabled;
}

@observer
export default class Segmented extends SelectBox<SegmentedProps> {
  static displayName = 'Segmented';

  static defaultProps = {
    ...SelectBox.defaultProps,
    suffixCls: 'segmented',
    mode: ViewMode.button,
  }

  static Option = Option;

  constructor(props, context) {
    super(props, context);
    this.initValue();
  }

  @observable
  activeRadio?: ObserverRadio | null;

  get multiple(): boolean {
    return false;
  }

  get range(): boolean {
    return false;
  }

  get searchable(): boolean {
    return false;
  }

  get mode(): ViewMode | undefined {
    return ViewMode.button;
  }

  componentDidMount() {
    super.componentDidMount();
    window.addEventListener('resize', this.handleBrowerResize);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('resize', this.handleBrowerResize);
  }

  handleBrowerResize = debounce(() => {
    const { fullWidth } = this.props;
    if (fullWidth) {
      this.forceUpdate();
    }
  }, 50);

  initValue() {
    const value = this.getValue();
    const { filteredOptions, valueField, options, props: { onOption } } = this;
    if (filteredOptions.length > 0 &&
      (isNil(value) || filteredOptions.every(record => record.get(valueField) !== value))) {
      const firstNotDisabled = filteredOptions.find(record => {
        const optionProps = onOption({ dataSet: options, record });
        return !(recordIsDisabled(record) || optionProps.disabled);
      });
      this.setValue((firstNotDisabled || filteredOptions[0]).get(valueField));
    }
  }

  @autobind
  @action
  saveActiveNode(node) {
    this.activeRadio = node;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'fullWidth',
    ]);
  }

  getWrapperClassNames(...args): string {
    const { prefixCls, props: { vertical, fullWidth } } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-wrapper-vertical`]: vertical,
        [`${prefixCls}-wrapper-fullwidth`]: fullWidth,
      },
      ...args,
    );
  }

  getClassName(...props): string | undefined {
    const {
      prefixCls,
      props: { fullWidth },
    } = this;
    return super.getClassName(
      {
        [`${prefixCls}-fullwidth`]: fullWidth,
      },
      ...props,
    );
  }

  renderSegmentedActive() {
    const { vertical } = this.props;
    let segActiveStyle: CSSProperties = { visibility: 'hidden' };
    if (this.activeRadio) {
      const radioInputDom = this.activeRadio;
      if (radioInputDom && radioInputDom.element && radioInputDom.element.parentElement) {
        const radioDom = radioInputDom.element.parentElement;
        let parentDomPadding = 4;
        if (radioDom.parentElement) {
          const parentDomStyle = window.getComputedStyle(radioDom.parentElement);
          const parentDomPaddingLeft = toPx(parentDomStyle.paddingLeft);
          const parentDomPaddingTop = toPx(parentDomStyle.paddingTop);
          parentDomPadding = defaultTo(vertical ? parentDomPaddingTop : parentDomPaddingLeft, parentDomPadding);
        }
        segActiveStyle = {
          ...segActiveStyle,
          visibility: 'visible',
          width: radioDom.offsetWidth,
          height: radioDom.offsetHeight,
          transform: vertical
            ? `translate(0px, ${radioDom.offsetTop - parentDomPadding}px)`
            : `translate(${radioDom.offsetLeft - parentDomPadding}px, 0px)`,
        }
      }
    }
    return (
      <div className={`${this.prefixCls}-active-show`} style={segActiveStyle} />
    );
  }

  @autobind
  renderSelectItems(items: ReactNode): ReactNode {
    const nowItems = (
      <>
        {this.renderSegmentedActive()}
        {items}
      </>
    );
    return super.renderSelectItems(nowItems);
  }

  @autobind
  getOptionOtherProps(checked: boolean): OptionProps {
    if (checked) {
      return {
        ...super.getOptionOtherProps(checked),
        ref: this.saveActiveNode,
      }
    }
    return super.getOptionOtherProps(checked);
  }

  isSearchFieldInPopup(): boolean | undefined {
    return false;
  }

  renderSearcher(): ReactNode {
    return null;
  }

  renderSelectAll(): ReactNode | void {
    return null;
  }
}
