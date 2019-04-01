import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import Select from '../select/Select';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import { $l } from '../locale-context';

export interface PaginationProps extends DataSetComponentProps {
  total?: number;
  page?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
}

@observer
export default class Pagination extends DataSetComponent<PaginationProps> {
  static displayName = 'Pagination';

  static propTypes = {
    total: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    onChange: PropTypes.func,
    showSizeChanger: PropTypes.bool,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'pro-pagination',
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
  };

  @observable current: number;

  @observable currentTotal?: number;

  @observable currentPageSize: number;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.current = props.page || 1;
      this.currentTotal = props.total;
      this.currentPageSize = props.pageSize || 10;
    });
  }

  @action
  handlePropsReceive(props) {
    const { page, total, pageSize } = props;
    if (page !== void 0) {
      this.current = page;
    }
    if (total !== void 0) {
      this.currentTotal = total;
    }
    if (pageSize !== void 0) {
      this.currentPageSize = pageSize;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handlePropsReceive(nextProps);
  }

  @computed
  get pageSize(): number {
    const { dataSet } = this.props;
    if (dataSet) {
      return dataSet.pageSize;
    }
    return this.currentPageSize;
  }

  @computed
  get page(): number {
    const { dataSet } = this.props;
    if (dataSet) {
      return dataSet.currentPage;
    }
    return this.current;
  }

  @computed
  get total(): number | undefined {
    const { dataSet } = this.props;
    if (dataSet) {
      return dataSet.totalCount;
    }
    return this.currentTotal;
  }

  @computed
  get totalPage(): number {
    const { dataSet } = this.props;
    const { total, pageSize } = this;
    if (dataSet) {
      return dataSet.totalPage;
    }
    if (total !== void 0 && pageSize !== void 0) {
      return Math.ceil(total / pageSize);
    }
    return 1;
  }

  handlePageSizeChange = (value: number) => {
    this.handleChange(this.page, Number(value));
  };

  @action
  handleChange(page: number, pageSize: number) {
    const { dataSet, onChange } = this.props;
    if (this.pageSize !== pageSize) {
      this.currentPageSize = pageSize;
      this.current = 1;
      if (dataSet) {
        dataSet.pageSize = pageSize;
        dataSet.currentPage = 1;
        dataSet.query();
      }
    } else {
      this.current = page;
    }
    if (onChange) {
      onChange(page, pageSize);
    }
  }

  firstPage = () => {
    const { dataSet } = this.props;
    if (dataSet) {
      dataSet.firstPage();
    }
    this.handleChange(1, this.pageSize);
  };

  prePage = () => {
    const { dataSet } = this.props;
    if (dataSet) {
      dataSet.prePage();
    }
    this.handleChange(this.page - 1, this.pageSize);
  };

  nextPage = () => {
    const { dataSet } = this.props;
    if (dataSet) {
      dataSet.nextPage();
    }
    this.handleChange(this.page + 1, this.pageSize);
  };

  lastPage = () => {
    const { dataSet } = this.props;
    if (dataSet) {
      dataSet.lastPage();
    }
    this.handleChange(this.totalPage, this.pageSize);
  };

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'total',
      'page',
      'pageSize',
      'onChange',
      'pageSizeOptions',
      'showSizeChanger',
    ]);
  }

  getOptions(): ReactNode {
    const { pageSize } = this;
    let { pageSizeOptions } = this.props;
    const options = pageSizeOptions || [];
    if (options.indexOf(String(pageSize)) === -1) {
      options.unshift(String(pageSize));
    }
    const { Option } = Select;
    return options.map(option => (
      <Option key={option} value={option}>{option}</Option>
    ));
  }

  render() {
    const { total, pageSize, page } = this;
    if (total === void 0 || pageSize === void 0 || page === void 0) {
      return null;
    }
    const { prefixCls, totalPage, props: { children, showSizeChanger } } = this;

    return (
      <nav {...this.getMergedProps()}>
        {children}
        {showSizeChanger && <span>{$l('Pagination', 'records_per_page')}</span>}
        {showSizeChanger && <Select onChange={this.handlePageSizeChange} value={String(pageSize)} clearButton={false}>{this.getOptions()}</Select>}
        <span className={`${prefixCls}-page-info`}>{pageSize * (page - 1) + 1} - {Math.min(pageSize * page, total)} / {total}</span>
        <Button funcType={FuncType.flat} icon="first_page" disabled={page === 1} onClick={this.firstPage} />
        <Button funcType={FuncType.flat} icon="navigate_before" disabled={page === 1} onClick={this.prePage} />
        <Button funcType={FuncType.flat} icon="navigate_next" disabled={page === totalPage} onClick={this.nextPage} />
        <Button funcType={FuncType.flat} icon="last_page" disabled={page === totalPage} onClick={this.lastPage} />
      </nav>
    );
  }
}
