import React, { cloneElement, Component } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Pager from './Pager';
import Options from './Options';
import KEYCODE from './KeyCode';
import LOCALE from './locale/zh_CN';

function isInteger(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
}

function defaultItemRender(page, type, element) {
  return element;
}

export default class Pagination extends Component {
  static defaultProps = {
    defaultCurrent: 1,
    total: 0,
    defaultPageSize: 10,
    onChange: noop,
    className: '',
    selectProps: { prefixCls: 'rc-select' },
    prefixCls: 'rc-pagination',
    selectComponentClass: null,
    hideOnSinglePage: false,
    showPrevNextJumpers: true,
    showQuickJumper: false,
    showSizeChanger: false,
    showLessItems: false,
    showTitle: true,
    onShowSizeChange: noop,
    locale: LOCALE,
    style: {},
    itemRender: defaultItemRender,
  };

  constructor(props) {
    super(props);

    const hasOnChange = props.onChange !== noop;
    const hasCurrent = ('current' in props);
    if (hasCurrent && !hasOnChange) {
      console.warn('Warning: You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.'); // eslint-disable-line
    }

    let current = props.defaultCurrent;
    if ('current' in props) {
      current = props.current;
    }

    let pageSize = props.defaultPageSize;
    if ('pageSize' in props) {
      pageSize = props.pageSize;
    }

    this.state = {
      current,
      currentInputValue: current,
      pageSize,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('current' in nextProps) {
      this.setState({
        current: nextProps.current,
        currentInputValue: nextProps.current,
      });
    }

    if ('pageSize' in nextProps) {
      const newState = {};
      let current = this.state.current;
      const newCurrent = this.calculatePage(nextProps.pageSize);
      current = current > newCurrent ? newCurrent : current;
      if (!('current' in nextProps)) {
        newState.current = current;
        newState.currentInputValue = current;
      }
      newState.pageSize = nextProps.pageSize;
      this.setState(newState);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // When current page change, fix focused style of prev item
    const { prefixCls } = this.props;
    if (prevState.current !== this.state.current && this.paginationNode) {
      const lastCurrentNode = this.paginationNode.querySelector(
        `.${prefixCls}-item-${prevState.current}`,
      );
      if (lastCurrentNode && document.activeElement === lastCurrentNode) {
        lastCurrentNode.blur();
      }
    }
  }

  savePaginationNode = (node) => {
    this.paginationNode = node;
  };

  calculatePage = (p) => {
    let pageSize = p;
    if (typeof pageSize === 'undefined') {
      pageSize = this.state.pageSize;
    }
    return Math.floor((this.props.total - 1) / pageSize) + 1;
  };

  isValid = (page) => {
    return isInteger(page) && page >= 1 && page !== this.state.current;
  };

  handleKeyDown = (e) => {
    if (e.keyCode === KEYCODE.ARROW_UP || e.keyCode === KEYCODE.ARROW_DOWN) {
      e.preventDefault();
    }
  };

  handleKeyUp = (e) => {
    const inputValue = e.target.value;
    const currentInputValue = this.state.currentInputValue;
    let value;

    if (inputValue === '') {
      value = inputValue;
    } else if (isNaN(Number(inputValue))) {
      value = currentInputValue;
    } else {
      value = Number(inputValue);
    }

    if (value !== currentInputValue) {
      this.setState({
        currentInputValue: value,
      });
    }

    if (e.keyCode === KEYCODE.ENTER) {
      this.handleChange(value);
    } else if (e.keyCode === KEYCODE.ARROW_UP) {
      this.handleChange(value - 1);
    } else if (e.keyCode === KEYCODE.ARROW_DOWN) {
      this.handleChange(value + 1);
    }
  };

  changePageSize = (size) => {
    let current = this.state.current;
    const newCurrent = this.calculatePage(size);
    current = current > newCurrent ? newCurrent : current;
    // fix the issue:
    // Once 'total' is 0, 'current' in 'onShowSizeChange' is 0, which is not correct.
    if (newCurrent === 0) {
      current = this.state.current;
    }

    if (typeof size === 'number') {
      if (!('pageSize' in this.props)) {
        this.setState({
          pageSize: size,
        });
      }
      if (!('current' in this.props)) {
        this.setState({
          current,
          currentInputValue: current,
        });
      }
    }
    this.props.onShowSizeChange(current, size);
  };

  handleChange = (p) => {
    let page = p;
    if (this.isValid(page)) {
      if (page > this.calculatePage()) {
        page = this.calculatePage();
      }

      if (!('current' in this.props)) {
        this.setState({
          current: page,
          currentInputValue: page,
        });
      }

      const pageSize = this.state.pageSize;
      this.props.onChange(page, pageSize);

      return page;
    }

    return this.state.current;
  };

  first = () => {
    if (this.hasPrev()) {
      this.handleChange(1);
    }
  };

  last = () => {
    if (this.hasNext()) {
      this.handleChange(this.calculatePage());
    }
  };

  prev = () => {
    if (this.hasPrev()) {
      this.handleChange(this.state.current - 1);
    }
  };

  next = () => {
    if (this.hasNext()) {
      this.handleChange(this.state.current + 1);
    }
  };

  getJumpPrevPage() {
    return Math.max(1, this.state.current - (this.props.showLessItems ? 3 : 5));
  }

  getJumpNextPage() {
    return Math.min(this.calculatePage(), this.state.current + (this.props.showLessItems ? 3 : 5));
  }

  jumpPrev = () => {
    this.handleChange(this.getJumpPrevPage());
  };

  jumpNext = () => {
    this.handleChange(this.getJumpNextPage());
  };

  hasPrev = () => {
    return this.state.current > 1;
  };

  hasNext = () => {
    return this.state.current < this.calculatePage();
  };

  runIfEnter = (event, callback, ...restParams) => {
    if (event.key === 'Enter' || event.charCode === 13) {
      callback(...restParams);
    }
  };

  runIfEnterFirst = e => {
    this.runIfEnter(e, this.first);
  };

  runIfEnterLast = e => {
    this.runIfEnter(e, this.last);
  };

  runIfEnterPrev = e => {
    this.runIfEnter(e, this.prev);
  };

  runIfEnterNext = e => {
    this.runIfEnter(e, this.next);
  };

  runIfEnterJumpPrev = e => {
    this.runIfEnter(e, this.jumpPrev);
  };

  runIfEnterJumpNext = e => {
    this.runIfEnter(e, this.jumpNext);
  };

  handleGoTO = e => {
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      this.handleChange(this.state.currentInputValue);
    }
  };

  render() {
    // When hideOnSinglePage is true and there is only 1 page, hide the pager
    if (this.props.hideOnSinglePage === true && this.props.total <= this.state.pageSize) {
      return null;
    }

    const props = this.props;
    const locale = props.locale;

    const prefixCls = props.prefixCls;
    const allPages = this.calculatePage();
    const pagerList = [];
    let jumpPrev = null;
    let jumpNext = null;
    let firstPager = null;
    let lastPager = null;
    let gotoButton = null;

    const goButton = (props.showQuickJumper && props.showQuickJumper.goButton);
    const pageBufferSize = props.showLessItems ? 1 : 2;
    const { current, pageSize } = this.state;

    const prevPage = current - 1 > 0 ? current - 1 : 0;
    const nextPage = current + 1 < allPages ? current + 1 : allPages;

    const dataOrAriaAttributeProps = Object.keys(props).reduce((prev, key) => {
      if ((key.substr(0, 5) === 'data-' || key.substr(0, 5) === 'aria-' || key === 'role')) {
        prev[key] = props[key];
      }
      return prev;
    }, {});

    if (props.simple) {
      if (goButton) {
        if (typeof goButton === 'boolean') {
          gotoButton = (
            <button
              type="button"
              onClick={this.handleGoTO}
              onKeyUp={this.handleGoTO}
            >
              {locale.jump_to_confirm}
            </button>
          );
        } else {
          gotoButton = (
            <span
              onClick={this.handleGoTO}
              onKeyUp={this.handleGoTO}
            >{goButton}</span>
          );
        }
        gotoButton = (
          <li
            title={props.showTitle ? `${locale.jump_to}${this.state.current}/${allPages}` : null}
            className={`${prefixCls}-simple-pager`}
          >
            {gotoButton}
          </li>
        );
      }

      return (
        <ul
          className={`${prefixCls} ${prefixCls}-simple ${props.className}`}
          style={props.style}
          ref={this.savePaginationNode}
          {...dataOrAriaAttributeProps}
        >
          <li
            title={props.showTitle ? locale.prev_page : null}
            onClick={this.prev}
            tabIndex={this.hasPrev() ? 0 : null}
            onKeyPress={this.runIfEnterPrev}
            className={`${this.hasPrev() ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
            aria-disabled={!this.hasPrev()}
          >
            {props.itemRender(prevPage, 'prev', <a className={`${prefixCls}-item-link`} />, !this.hasPrev(), 'small')}
          </li>
          <li
            title={props.showTitle ? `${this.state.current}/${allPages}` : null}
            className={`${prefixCls}-simple-pager`}
          >
            <input
              type="text"
              value={this.state.currentInputValue}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
              onChange={this.handleKeyUp}
              size="3"
            />
            <span className={`${prefixCls}-slash`}>／</span>
            {allPages}
          </li>
          <li
            title={props.showTitle ? locale.next_page : null}
            onClick={this.next}
            tabIndex={this.hasPrev() ? 0 : null}
            onKeyPress={this.runIfEnterNext}
            className={`${this.hasNext() ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
            aria-disabled={!this.hasNext()}
          >
            {props.itemRender(nextPage, 'next', <a className={`${prefixCls}-item-link`} />, !this.hasNext(), 'small')}
          </li>
          {gotoButton}
        </ul>
      );
    }

    if (allPages <= 5 + pageBufferSize * 2) {
      for (let i = 1; i <= allPages; i++) {
        const active = this.state.current === i;
        pagerList.push(
          <Pager
            size={props.size}
            locale={locale}
            rootPrefixCls={prefixCls}
            onClick={this.handleChange}
            onKeyPress={this.runIfEnter}
            key={i}
            page={i}
            active={active}
            showTitle={props.showTitle}
            itemRender={props.itemRender}
          />,
        );
      }
    } else {
      const prevItemTitle = props.showLessItems ? locale.prev_3 : locale.prev_5;
      const nextItemTitle = props.showLessItems ? locale.next_3 : locale.next_5;
      if (props.showPrevNextJumpers) {
        const { renderJumper = () => '•••' } = props;
        jumpPrev = (
          <li
            title={props.showTitle ? prevItemTitle : null}
            key="prev"
            onClick={this.jumpPrev}
            tabIndex="0"
            onKeyPress={this.runIfEnterJumpPrev}
            className={`${prefixCls}-jump-prev`}
          >
            {props.itemRender(
              this.getJumpPrevPage(), 'jump-prev', <a className={`${prefixCls}-item-link`}>{renderJumper()}</a>, props.size,
            )}
          </li>
        );
        jumpNext = (
          <li
            title={props.showTitle ? nextItemTitle : null}
            key="next"
            tabIndex="0"
            onClick={this.jumpNext}
            onKeyPress={this.runIfEnterJumpNext}
            className={`${prefixCls}-jump-next`}
          >
            {props.itemRender(
              this.getJumpNextPage(), 'jump-next', <a className={`${prefixCls}-item-link`}>{renderJumper()}</a>, props.size,
            )}
          </li>
        );
      }
      lastPager = (
        <Pager
          size={props.size}
          locale={props.locale}
          last
          rootPrefixCls={prefixCls}
          onClick={this.handleChange}
          onKeyPress={this.runIfEnter}
          key={allPages}
          page={allPages}
          active={false}
          showTitle={props.showTitle}
          itemRender={props.itemRender}
        />
      );
      firstPager = (
        <Pager
          size={props.size}
          locale={props.locale}
          rootPrefixCls={prefixCls}
          onClick={this.handleChange}
          onKeyPress={this.runIfEnter}
          key={1}
          page={1}
          active={false}
          showTitle={props.showTitle}
          itemRender={props.itemRender}
        />
      );

      let left = Math.max(1, current - pageBufferSize);
      let right = Math.min(current + pageBufferSize, allPages);

      if (current - 1 <= pageBufferSize) {
        right = 1 + pageBufferSize * 2;
      }

      if (allPages - current <= pageBufferSize) {
        left = allPages - pageBufferSize * 2;
      }

      for (let i = left; i <= right; i++) {
        const active = current === i;
        pagerList.push(
          <Pager
            size={props.size}
            locale={props.locale}
            rootPrefixCls={prefixCls}
            onClick={this.handleChange}
            onKeyPress={this.runIfEnter}
            key={i}
            page={i}
            active={active}
            showTitle={props.showTitle}
            itemRender={props.itemRender}
          />,
        );
      }

      if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
        pagerList[0] = cloneElement(pagerList[0], {
          className: `${prefixCls}-item-after-jump-prev`,
        });
        pagerList.unshift(jumpPrev);
      }
      if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
        pagerList[pagerList.length - 1] = cloneElement(pagerList[pagerList.length - 1], {
          className: `${prefixCls}-item-before-jump-next`,
        });
        pagerList.push(jumpNext);
      }

      if (left !== 1) {
        pagerList.unshift(firstPager);
      }
      if (right !== allPages) {
        pagerList.push(lastPager);
      }
    }

    let totalText = null;

    if (props.showTotal) {
      totalText = (
        <li className={`${prefixCls}-total-text`}>
          {props.showTotal(
            props.total,
            [
              (current - 1) * pageSize + 1,
              current * pageSize > props.total ? props.total : current * pageSize,
            ],
          )}
        </li>
      );
    }
    if (props.tiny) {
      const fistDisabled = !this.hasPrev();
      const lastDisabled = !this.hasNext();
      firstPager = (
        <li
          title={props.showTitle ? locale.first_page : null}
          onClick={this.first}
          tabIndex={fistDisabled ? null : 0}
          onKeyPress={this.runIfEnterFirst}
          className={`${!fistDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-first`}
          aria-disabled={fistDisabled}
        >
          {props.itemRender(1, 'first', <a className={`${prefixCls}-item-link`} />, fistDisabled, props.size)}
        </li>
      );
      lastPager = (
        <li
          title={props.showTitle ? locale.last_page : null}
          onClick={this.last}
          tabIndex={lastDisabled ? null : 0}
          onKeyPress={this.runIfEnterLast}
          className={`${!lastDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-last`}
          aria-disabled={lastDisabled}
        >
          {props.itemRender(allPages, 'last', <a className={`${prefixCls}-item-link`} />, lastDisabled, props.size)}
        </li>
      );
    }
    const prevDisabled = !this.hasPrev();
    const nextDisabled = !this.hasNext();
    const sizeChanger = (
      <Options
        locale={props.locale}
        rootPrefixCls={prefixCls}
        selectComponentClass={props.selectComponentClass}
        selectProps={props.selectProps}
        changeSize={this.props.showSizeChanger ? this.changePageSize : null}
        current={this.state.current}
        pageSize={this.state.pageSize}
        pageSizeOptions={this.props.pageSizeOptions}
        quickGo={this.props.showQuickJumper ? this.handleChange : null}
        goButton={goButton}
        buildOptionText={props.sizeChangerOptionText}
        changeSizeLabel={this.props.showSizeChangerLabel}
      />
    );
    const classString = classNames(prefixCls, props.className, {
      [`${prefixCls}-tiny`]: props.tiny,
    });
    return (
      <ul
        className={classString}
        style={props.style}
        unselectable="unselectable"
        ref={this.savePaginationNode}
        {...dataOrAriaAttributeProps}
      >
        {props.tiny && sizeChanger}
        {totalText}
        {props.tiny && firstPager}
        <li
          title={props.showTitle ? locale.prev_page : null}
          onClick={this.prev}
          tabIndex={prevDisabled ? null : 0}
          onKeyPress={this.runIfEnterPrev}
          className={`${!prevDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
          aria-disabled={prevDisabled}
        >
          {props.itemRender(prevPage, 'prev', <a className={`${prefixCls}-item-link`} />, prevDisabled, props.size)}
        </li>
        {!props.tiny && pagerList}
        <li
          title={props.showTitle ? locale.next_page : null}
          onClick={this.next}
          tabIndex={nextDisabled ? null : 0}
          onKeyPress={this.runIfEnterNext}
          className={`${!nextDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
          aria-disabled={nextDisabled}
        >
          {props.itemRender(nextPage, 'next', <a className={`${prefixCls}-item-link`} />, nextDisabled, props.size)}
        </li>
        {props.tiny ? lastPager : sizeChanger}
      </ul>
    );
  }
}
