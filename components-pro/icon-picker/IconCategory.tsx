import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import IconItem from './IconItem';
import Pagination from '../pagination/Pagination';
import autobind from '../_util/autobind';

export interface IconItemProps {
  prefixCls?: string;
  icons: string[];
  category?: string;
  value?: string;
  paging?: boolean;
  page?: number;
  pageSize?: number;
  onSelect: (type: string) => void;
  customFontName?: string;
  onPageChange?: (page: number, category?: string) => void;
}

@observer
export default class IconCategory extends Component<IconItemProps> {
  static displayName = 'IconCategory';

  static defaultProps = {
    paging: true,
  };

  @observable page: number;

  ul?: HTMLUListElement | null;

  constructor(props) {
    super(props);
    this.setPage(props.page);
  }

  @autobind
  saveRef(node) {
    this.ul = node;
  }

  @autobind
  handlePageChange(page: number) {
    this.setPage(page);
    const { onPageChange, category } = this.props;
    if (onPageChange) {
      onPageChange(page, category);
    }
  }

  @autobind
  handleItemSelect(icon) {
    const { onSelect } = this.props;
    onSelect(icon);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page && nextProps.page !== this.page) {
      this.setPage(nextProps.page);
    }
  }

  componentDidMount() {
    this.syncItemPosition();
  }

  componentDidUpdate() {
    this.syncItemPosition();
  }

  syncItemPosition() {
    const {
      props: { value, prefixCls },
      ul,
    } = this;
    if (value && ul) {
      const item = ul.querySelector(`li.${prefixCls}-item-selected`) as HTMLLIElement;
      if (item) {
        const { offsetHeight, scrollTop } = ul;
        const { offsetTop, offsetHeight: height } = item;
        if (offsetTop < scrollTop) {
          if (ul.scrollTo) {
            ul.scrollTo(0, offsetTop);
          } else {
            ul.scrollTop = offsetTop;
          }
        } else if (offsetTop + height > scrollTop + offsetHeight) {
          if (ul.scrollTo) {
            ul.scrollTo(0, offsetTop + height - offsetHeight);
          } else {
            ul.scrollTop = offsetTop + height - offsetHeight;
          }
        }
      }
    }
  }

  @action
  setPage(page = 1) {
    this.page = page;
  }

  renderPagination() {
    const {
      page,
      props: { paging, pageSize, prefixCls, icons },
    } = this;
    const total = icons.length;
    if (paging && total > pageSize!) {
      return (
        <Pagination
          key="page"
          className={`${prefixCls}-pagination`}
          total={total}
          page={page}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={this.handlePageChange}
          style={{ right: pxToRem(measureScrollbar(), true) }}
        />
      );
    }
  }

  renderIcons() {
    const { value, prefixCls, customFontName } = this.props;
    return this.getIcons().map(icon => (
      <IconItem
        key={icon}
        customFontName={customFontName}
        prefixCls={prefixCls}
        type={icon}
        onSelect={this.handleItemSelect}
        active={value === icon}
      />
    ));
  }

  getIcons() {
    const {
      page,
      props: { paging, pageSize, icons },
    } = this;
    if (paging && icons.length > pageSize!) {
      return icons.slice((page - 1) * pageSize!, page * pageSize!);
    }
    return icons;
  }

  render() {
    const {
      props: { prefixCls },
    } = this;
    return (
      <div className={`${prefixCls}-category`}>
        {this.renderPagination()}
        <ul key="icon-items" ref={this.saveRef}>
          {this.renderIcons()}
        </ul>
      </div>
    );
  }
}
