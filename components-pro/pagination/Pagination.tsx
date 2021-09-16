import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import isString from 'lodash/isString';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import ObserverSelect from '../select/Select';
import ObserverNumberField from '../number-field/NumberField';
import Button from '../button';
import autobind from '../_util/autobind';
import { $l } from '../locale-context';
import Pager from './Pager';
import Icon from '../icon';
import { SizeChangerPosition, QuickJumperPosition } from './enum';
import { Renderer } from '../field/FormField';

export type PagerType = 'page' | 'prev' | 'next' | 'first' | 'last' | 'jump-prev' | 'jump-next';

export interface PaginationProps extends DataSetComponentProps {
  total?: number;
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  itemRender?: (page: number, type: PagerType) => ReactNode;
  pageSizeOptions?: string[];
  pageSizeEditable?: boolean;
  sizeChangerPosition?: SizeChangerPosition;
  sizeChangerOptionRenderer?: Renderer;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean | { goButton?: React.ReactNode };
  showSizeChangerLabel?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  showPager?: boolean;
  hideOnSinglePage?: boolean;
  simple?: boolean;
  quickJumperPosition?: QuickJumperPosition;
}

function defaultItemRender(page: number, type: PagerType) {
  switch (type) {
    case 'first':
      return <Icon type="first_page" />;
    case 'last':
      return <Icon type="last_page" />;
    case 'prev':
      return <Icon type="navigate_before" />;
    case 'next':
      return <Icon type="navigate_next" />;
    case 'jump-prev':
    case 'jump-next':
      return '•••';
    default:
      return page;
  }
}

@observer
export default class Pagination extends DataSetComponent<PaginationProps> {
  static displayName = 'Pagination';

  static propTypes = {
    total: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    onChange: PropTypes.func,
    itemRender: PropTypes.func,
    sizeChangerPosition: PropTypes.oneOf([SizeChangerPosition.left, SizeChangerPosition.right]),
    sizeChangerOptionRenderer: PropTypes.func,
    showSizeChanger: PropTypes.bool,
    showQuickJumper: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    showSizeChangerLabel: PropTypes.bool,
    showTotal: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    showPager: PropTypes.bool,
    simple: PropTypes.bool,
    quickJumperPosition: PropTypes.oneOf([QuickJumperPosition.left, QuickJumperPosition.right]),
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'pagination',
    sizeChangerPosition: SizeChangerPosition.left,
    quickJumperPosition: QuickJumperPosition.right,
    sizeChangerOptionRenderer: ({ text }) => text,
    hideOnSinglePage: false,
    showSizeChanger: true,
    showQuickJumper: false,
    showSizeChangerLabel: true,
    showTotal: true,
    simple: false,
  };

  goInputText: number;

  @observable pageInput?: number | '';

  @computed
  get pageSize(): number {
    const { dataSet, pageSize } = this.observableProps;
    if (dataSet) {
      return dataSet.pageSize;
    }
    return pageSize!;
  }

  @computed
  get page(): number {
    const { dataSet, page } = this.observableProps;
    if (dataSet) {
      return dataSet.currentPage;
    }
    return page!;
  }

  @computed
  get total(): number | undefined {
    const { dataSet, total } = this.observableProps;
    if (dataSet) {
      return dataSet.totalCount;
    }
    return total;
  }

  @computed
  get totalPage(): number {
    const { dataSet } = this.observableProps;
    const { total, pageSize } = this;
    if (dataSet) {
      return dataSet.totalPage;
    }
    if (total !== undefined && pageSize !== undefined) {
      return Math.ceil(total / pageSize);
    }
    return 1;
  }

  @computed
  get next(): boolean {
    const { total = 0, pageSize, page } = this;
    return page < Math.floor((total - 1) / pageSize) + 1;
  }

  getObservableProps(props, context) {
    const globalPagination = getConfig('pagination');
    const pageSizeOptions = props.pageSizeOptions || (globalPagination && globalPagination.pageSizeOptions) || ['10', '20', '50', '100'];
    const maxPageSize = Math.max(defaultTo('maxPageSize' in props ? props.maxPageSize : (globalPagination && globalPagination.maxPageSize), 100), ...pageSizeOptions);
    return {
      ...super.getObservableProps(props, context),
      page: defaultTo('page' in props ? props.page : globalPagination && globalPagination.page, 1),
      pageSize: defaultTo('pageSize' in props ? props.pageSize : globalPagination && globalPagination.pageSize, 10),
      total: props.total,
      pageSizeOptions,
      pageSizeEditable: 'pageSizeEditable' in props ? props.pageSizeEditable : (globalPagination && globalPagination.pageSizeEditable),
      maxPageSize,
    };
  }

  @autobind
  handlePageSizeBeforeChange(value): boolean | Promise<boolean> {
    if (value < 1 || value > this.observableProps.maxPageSize) {
      return false;
    }
    const { dataSet } = this.props;
    if (dataSet) {
      return dataSet.modifiedCheck();
    }
    return true;
  }

