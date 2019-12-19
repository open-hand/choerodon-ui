import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import ObserverSelect from '../select/Select';
import ObserverNumberField from '../number-field/NumberField';
import autobind from '../_util/autobind';
import { $l } from '../locale-context';
import Pager from './Pager';
import Icon from '../icon';
import { SizeChangerPosition } from './enum';
import { Renderer } from '../field/FormField';

export type PagerType = 'page' | 'prev' | 'next' | 'first' | 'last' | 'jump-prev' | 'jump-next';

export interface PaginationProps extends DataSetComponentProps {
  total?: number;
  page?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  itemRender?: (page: number, type: PagerType) => ReactNode;
  pageSizeOptions?: string[];
  sizeChangerPosition?: SizeChangerPosition;
  sizeChangerOptionRenderer?: Renderer;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showSizeChangerLabel?: boolean;
  showTotal?: boolean;
  showPager?: boolean;
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
    showQuickJumper: PropTypes.bool,
    showSizeChangerLabel: PropTypes.bool,
    showTotal: PropTypes.bool,
    showPager: PropTypes.bool,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'pagination',
    pageSizeOptions: ['10', '20', '50', '100'],
    sizeChangerPosition: SizeChangerPosition.left,
    sizeChangerOptionRenderer: ({ text }) => text,
    showSizeChanger: true,
    showQuickJumper: false,
    showSizeChangerLabel: true,
    showTotal: true,
  };

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

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      page: defaultTo(props.page, 1),
      pageSize: defaultTo(props.pageSize, 10),
      total: props.total,
    };
  }

  handlePageSizeChange = (value: number) => {
    this.handleChange(this.page, Number(value));
  };

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

  /**
   * 快速跳至 input 事件
   * @param e
   */
  @autobind
  @action
  handleJump(e) {
    let { value } = e.target;
    const { page, totalPage } = this;
    value = Number(value);
    if (isNaN(value)) {
      value = page;
    }
    if (value > totalPage) {
      value = totalPage;
    }
    this.jumpPage(value);
  }

  jumpPage = debounce(value => this.handlePagerClick(value), 500);

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'total',
      'page',
      'pageSize',
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
    ]);
  }

  getOptions(): ReactNode {
    const { pageSize } = this;
    const { pageSizeOptions } = this.props;
    const options = pageSizeOptions || [];
    if (options.indexOf(String(pageSize)) === -1) {
      options.unshift(String(pageSize));
    }
    const { Option } = ObserverSelect;
    return options.map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  }

  getPager(page: number, type: PagerType, active: boolean = false, disabled?: boolean) {
    const {
      prefixCls,
      props: { itemRender = defaultItemRender },
    } = this;
    return (
      <Pager
        key={type === 'page' ? page : type}
        page={page}
        active={active}
        type={type}
        onClick={this.handlePagerClick}
        renderer={itemRender}
        disabled={disabled}
        className={`${prefixCls}-pager`}
      />
    );
  }

  renderPagers(page: number): ReactNode {
    const { totalPage } = this;
    const bufferSize = 2;
    const pagerList: any[] = [];
    if (totalPage <= 1 + bufferSize) {
      for (let i = 1; i <= totalPage; i++) {
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
    const { showSizeChangerLabel, showSizeChanger, sizeChangerOptionRenderer } = this.props;
    if (showSizeChanger) {
      const select = (
        <ObserverSelect
          key="size-select"
          onChange={this.handlePageSizeChange}
          value={String(pageSize)}
          clearButton={false}
          renderer={sizeChangerOptionRenderer}
          optionRenderer={sizeChangerOptionRenderer}
        >
          {this.getOptions()}
        </ObserverSelect>
      );
      return showSizeChangerLabel
        ? [<span key="size-info">{$l('Pagination', 'records_per_page')}</span>, select]
        : select;
    }
  }

  renderTotal(pageSize: number, page: number, total: number): ReactNode {
    const { prefixCls } = this;
    return (
      <span key="total" className={`${prefixCls}-page-info`}>
        {pageSize * (page - 1) + 1} - {Math.min(pageSize * page, total)} / {total}
      </span>
    );
  }

  /**
   * 渲染快速跳至
   */
  renderQuickGo(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-quick-jumper`}>
        {$l('Pagination', 'jump_to')}
        <ObserverNumberField min={1} onInput={this.handleJump} />
        {$l('Pagination', 'page')}
      </div>
    );
  }

  render() {
    const { total, pageSize, page } = this;
    if (total === undefined || pageSize === undefined || page === undefined) {
      return null;
    }
    const {
      totalPage,
      props: { children, sizeChangerPosition, showTotal, showPager, showQuickJumper },
    } = this;

    const sizeChanger = this.renderSizeChange(pageSize);

    return (
      <nav {...this.getMergedProps()}>
        {children}
        {sizeChangerPosition === SizeChangerPosition.left && sizeChanger}
        {showTotal && this.renderTotal(pageSize, page, total)}
        {this.getPager(1, 'first', false, page === 1)}
        {this.getPager(page - 1, 'prev', false, page === 1)}
        {showPager && this.renderPagers(page)}
        {this.getPager(page + 1, 'next', false, page === totalPage)}
        {this.getPager(totalPage, 'last', false, page === totalPage)}
        {sizeChangerPosition === SizeChangerPosition.right && sizeChanger}
        {showQuickJumper && this.renderQuickGo()}
      </nav>
    );
  }
}
