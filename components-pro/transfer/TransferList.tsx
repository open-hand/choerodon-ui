import React, { ReactNode } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import ObserverCheckBox from '../check-box/CheckBox';
import { $l } from '../locale-context';
import Record from '../data-set/Record';
import ObserverTextField from '../text-field/TextField';
import Icon from '../icon';
import { getItemKey, Select, SelectProps } from '../select/Select';
import autobind from '../_util/autobind';
import { stopPropagation } from '../_util/EventManager';
import ViewComponent from '../core/ViewComponent';

export interface TransferListProps extends SelectProps {
  header?: ReactNode;
  selected: Record[];
  footer?: (options: Record[]) => ReactNode;
  onSelect: (e) => void;
  onSelectAll: (value: any) => void;
}

@observer
export default class TransferList extends Select<TransferListProps> {
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

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'autoComplete',
      'footer',
      'header',
      'selected',
      'onSelect',
      'onSelectAll',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.ref;
    delete otherProps.type;
    delete otherProps.onChange;
    delete otherProps.onKeyDown;
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
      onSelectAll(value ? this.filteredOptions : []);
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
    if (multiple) {
      return (
        <ObserverCheckBox
          disabled={this.disabled}
          onChange={this.handleSelectAllChange}
          onFocus={stopPropagation}
          checked={!!length && length === selectedLength}
          indeterminate={!!selectedLength && length !== selectedLength}
        >
          <span className={`${prefixCls}-header-selected`}>
            {`${selectedText}${length}${$l('Transfer', 'items')}`}
          </span>
        </ObserverCheckBox>
      );
    }
  }

  getSearchField(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-body-search-wrapper`}>
        <ObserverTextField
          ref={this.elementReference}
          onInput={this.handleChange}
          onClear={this.handleClear}
          onKeyDown={this.handleKeyDown}
          prefix={<Icon type="search" />}
          clearButton
        />
      </div>
    );
  }

  renderBody(): ReactNode {
    const {
      prefixCls,
      searchable,
      textField,
      valueField,
      props: { selected, onSelect },
    } = this;
    const searchField = searchable && this.getSearchField();
    const classString = classNames(`${prefixCls}-body`, {
      [`${prefixCls}-body-with-search`]: searchable,
    });
    const selectedKeys = selected.map(record =>
      getItemKey(record, record.get(textField), record.get(valueField)),
    );
    return (
      <div className={classString}>
        {searchField}
        <div
          className={`${prefixCls}-content-wrapper`}
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
  }

  @autobind
  handleBlur(e) {
    ViewComponent.prototype.handleBlur.call(this, e);
  }

  render() {
    const { header, footer } = this;
    return (
      <div {...this.getOtherProps()}>
        {header}
        {this.renderBody()}
        {footer}
      </div>
    );
  }
}
