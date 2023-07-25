import React, { CSSProperties, ReactNode } from 'react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import flatten from 'lodash/flatten';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import Icon from '../icon';
import Tabs from '../tabs';
import { $l } from '../locale-context';
import IconCategory from './IconCategory';
import autobind from '../_util/autobind';
import { preventDefault, stopEvent } from '../_util/EventManager';
import { Locale } from '../locale-context/interface';

const COLUMNS = 5;

export interface IconPickerProps extends TriggerFieldProps {
  pageSize?: number;
  customFontName?: string;
  icons?: { [key: string]: string[] } | string[];
}
type CategoryType = keyof Locale['Icon'];

@observer
export default class IconPicker extends TriggerField<IconPickerProps> {
  static displayName = 'IconPicker';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'icon-picker',
    pageSize: 100,
  };

  @observable activeCategory: CategoryType;

  @observable selected?: string;

  @observable categoryPages: { [key: string]: number };

  @computed
  get categories(): { [key: string]: string[] } {
    const { icons: propsIcon } = this.props;
    const icons = propsIcon || this.getContextConfig('icons');
    return isArrayLike(icons) ? { default: icons } : icons;
  }

  @computed
  get categoryKeys(): CategoryType[] {
    return Object.keys(this.categories) as CategoryType[];
  }

  @computed
  get selectedIndex(): number {
    return this.categories[this.activeCategory].indexOf(this.selectedIcon);
  }

  @computed
  get filteredIcons(): string[] {
    const { text, categories } = this;
    if (text) {
      return flatten(
        this.categoryKeys.map(category =>
          categories[category].filter(icon => icon.startsWith(text)),
        ),
      );
    }
    return [];
  }

  @computed
  get selectedIcon() {
    const { categories } = this;
    return this.selected || this.getValue() || categories[this.activeCategory][0];
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.categoryPages = {};
      this.activeCategory = this.categoryKeys[0];
    });
  }

  get range(): boolean {
    return false;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'pageSize',
      'customFontName',
      'icons',
    ]);
  }

  @action
  setActiveCategory(category: CategoryType) {
    this.activeCategory = category;
    const page = this.categoryPages[category];
    this.changeSelected(this.categories[category][(page - 1) * this.props.pageSize!]);
  }

  @action
  setCategoryPage(page: number, category: string) {
    this.categoryPages[category] = page;
    this.changeSelected(this.categories[category][(page - 1) * this.props.pageSize!]);
  }

  @autobind
  handleTabsChange(category: CategoryType) {
    this.setActiveCategory(category);
  }

  @autobind
  handleItemSelect(icon: string) {
    this.choose(icon);
  }

  @autobind
  handlePageChange(page: number, category: string) {
    this.setCategoryPage(page, category);
  }

  @autobind
  handleKeyDown(e) {
    if (!this.disabled && !this.readOnly) {
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
    const {
      activeCategory,
      categoryPages,
      props: { pageSize },
    } = this;
    const category = this.categories[activeCategory];
    const page = categoryPages[activeCategory] || 1;
    this.changeSelected(category[(page - 1) * pageSize!]);
  }

  handleKeyDownEnd() {
    const {
      activeCategory,
      categoryPages,
      props: { pageSize },
    } = this;
    const category = this.categories[activeCategory];
    const page = categoryPages[activeCategory] || 1;
    this.changeSelected(category[page * pageSize! - 1] || category[category.length - 1]);
  }

  handleKeyDownLeftOrRight(isLeft: boolean) {
    const {
      activeCategory,
      selectedIndex,
      categoryPages,
      categories,
      categoryKeys,
      props: { pageSize },
    } = this;
    const step = isLeft ? -1 : 1;
    let category = categories[activeCategory];
    let index = selectedIndex;
    if (
      index % COLUMNS === (isLeft ? 0 : COLUMNS - 1) ||
      (!isLeft && index === category.length - 1)
    ) {
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
    const {
      activeCategory,
      selectedIndex,
      categoryPages,
      props: { pageSize },
    } = this;
    const step = isUP ? -1 : 1;
    const category = this.categories[activeCategory];
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
    const {
      activeCategory,
      selectedIndex,
      categoryPages,
      props: { pageSize },
    } = this;
    const page = categoryPages[activeCategory] || 1;
    const category = this.categories[activeCategory];
    if (page > 1) {
      this.setCategoryPage(page - 1, activeCategory);
      this.changeSelected(category[selectedIndex - pageSize!]);
    }
  }

  handleKeyDownPageDown() {
    const {
      activeCategory,
      selectedIndex,
      categoryPages,
      props: { pageSize },
    } = this;
    const page = categoryPages[activeCategory] || 1;
    const category = this.categories[activeCategory];
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
    this.prepareSetValue(icon);
    this.changeSelected(icon);
    if (!this.multiple) {
      this.collapse();
    }
  }

  syncValueOnBlur(value) {
    if (value) {
      if (this.filteredIcons.indexOf(value) !== -1) {
        this.choose(value);
      } else {
        this.setText(undefined);
      }
    } else if (!this.multiple) {
      this.setValue(this.emptyValue);
    } else if (this.getProp('required')) {
      const oldValues = this.getValues();
      this.validate(oldValues, false);
    }
  }

  handlePopupAnimateAppear() {
    // noop
  }

  handlePopupAnimateEnd() {
    // noop
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
    }
    return this.renderIconCategories();
  }

  getPrefix() {
    const { customFontName } = this.props;
    const value = this.getValue();
    if (value) {
      return this.wrapperPrefix(<Icon customFontName={customFontName} type={value} />);
    }
  }

  renderFilteredIcons(): ReactNode {
    const { prefixCls } = this;
    const { customFontName } = this.props;
    return (
      <div className={`${prefixCls}-single-tab`} onMouseDown={preventDefault}>
        <IconCategory
          paging={false}
          customFontName={customFontName}
          value={this.selectedIcon}
          icons={this.filteredIcons}
          prefixCls={prefixCls}
          onSelect={this.handleItemSelect}
        />
      </div>
    );
  }

  renderIconCategories() {
    const {
      activeCategory,
      prefixCls,
      props: { pageSize, customFontName },
      categories,
      categoryKeys,
      categoryPages,
    } = this;
    const { TabPane } = Tabs;
    if (categoryKeys.length > 1) {
      const tabs = categoryKeys.map(category => (
        <TabPane key={category} tab={$l('Icon', category)} className={`${prefixCls}-tab`}>
          <IconCategory
            page={categoryPages[category]}
            pageSize={pageSize}
            category={category}
            customFontName={customFontName}
            value={category === activeCategory ? this.selectedIcon : undefined}
            icons={categories[category]}
            prefixCls={prefixCls}
            onSelect={this.handleItemSelect}
            onPageChange={this.handlePageChange}
          />
        </TabPane>
      ));
      return (
        <div onMouseDown={preventDefault}>
          <Tabs onChange={this.handleTabsChange} activeKey={activeCategory}>
            {tabs}
          </Tabs>
        </div>
      );
    }
    const category = categoryKeys[0];
    return (
      <div className={`${prefixCls}-single-tab`} onMouseDown={preventDefault}>
        <IconCategory
          page={categoryPages[category]}
          pageSize={pageSize}
          category={category}
          customFontName={customFontName}
          value={category === activeCategory ? this.selectedIcon : undefined}
          icons={categories[category]}
          prefixCls={prefixCls}
          onSelect={this.handleItemSelect}
          onPageChange={this.handlePageChange}
        />
      </div>
    );
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }
}
