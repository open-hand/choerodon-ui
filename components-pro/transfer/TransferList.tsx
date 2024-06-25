import React, { ReactNode } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import scrollIntoView from 'scroll-into-view-if-needed';
import ObserverCheckBox from '../check-box/CheckBox';
import { $l } from '../locale-context';
import Record from '../data-set/Record';
import ObserverTextField from '../text-field/TextField';
import Icon from '../icon';
import { DISABLED_FIELD, getItemKey, Select, SelectProps } from '../select/Select';
import autobind from '../_util/autobind';
import { stopPropagation } from '../_util/EventManager';
import ViewComponent from '../core/ViewComponent';
import CustomArea from './CustomArea';

export interface TransferListProps extends SelectProps {
  header?: ReactNode;
  selected: Record[];
  currentIndex?: number;
  oneWay?: boolean;
  targetOption?: Record[];
  direction: string;
  footer?: (options: Record[]) => ReactNode;
  onSelect: (e) => void;
  onSelectAll: (value: any) => void;
  setTargetOption?: (value: any) => void;
  onRemove?: (e) => void;
}

@observer
export default class TransferList extends Select<TransferListProps> {
  wrapperRef: HTMLDivElement | null = null;

  get popup() {
    return true;
  }

  @computed
  get header(): ReactNode {
    const {
      prefixCls,
      multiple,
      observableProps: { header },
    } = this;
    if (multiple || header) {
      return (
        <div className={`${prefixCls}-header`}>
          {this.getHeaderSelected()}
          {header && <span className={`${prefixCls}-header-title`}>{header}</span>}
        </div>
      );
    }
    return undefined;
  }

  @computed
  get footer(): ReactNode {
    const {
      prefixCls,
      filteredOptions,
      observableProps: { footer },
    } = this;
    if (footer) {
      return <div className={`${prefixCls}-footer`}>{footer(filteredOptions)}</div>;
    }
    return undefined;
  }

  componentDidUpdate() {
    const { currentIndex } = this.props;
    // 在渲染完之后执行
    if (this.wrapperRef && typeof currentIndex !== 'undefined') {
      const contentDom = this.wrapperRef.getElementsByTagName('ul')[0];
      const findSelectedDom = this.wrapperRef.getElementsByTagName('li');

      if (contentDom && currentIndex && currentIndex > -1 && currentIndex < this.filteredOptions.length) {
        const selectedDom = findSelectedDom[currentIndex] as HTMLLIElement;
        scrollIntoView(selectedDom, { block: 'end', behavior: 'smooth', scrollMode: 'if-needed', boundary: contentDom });
      }
      this.options.setState('targetFilteredOptions', this.filteredOptions);
    }
  }

