import React, { CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import flatten from 'lodash/flatten';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import Icon from '../icon';
import Tabs from '../tabs';
import { $l } from '../locale-context';
import IconCategory from './IconCategory';
import { action, computed, observable, runInAction } from 'mobx';
import autobind from '../_util/autobind';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { stopEvent } from '../_util/EventManager';

const { categories } = Icon;
const categoryKeys: string[] = Object.keys(categories);
const COLUMNS = 5;

export interface IconPickerProps extends TriggerFieldProps {
  pageSize?: number;
}

@observer
export default class IconPicker extends TriggerField<IconPickerProps> {
  static displayName = 'IconPicker';

  static propTypes = {
    ...TriggerField.propTypes,
    pageSize: PropTypes.number,
  };

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'pro-icon-picker',
    pageSize: 100,
  };

  @observable activeCategory: string;

  @observable selected?: string;

  @observable categoryPages: { [key: string]: number };

  @computed
  get selectedIndex(): number {
    return categories[this.activeCategory].indexOf(this.selectedIcon);
  }

  @computed
  get filteredIcons(): string[] {
    const { text } = this;
    if (text) {
      return flatten(categoryKeys.map(category => categories[category].filter(icon => icon.startsWith(text))));
    }
    return [];
  }

  get selectedIcon() {
    return this.selected || this.getValue() || categories[this.activeCategory][0];
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.categoryPages = {};
      this.activeCategory = categoryKeys[0];
    });
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['pageSize']);
  }

  @action
  setActiveCategory(category: string) {
    this.activeCategory = category;
    const page = this.categoryPages[category];
    this.changeSelected(categories[category][(page - 1) * this.props.pageSize!]);
  }

  @action
  setCategoryPage(page: number, category: string) {
    this.categoryPages[category] = page;
    this.changeSelected(categories[category][(page - 1) * this.props.pageSize!]);
  }

  @autobind
  handleTabsChange(category: string) {
    this.setActiveCategory(category);
  };

  @autobind
  handleItemSelect(icon: string) {
    this.choose(icon);
  };

  @autobind
  handlePageChange(page: number, category: string) {
    this.setCategoryPage(page, category);
  }

  @autobind
  handleKeyDown(e) {
    if (!this.isDisabled() && !this.isReadOnly()) {
      if (this.popup) {
        switch (e.keyCode) {
          case KeyCode.RIGHT:
            stopEvent(e);
            this.handleKeyDownRight();
            break;
          case KeyCode.LEFT:
            stopEvent(e);
            this.handleKeyDownLeft();
            break;
          case KeyCode.DOWN:
            stopEvent(e);
            this.handleKeyDownDown();
            break;
          case KeyCode.UP:
            stopEvent(e);
            this.handleKeyDownUp();
            break;
          case KeyCode.END:
            stopEvent(e);
            this.handleKeyDownEnd();
            break;
          case KeyCode.HOME:
            stopEvent(e);
            this.handleKeyDownHome();
            break;
          case KeyCode.PAGE_UP:
            stopEvent(e);
            this.handleKeyDownPageUp();
            break;
          case KeyCode.PAGE_DOWN:
            stopEvent(e);
            this.handleKeyDownPageDown();
            break;
          case KeyCode.ENTER:
            e.preventDefault();
            this.handleKeyDownEnter();
            break;
          case KeyCode.TAB:
            this.handleKeyDownTab();
            break;
          case KeyCode.ESC:
            e.preventDefault();
            this.handleKeyDownEsc();
            break;
          default:
        }
      } else if (e.keyCode === KeyCode.SPACE) {
        e.preventDefault();
        this.handleKeyDownSpace();
      }
    }
    super.handleKeyDown(e);
  }

  handleKeyDownHome() {
    const { activeCategory, categoryPages, props: { pageSize } } = this;
    const category = categories[activeCategory];
    const page = categoryPages[activeCategory] || 1;
    this.changeSelected(category[(page - 1) * pageSize!]);
  }

  handleKeyDownEnd() {
    const { activeCategory, categoryPages, props: { pageSize } } = this;
    const category = categories[activeCategory];
    const page = categoryPages[activeCategory] || 1;
    this.changeSelected(category[page * pageSize! - 1] || category[category.length - 1]);
  }

  handleKeyDownLeftOrRight(isLeft: boolean) {
    const { activeCategory, selectedIndex, categoryPages, props: { pageSize } } = this;
    const step = isLeft ? -1 : 1;
    let category = categories[activeCategory];
    let index = selectedIndex;
    if (index % COLUMNS === (isLeft ? 0 : COLUMNS - 1) || (!isLeft && index === category.length - 1)) {
      const activeCategoryIndex = categoryKeys.indexOf(activeCategory);
      if (activeCategoryIndex !== (isLeft ? 0 : categoryKeys.length - 1)) {
        const newTabIndex = activeCategoryIndex + step;
        const newKey = categoryKeys[newTabIndex];
        this.setActiveCategory(newKey);
        const page = categoryPages[activeCategory] || 1;
        category = categories[newKey];
        const newPage = categoryPages[newKey] || 1;
        index += (newPage - page) * pageSize!;
        if (!category[index]) {
          index = isLeft ? category.length - 1 : (newPage - 1) * pageSize!;
        }
      }
    } else {
      index += step;
    }
    if (category[index]) {
      this.changeSelected(category[index]);
    }
  }

  handleKeyDownUpOrDown(isUP) {
    const { activeCategory, selectedIndex, categoryPages, props: { pageSize } } = this;
    const step = isUP ? -1 : 1;
    const category = categories[activeCategory];
    let index = selectedIndex;
    const page = categoryPages[activeCategory] || 1;
    if (
      isUP
        ? index < (page - 1) * pageSize! + COLUMNS && page > 1
        : index > page * pageSize! - COLUMNS && page < Math.ceil(category.length / pageSize!)
    ) {
      this.setCategoryPage(page + step, activeCategory);
    }
    index += step * COLUMNS;
    if (category[index]) {
      this.changeSelected(category[index]);
    }
  }

  handleKeyDownLeft() {
    this.handleKeyDownLeftOrRight(true);
  }

  handleKeyDownRight() {
    this.handleKeyDownLeftOrRight(false);
  }

  handleKeyDownUp() {
    this.handleKeyDownUpOrDown(true);
  }

  handleKeyDownDown() {
    if (this.popup) {
      this.handleKeyDownUpOrDown(false);
    } else {
      this.expand();
    }
  }

  handleKeyDownPageUp() {
    const { activeCategory, selectedIndex, categoryPages, props: { pageSize } } = this;
    const page = categoryPages[activeCategory] || 1;
    const category = categories[activeCategory];
    if (page > 1) {
      this.setCategoryPage(page - 1, activeCategory);
      this.changeSelected(category[selectedIndex - pageSize!]);
    }
  }

  handleKeyDownPageDown() {
    const { activeCategory, selectedIndex, categoryPages, props: { pageSize } } = this;
    const page = categoryPages[activeCategory] || 1;
    const category = categories[activeCategory];
    if (page < Math.ceil(category.length / pageSize!)) {
      this.setCategoryPage(page + 1, activeCategory);
      this.changeSelected(category[selectedIndex + pageSize!] || category[category.length - 1]);
    }
  }

  handleKeyDownEnter() {
    this.choose(this.selectedIcon);
  }

  handleKeyDownEsc() {
    this.collapse();
  }

  handleKeyDownTab() {
    this.collapse();
  }

  handleKeyDownSpace() {
    this.expand();
  }

  @action
  changeSelected(selected?: string) {
    this.selected = selected;
  }

  choose(icon?: string) {
    this.addValue(icon);
    this.changeSelected(icon);
    if (!this.multiple) {
      this.collapse();
    }
  }

  syncValueOnBlur(value) {
    if (this.filteredIcons.indexOf(value) !== -1) {
      this.choose(value);
    } else {
      this.setText(void 0);
    }
  }

  handlePopupAnimateAppear() {
  }

  handlePopupAnimateEnd() {
  }

  getPopupStyleFromAlign(): CSSProperties | any {
    return undefined;
  }

  getTriggerIconFont() {
    return 'developer_board';
  }

  getPopupContent() {
    const { text } = this;
    if (text) {
      return this.renderFilteredIcons();
    } else {
      return this.renderIconCategories();
    }
  }

  getPrefix() {
    const value = this.getValue();
    if (value) {
      return this.wrapperPrefix(<Icon type={value} />);
    }
  }

  renderFilteredIcons(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-single-tab`}>
        <IconCategory
          paging={false}
          value={this.selectedIcon}
          icons={this.filteredIcons}
          prefixCls={prefixCls}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }

  renderIconCategories() {
    const { activeCategory, prefixCls, props: { pageSize } } = this;
    const { TabPane } = Tabs;
    const tabs = categoryKeys.map(category => (
      <TabPane
        key={category}
        tab={$l('Icon', category)}
        className={`${prefixCls}-tab`}
      >
        <IconCategory
          page={this.categoryPages[category]}
          pageSize={pageSize}
          category={category}
          value={category === activeCategory ? this.selectedIcon : undefined}
          icons={categories[category]}
          prefixCls={prefixCls}
          onSelect={this.handleItemSelect}
          onPageChange={this.handlePageChange}
        />
      </TabPane>
    ));
    return (
      <div>
        <Tabs onChange={this.handleTabsChange} activeKey={activeCategory}>
          {tabs}
        </Tabs>
      </div>
    );
  }
}