  @autobind
  handlePageSizeChange(value: number) {
    this.handleChange(this.page, Number(value));
  }

  @action
  handleChange(page: number, pageSize: number) {
    const { dataSet, onChange } = this.props;
    if (this.pageSize !== pageSize) {
      this.observableProps.pageSize = pageSize;
      this.observableProps.page = 1;
      if (dataSet) {
        dataSet.pageSize = pageSize;
        dataSet.currentPage = 1;
        dataSet.query();
      }
    } else {
      this.observableProps.page = page;
    }
    if (onChange) {
      onChange(page, pageSize);
    }
  }

  handlePagerClick = page => {
    const { dataSet } = this.props;
    if (dataSet) {
      dataSet.page(page);
    }
    this.handleChange(page, this.pageSize);
  };

  getValidValue(value) {
    const { page, totalPage } = this;
    value = Number(value);
    if (isNaN(value)) {
      value = page;
    }
    if (value > totalPage) {
      value = totalPage;
    }
    return value;
  }

  jumpPage = debounce(value => {
    if (!isNil(value)) {
      this.handlePagerClick(value);
    }
  }, 200);

  /**
   * 快速跳至 input 事件
   * @param e
   */
  @autobind
  @action
  handleJump(e) {
    let { value } = e.target;
    const { page, totalPage, props: { showQuickJumper } } = this;
    value = Number(value);
    if (isNaN(value)) {
      value = page;
    }
    if (value > totalPage) {
      value = totalPage;
    }
    this.goInputText = value;
    if (showQuickJumper) {
      return;
    }
    this.jumpPage(value);
  }

  @autobind
  handleJumpChange(value) {
    const { page, totalPage, props: { showQuickJumper } } = this;
    value = Number(value);
    if (isNaN(value)) {
      value = page;
    }
    if (value > totalPage) {
      value = totalPage;
    }

    if (showQuickJumper && value !== '') {
      this.jumpPage(value);
      this.pageInput = '';
    }
  }