  getOmitPropsKeys(): string[] {
    return super
      .getOmitPropsKeys()
      .concat(['autoComplete', 'footer', 'header', 'selected', 'onSelect', 'onSelectAll']);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.ref;
    delete otherProps.type;
    delete otherProps.onChange;
    delete otherProps.onKeyDown;
    delete otherProps.currentIndex;
    delete otherProps.sortable;
    delete otherProps.sortOperations;
    delete otherProps.oneWay;
    delete otherProps.onRemove;
    delete otherProps.targetOption;
    delete otherProps.direction;
    return otherProps;
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      header: props.header,
      footer: props.footer,
    };
  }

  getMenuPrefixCls() {
    return `${this.prefixCls}-content`;
  }

  @autobind
  handleSelectAllChange(value) {
    const { onSelectAll } = this.props;
    if (onSelectAll) {
      onSelectAll(value ? this.filteredOptions.filter(record => !record.get(DISABLED_FIELD)) : []);
    }
  }

  @autobind
  handleClear() {
    this.setText(undefined);
  }

  getHeaderSelected() {
    const {
      filteredOptions: { length },
      multiple,
      prefixCls,
      props: {
        selected: { length: selectedLength },
      },
    } = this;
    const selectedText = selectedLength ? `${selectedLength}/` : '';
    const disabledLength = this.filteredOptions.filter(record => record.get(DISABLED_FIELD)).length;
    if (multiple) {
      return (
        <ObserverCheckBox
          disabled={this.disabled}
          onChange={this.handleSelectAllChange}
          onFocus={stopPropagation}
          checked={!!length && disabledLength !== length && (length === selectedLength || length - disabledLength === selectedLength)}
          indeterminate={!!selectedLength && (length - disabledLength !== selectedLength)}
        >
          <span className={`${prefixCls}-header-selected`}>
            {`${selectedText}${length}${$l('Transfer', 'items')}`}
          </span>
        </ObserverCheckBox>
      );
    }
    return (
      <span className={`${prefixCls}-header-selected`}>
        {`${length}${$l('Transfer', 'items')}`}
      </span>
    )
  }

  getSearchField(): ReactNode {
    const { prefixCls, props: { direction, placeholder } } = this;
    const plstr = direction === 'left' ? 'search_placeholder_left' : 'search_placeholder_right';
    return (
      <div className={`${prefixCls}-body-search-wrapper`}>
        <ObserverTextField
          ref={this.elementReference}
          onInput={this.handleChange}
          onClear={this.handleClear}
          onKeyDown={this.handleKeyDown}
          prefix={<Icon type="search" />}
          placeholder={placeholder || $l('Transfer', plstr)}
          clearButton
        />
      </div>
    );
  }

  handleRemove = (value) => {
    const { onRemove } = this.props;
    if (onRemove) {
      onRemove(value);
    }
  }

  getMenuItem({ record, text, value }): string | ReactNode {
    const {
      prefixCls,
      multiple,
      options,
      props: { oneWay, optionRenderer },
    } = this;
    if (oneWay && !multiple) {
      const renderer: ReactNode = (
        <div className={`${prefixCls}-item-delete`}>
          <div>{text}</div>
          <Icon type="delete_black-o" className={`${prefixCls}-item-icon`} onClick={() => this.handleRemove(value)} />
        </div>
      );
      return optionRenderer
        ? optionRenderer({ dataSet: options, record, text, value })
        : renderer
    }
    return super.getMenuItem({ record, text, value })
  }

  renderBody(): ReactNode {
    const {
      prefixCls,
      searchable,
      textField,
      valueField,
      multiple,
      props: { selected, onSelect, onSelectAll, setTargetOption, children, targetOption, direction },
    } = this;
    const searchField = searchable && this.getSearchField();
    const classString = classNames(`${prefixCls}-body`, {
      [`${prefixCls}-body-with-search`]: searchable,
    });
    // 自定义渲染
    if (typeof children === 'function') {
      return (
        <CustomArea targetOption={targetOption}>{
          children({ direction, targetOption, setTargetOption, onItemSelect: onSelectAll })}
        </CustomArea>
      );
    }
    const selectedKeys = multiple ? selected.map(record =>
      getItemKey(record, record.get(textField), record.get(valueField)),
    ) : [];
    return (
      <div className={classString}>
        {searchField}
        <div
          className={`${prefixCls}-content-wrapper`}
          ref={dom => {
            this.wrapperRef = dom;
          }}
          onFocus={searchable ? stopPropagation : undefined}
        >
          {this.getMenu({ selectedKeys, onClick: onSelect, focusable: !this.searchable })}
        </div>
      </div>
    );
  }

  getClassName() {
    const { prefixCls, header, footer } = this;
    return super.getClassName({
      [`${prefixCls}-with-header`]: header,
      [`${prefixCls}-with-footer`]: footer,
    });
  }

  removeLastValue() {
    // noop
  }

  @autobind
  handleBlur(e) {
    ViewComponent.prototype.handleBlur.call(this, e);
  }

  renderHelpMessage(): ReactNode {
    return null;
  }

  renderWrapper() {
    const { header, footer, props: { style, children } } = this;
    const isCustom = typeof children === 'function';
    return (
      <div {...this.getOtherProps()} style={style}>
        {!isCustom && header}
        {this.renderBody()}
        {!isCustom && footer}
      </div>
    );
  }
}
