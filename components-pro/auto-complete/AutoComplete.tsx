import React, { ReactNode, ReactElement, Key } from 'react';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import Menu, { Item } from 'choerodon-ui/lib/rc-components/menu';
import { action } from 'mobx';
import Record from '../data-set/Record';
import autobind from '../_util/autobind';
import { getItemKey, MORE_KEY, Select, SelectProps } from '../select/Select';
import DataSet from '../data-set';
import { FieldType } from '../data-set/enum';
import Icon from '../icon';


const defaultMatcher = (value: string, inputText: string) => value.indexOf(inputText) !== -1;

export interface AutoCompleteProps extends SelectProps {
  matcher: (value: string, inputText: string) => boolean;
}

@observer
export default class AutoComplete<T extends AutoCompleteProps> extends Select<T> {

  static displayName = 'AutoComplete';

  menu?: Menu | null;

  isChoose?: boolean = false;

  inputText: string = '';

  static propTypes = {
    ...Select.propTypes,
  };

  static defaultProps = {
    ...Select.defaultProps,
    searchable: true,
    suffixCls: 'auto-complete',
    matcher: defaultMatcher,
  };

  getTriggerIconFont() {
    return '';
  }

  getNotFoundContent() {
    return null;
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'searchable',
      'matcher',
    ]);
    return otherProps;
  }

  @autobind
  @action
  handleChange(e) {
    this.isChoose = false;
    super.handleChange(e);
  }

  choose(record?: Record | null) {
    this.isChoose = true;
    super.choose(record);
  }

  @autobind
  handleFocus(e) {
    this.inputText = e.target?.value;
    super.handleFocus(e);
  }

  @autobind
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      if (!this.isChoose) {
        const inputText = this.text || this.inputText;
        this.inputText = inputText;
        const temDs = new DataSet({
          fields: [
            { name: this.textField, type: FieldType.string },
            { name: this.valueField, type: FieldType.string },
          ],
          data: [{
            [this.textField]: inputText,
            [this.valueField]: inputText,
          }],
        });
        this.choose(temDs.current);
      }
      super.handleBlur(e);
    }
  }

  @autobind
  getMenu(menuProps: object = {}): ReactNode {
    const {
      options,
      textField,
      valueField,
      props: { dropdownMenuStyle, optionRenderer, onOption, matcher = defaultMatcher },
    } = this;

    if (!options) {
      return null;
    }
    const menuDisabled = this.isDisabled();
    const optGroups: ReactElement<any>[] = [];
    const selectedKeys: Key[] = [];

    const inputText = this.text || this.inputText;

    options.forEach(record => {

      const value = record.get(valueField);
      // 判断是否符合自动补全的条件
      if (inputText && !matcher(value, inputText)) {
        return;
      }

      const text = record.get(textField);
      const optionProps = onOption({ dataSet: options, record });
      const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
      const key: Key = getItemKey(record, text, value);

      const itemContent = optionRenderer
        ? optionRenderer({ dataSet: this.options, record, text, value })
        : text;
      const option: ReactElement = (
        <Item {...optionProps} key={key} value={record} disabled={optionDisabled}>
          {itemContent}
        </Item>
      );

      optGroups.push(option);
    });

    if (!optGroups.length) {
      return null;
    }
    const menuPrefix = this.getMenuPrefixCls();
    return (
      <Menu
        ref={this.saveMenu}
        disabled={menuDisabled}
        defaultActiveFirst
        multiple={this.menuMultiple}
        selectedKeys={selectedKeys}
        prefixCls={menuPrefix}
        onClick={this.handleMenuClick}
        style={dropdownMenuStyle}
        focusable={false}
        {...menuProps}
      >
        {optGroups}
        {
          options.paging && options.currentPage < options.totalPage && (
            <Item key={MORE_KEY} checkable={false} className={`${menuPrefix}-item-more`}>
              <Icon type="more_horiz" />
            </Item>
          )
        }
      </Menu>
    );
  }

}