  @autobind
  handleJumpGo(e) {
    if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
      this.jumpPage(this.goInputText);
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'total',
      'page',
      'pageSize',
      'maxPageSize',
      'pageSizeEditable',
      'onChange',
      'pageSizeOptions',
      'itemRender',
      'showSizeChanger',
      'showQuickJumper',
      'showSizeChangerLabel',
      'showTotal',
      'showPager',
      'sizeChangerPosition',
      'sizeChangerOptionRenderer',
      'hideOnSinglePage',
      'simple',
      'quickJumperPosition',
    ]);
  }

  @action
  getOptions(): ReactNode {
    const { Option } = ObserverSelect;
    return this.observableProps.pageSizeOptions.map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  }

  getPager(page: number, type: PagerType, active: boolean = false, disabledSender?: boolean) {
    const {
      prefixCls,
      props: { itemRender = defaultItemRender, disabled = false },
    } = this;
    const disabledValue = disabledSender || disabled;
    const classNamePager = isString(type) ? `${prefixCls}-pager-${type}` : ``;
    return (
      <Pager
        key={type === 'page' ? page : type}
        page={page}
        active={active}
        type={type}
        onClick={this.handlePagerClick}
        renderer={itemRender}
        disabled={disabledValue}
        className={`${prefixCls}-pager ${classNamePager}`}
      />
    );
  }

  renderPagers(page: number): ReactNode {
    const { totalPage } = this;
    const bufferSize = 1;
    const pagerList: any[] = [];
    if (totalPage <= 3 + bufferSize * 2) {
      for (let i = 1; i <= totalPage; i += 1) {
        pagerList.push(this.getPager(i, 'page', page === i));
      }
    } else {
      let left = Math.max(1, page - bufferSize);
      let right = Math.min(totalPage, page + bufferSize);
      if (page - 1 <= bufferSize) {
        right = 1 + bufferSize * 2;
      }

      if (totalPage - page <= bufferSize) {
        left = totalPage - bufferSize * 2;
      }
      for (let i = left; i <= right; i++) {
        pagerList.push(this.getPager(i, 'page', page === i));
      }
      if (page - 1 >= bufferSize * 2 && page !== 1 + 2) {
        pagerList.unshift(this.getPager(Math.max(page - 5, 1), 'jump-prev'));
      }
      if (totalPage - page >= bufferSize * 2 && page !== totalPage - 2) {
        pagerList.push(this.getPager(Math.min(page + 5, totalPage), 'jump-next'));
      }

      if (left !== 1) {
        pagerList.unshift(this.getPager(1, 'page', page === 1));
      }
      if (totalPage > 1 && right !== totalPage) {
        pagerList.push(this.getPager(totalPage, 'page', page === totalPage));
      }
    }
    return pagerList;
  }

  renderSizeChange(pageSize: number): ReactNode {
    const {
      showSizeChangerLabel,
      showSizeChanger,
      sizeChangerOptionRenderer,
      disabled,
    } = this.props;
    if (showSizeChanger) {
      const { pageSizeEditable } = this.observableProps;
      const { prefixCls } = this;
      const select = (
        <ObserverSelect
          isFlat
          searchable={false}
          key="size-select"
          className={classNames(`${prefixCls}-size-changer`, { [`${prefixCls}-size-editable`]: pageSizeEditable })}
          disabled={disabled}
          onBeforeChange={this.handlePageSizeBeforeChange}
          onChange={this.handlePageSizeChange}
          value={String(pageSize)}
          clearButton={false}
          renderer={sizeChangerOptionRenderer}
          optionRenderer={sizeChangerOptionRenderer}
          combo={pageSizeEditable}
          restrict="0-9"
        >
          {this.getOptions()}
        </ObserverSelect>
      );
      return showSizeChangerLabel
        ? [<span className={`${prefixCls}-perpage`} key="size-info">{$l('Pagination', 'records_per_page')}</span>, select]
        : select;
    }
  }

  renderTotal(pageSize: number, page: number, total: number): ReactNode {
    const { prefixCls, props: { showTotal } } = this;
    const from = pageSize * (page - 1) + 1;
    const to = Math.min(pageSize * page, total);
    if (typeof showTotal === 'function') {
      return (
        <span key="total" className={`${prefixCls}-page-info`}>
          {showTotal(total, [from, to])}
        </span>
      );
    }
    return (
      <span key="total" className={`${prefixCls}-page-info`}>
        <span className="word">{from}</span>-<span className="word">{to}</span>/<span className="word">{total}</span>
      </span>
    );
  }

  /**
   * 渲染快速跳至
   */
  renderQuickGo(): ReactNode {
    const { prefixCls } = this;
    const { disabled, showQuickJumper } = this.props;
    let gotoButton: any = null;

    if (isObject(showQuickJumper) && 'goButton' in showQuickJumper) {
      const { goButton } = showQuickJumper;
      gotoButton =
        typeof goButton === 'boolean' ? (
          <Button
            className={`${prefixCls}-go-button`}
            onClick={this.handleJumpGo}
            onKeyUp={this.handleJumpGo}
            disabled={disabled}
          >
            {$l('Pagination', 'jump_to_confirm')}
          </Button>
        ) : (
          <span
            className={`${prefixCls}-go-button`}
            onClick={this.handleJumpGo}
            onKeyUp={this.handleJumpGo}
          >
              {goButton}
          </span>
        );
    }

    return (
      <div className={`${prefixCls}-quick-jumper`}>
        {$l('Pagination', 'jump_to')}
        <ObserverNumberField value={this.pageInput} disabled={disabled} min={1} onChange={this.handleJumpChange} onInput={this.handleJump} />
        {$l('Pagination', 'page')}
        {gotoButton}
      </div>
    );
  }

  render() {
    const {
      total,
      pageSize,
      page,
      props: { hideOnSinglePage, simple },
      prefixCls,
    } = this;
    if (total === undefined || pageSize === undefined || page === undefined) {
      return null;
    }
    if (hideOnSinglePage === true && total <= pageSize) {
      return null;
    }

    const {
      totalPage,
      props: { children, sizeChangerPosition, showTotal, showPager, showQuickJumper, quickJumperPosition },
    } = this;

    const sizeChanger = this.renderSizeChange(pageSize);

    if (simple) {
      return (
        <nav {...this.getMergedProps()}>
          {this.getPager(page - 1, 'prev', false, page === 1)}
          <li
            className={`${prefixCls}-simple-pager`}
          >
            <ObserverNumberField value={page} min={1} onChange={this.handleJumpChange} onInput={this.handleJump} />
            <span>／</span>
            {totalPage}
          </li>
          {this.getPager(page + 1, 'next', false, !this.next)}
        </nav>
      );
    }

    return (
      <nav {...this.getMergedProps()}>
        {children}
        {sizeChangerPosition === SizeChangerPosition.left && sizeChanger}
        {showQuickJumper && quickJumperPosition === QuickJumperPosition.left && this.renderQuickGo()}
        {showTotal && this.renderTotal(pageSize, page, total)}
        {this.getPager(1, 'first', false, page === 1)}
        {this.getPager(page - 1, 'prev', false, page === 1)}
        {showPager && this.renderPagers(page)}
        {this.getPager(page + 1, 'next', false, !this.next)}
        {this.getPager(totalPage, 'last', false, !this.next)}
        {sizeChangerPosition === SizeChangerPosition.right && sizeChanger}
        {showQuickJumper && quickJumperPosition === QuickJumperPosition.right && this.renderQuickGo()}
      </nav>
    );
  }
}
