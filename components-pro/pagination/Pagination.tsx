import React, { ReactNode } from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import ObserverSelect from '../select/Select';
import ObserverNumberField from '../number-field/NumberField';
import Button from '../button';
import autobind from '../_util/autobind';
import { $l } from '../locale-context';
import Pager from './Pager';
import Icon from '../icon';
import { QuickJumperPosition, SizeChangerPosition } from './enum';
import { Renderer } from '../field/FormField';
import { ValueChangeAction } from '../text-field/enum';
import QuickJumper from './QuickJumper';
import Tooltip from '../tooltip';
import { ShowValidation } from '../form/enum';

export type PagerType = 'page' | 'prev' | 'next' | 'first' | 'last' | 'jump-prev' | 'jump-next';

export interface PaginationProps extends DataSetComponentProps {
  total?: number;
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  beforeChange?: (page: number, pageSize: number) => Promise<boolean | undefined> | boolean | undefined | void; // apaas event test
  itemRender?: (page: number, type: PagerType) => ReactNode;
  pageSizeOptions?: string[];
  pageSizeEditable?: boolean;
  sizeChangerPosition?: SizeChangerPosition;
  sizeChangerOptionRenderer?: Renderer;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean | { goButton?: React.ReactNode };
  showSizeChangerLabel?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number], counting: boolean, page: number, pageSize: number) => React.ReactNode);
  showPager?: boolean | 'input';
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

  @observable pageInput?: number | '';

  private container: ObserverSelect;

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
    const { dataSet } = this.observableProps;
    const { total = 0, pageSize, page } = this;
    const noCount = dataSet && dataSet.paging === 'noCount';
    return noCount ? dataSet.length === pageSize : page < Math.floor((total - 1) / pageSize) + 1;
  }

  getObservableProps(props, context) {
    const globalPagination = this.getContextConfig('pagination');
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
      this.handleTooltipEnter(value);
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

  async handleChange(page: number, pageSize: number) {
    const { dataSet, onChange, beforeChange = noop } = this.props;
    let pageChange = page;
    if (this.pageSize !== pageSize && await beforeChange(page, pageSize) !== false) {
      pageChange = 1;
      runInAction(() => {
        this.observableProps.pageSize = pageSize;
        this.observableProps.page = 1;
        if (dataSet) {
          dataSet.pageSize = pageSize;
          dataSet.currentPage = 1;
          dataSet.query(1, undefined, true);
        }
      });
    } else {
      runInAction(() => {
        this.observableProps.page = page;
      });
    }
    if (onChange) {
      onChange(pageChange, pageSize);
    }
  }

  @autobind
  handlePagerClick(page) {
    this.jumpPage(page);
  }

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

  async jumpPage(page) {
    const { dataSet, beforeChange = noop } = this.props;
    if (await beforeChange(page, this.pageSize) !== false) {
      if (dataSet) {
        dataSet.page(page);
      }
      this.handleChange(page, this.pageSize);
    }
  }

  @autobind
  handleJumpChange(value) {
    const { page, totalPage, props: { showQuickJumper, simple } } = this;
    value = Number(value);
    if (isNaN(value) || value < 1) {
      value = page;
    }
    if (value > totalPage) {
      value = totalPage;
    }
    if (simple) {
      this.jumpPage(value);
    } else if (showQuickJumper) {
      if (isObject(showQuickJumper) && showQuickJumper.goButton) {
        this.pageInput = value;
      } else {
        this.jumpPage(value);
      }
    }
  }

  @autobind
  @action
  handleJumpGo(e) {
    if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
      const { pageInput } = this;
      if (pageInput) {
        this.jumpPage(pageInput);
        this.pageInput = '';
      }
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

  getPager(page: number, type: PagerType, active = false, disabledSender?: boolean) {
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

  handleTooltipEnter = (value) => {
    Tooltip.show(this.container.domNode, {
      title: <div className={`${this.prefixCls}-warning`}><Icon type='warning' />{value} {$l('Pagination', 'max_pagesize_info', { count: this.observableProps.maxPageSize })}</div>,
      placement: 'top',
      theme: 'light',
    });
    setTimeout(() => Tooltip.hide(), 2000);
  }

  saveRef = (node: ObserverSelect) => {
    this.container = node;
  };

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
          size={Size.small}
          ref={this.saveRef}
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
    const { prefixCls, props: { showTotal }, dataSet } = this;
    const from = pageSize * (page - 1) + 1;
    const counting = dataSet && dataSet.counting;
    const noCount = dataSet && dataSet.paging === 'noCount';
    const to = noCount ? pageSize * page : Math.min(pageSize * page, total);
    if (typeof showTotal === 'function') {
      return (
        <span key="total" className={`${prefixCls}-page-info`}>
          {showTotal(total, [from, to], counting !== undefined, page, pageSize)}
        </span>
      );
    }
    return (
      <span key="total" className={`${prefixCls}-page-info`}>
        {from} - {to} {noCount ? null : `/ ${counting ? '...' : total}`}
      </span>
    );
  }

  /**
   * 渲染快速跳至
   */
  renderQuickGo(): ReactNode {
    const { prefixCls, page } = this;
    const { disabled, showQuickJumper } = this.props;
    let gotoButton: any = null;

    if (isObject(showQuickJumper) && showQuickJumper.goButton) {
      const { goButton } = showQuickJumper;
      gotoButton =
        typeof goButton === 'boolean' ? (
          <Button
            className={`${prefixCls}-go-button`}
            onClick={this.handleJumpGo}
            onKeyUp={this.handleJumpGo}
            disabled={disabled}
            size={Size.small}
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
      <QuickJumper
        prefixCls={prefixCls}
        value={this.pageInput || page}
        onChange={this.handleJumpChange}
        disabled={disabled}
        gotoButton={gotoButton}
      />
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
      props: { children, sizeChangerPosition, showTotal, showPager, showQuickJumper, quickJumperPosition, disabled },
    } = this;

    const { dataSet } = this.observableProps;
    const noCount = dataSet && dataSet.paging === 'noCount';

    const sizeChanger = this.renderSizeChange(pageSize);

    const inputNode = (
      <>
        <ObserverNumberField
          value={page}
          min={1}
          onChange={this.handleJumpChange}
          valueChangeAction={ValueChangeAction.input} wait={200}
          disabled={disabled}
          showValidation={ShowValidation.tooltip}
        />
        <span className={`${prefixCls}-pager-separator`}>／</span>
        {totalPage}
      </>
    );

    if (simple) {
      return (
        <nav {...this.getMergedProps()}>
          {this.getPager(page - 1, 'prev', false, page === 1)}
          <li
            className={`${prefixCls}-simple-pager`}
          >
            {inputNode}
          </li>
          {this.getPager(page + 1, 'next', false, !this.next)}
        </nav>
      );
    }

    const pagersNode = showPager === 'input'
      ? (
        <span className={`${prefixCls}-pager ${prefixCls}-pager-input`}>
          {inputNode}
        </span>
      )
      : showPager ? this.renderPagers(page) : null;

    return (
      <nav {...this.getMergedProps()}>
        {children}
        {sizeChangerPosition === SizeChangerPosition.left && sizeChanger}
        {showQuickJumper && showPager !== 'input' && quickJumperPosition === QuickJumperPosition.left && this.renderQuickGo()}
        {showTotal && this.renderTotal(pageSize, page, total)}
        {this.getPager(1, 'first', false, page === 1)}
        {this.getPager(page - 1, 'prev', false, page === 1)}
        {pagersNode}
        {this.getPager(page + 1, 'next', false, !this.next)}
        {!noCount && this.getPager(totalPage, 'last', false, !this.next)}
        {sizeChangerPosition === SizeChangerPosition.right && sizeChanger}
        {showQuickJumper && showPager !== 'input' && quickJumperPosition === QuickJumperPosition.right && this.renderQuickGo()}
      </nav>
    );
  }
}
