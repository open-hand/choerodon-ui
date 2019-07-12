import React, { ReactNode } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import CheckBox from '../check-box/CheckBox';
import { $l } from '../locale-context/index';
import Record from '../data-set/Record';
import TextField from '../text-field/TextField';
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

  @computed
  get popup() {
    return true;
  }

  @computed
  get header(): ReactNode {
    const { prefixCls, multiple, observableProps: { header } } = this;
    if (multiple || header) {
      return (
        <div className={`${prefixCls}-header`}>
          {this.getHeaderSelected()}
          {header && <span className={`${prefixCls}-header-title`}>{header}</span>}
        </div>
      );
    }
  }

  @computed
  get footer(): ReactNode {
    const { prefixCls, filteredOptions, observableProps: { footer } } = this;
    if (footer) {
      return (
        <div className={`${prefixCls}-footer`}>
          {footer(filteredOptions)}
        </div>
      );
    }
  }

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'type', 'autoComplete', 'ref', 'body', 'footer', 'header', 'selected',
      'onChange', 'onSelect', 'onSelectAll', 'onKeyDown',
    ]);
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
    this.setText(void 0);
  }

  getHeaderSelected() {
    const { filteredOptions: { length }, multiple, prefixCls, props: { selected: { length: selectedLength } } } = this;
    const selectedText = selectedLength ? `${selectedLength}/` : '';
    if (multiple) {
      return (
        <CheckBox
          disabled={this.isDisabled()}
          onChange={this.handleSelectAllChange}
          onFocus={stopPropagation}
          checked={!!length && length === selectedLength}
          indeterminate={!!selectedLength && length !== selectedLength}
        >
          <span className={`${prefixCls}-header-selected`}>
            {`${selectedText}${length}${$l('Transfer', 'items')}`}
          </span>
        </CheckBox>
      );
    }
  }

  getSearchField(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-body-search-wrapper`}>
        <TextField
          ref={this.elementReference}
          onInput={this.handleChange}
          onClear={this.handleClear}
          onKeyDown={this.handleKeyDown}
          suffix={<Icon type="search" />}
          clearButton
        />
      </div>
    );
  }

  renderBody(): ReactNode {
    const { prefixCls, searchable, textField, valueField, props: { selected, onSelect } } = this;
    const searchField = searchable && this.getSearchField();
    const classString = classNames(`${prefixCls}-body`, {
      [`${prefixCls}-body-with-search`]: searchable,
    });
    const selectedKeys = selected.map(record => getItemKey(record, record.get(textField), record.get(valueField)));
    return (
      <div className={classString}>
        {searchField}
        <div className={`${prefixCls}-content-wrapper`} onFocus={searchable ? stopPropagation : void 0}>
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
