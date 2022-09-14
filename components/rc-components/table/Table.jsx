import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import shallowequal from 'shallowequal';
import merge from 'lodash/merge';
import { create, Provider } from 'mini-store';
import classes from 'component-classes';
import warning from '../../_util/warning';
import addEventListener from '../../_util/addEventListener';
import ColumnManager from './ColumnManager';
import HeadTable from './HeadTable';
import BodyTable from './BodyTable';
import FootTable from './FootTable';
import ExpandableTable from './ExpandableTable';
import { TableContextProvider } from './TableContext';
import ViewSection from './ViewSection';
import StickyShadow from './StickyShadow';
import isStickySupport from '../../_util/isStickySupport';

export default class Table extends Component {
  static defaultProps = {
    data: [],
    useFixedHeader: false,
    rowKey: 'key',
    rowClassName: () => '',
    onRow() {
    },
    onHeaderRow() {
    },
    prefixCls: 'rc-table',
    bodyStyle: {},
    style: {},
    showHeader: true,
    scroll: {},
    rowRef: () => null,
    emptyText: () => 'No Data',
  };

  constructor(props) {
    super(props);

    [
      'onRowClick',
      'onRowDoubleClick',
      'onRowContextMenu',
      'onRowMouseEnter',
      'onRowMouseLeave',
    ].forEach(name => {
      warning(
        props[name] === undefined,
        `${name} is deprecated, please use onRow instead.`,
      );
    });

    warning(
      props.getBodyWrapper === undefined,
      'getBodyWrapper is deprecated, please use custom components instead.',
    );

    this.columnManager = new ColumnManager(props.columns, props.children);

    this.store = create({
      currentHoverKey: null,
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsFootRowsHeight: [],
      fixedColumnsBodyRowsHeight: {},
    });

    this.setScrollPosition('left');

    this.debouncedWindowResize = debounce(this.handleWindowResize, 150);
  }

  state = {};

  getContextValue() {
    return {
      props: this.props,
      columnManager: this.columnManager,
      saveRef: this.saveRef,
      components: merge({
        table: 'table',
        header: {
          wrapper: 'thead',
          row: 'tr',
          cell: 'th',
        },
        body: {
          wrapper: 'tbody',
          row: 'tr',
          cell: 'td',
        },
        footer: {
          wrapper: 'tfoot',
          row: 'tr',
          cell: 'td',
        },
      }, this.props.components),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.columns && nextProps.columns !== prevState.columns) {
      return {
        columns: nextProps.columns,
        children: null,
      };
    } else if (nextProps.children !== prevState.children) {
      return {
        columns: null,
        children: nextProps.children,
      };
    }
    return null;
  }

  componentDidMount() {
    if (this.columnManager.isAnyColumnsFixed()) {
      this.handleWindowResize();
      this.resizeEvent = addEventListener(
        window, 'resize', this.debouncedWindowResize,
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (this.columnManager.isAnyColumnsFixed()) {
      this.handleWindowResize();
      if (!this.resizeEvent) {
        this.resizeEvent = addEventListener(
          window, 'resize', this.debouncedWindowResize,
        );
      }
    }
    // when table changes to empty, reset scrollLeft
    if (prevProps.data.length > 0 && this.props.data.length === 0 && this.hasScrollX()) {
      this.resetScrollX();
    }
  }

  componentWillUnmount() {
    if (this.resizeEvent) {
      this.resizeEvent.remove();
    }
    if (this.debouncedWindowResize) {
      this.debouncedWindowResize.cancel();
    }
  }

  getRowKey = (record, index) => {
    const rowKey = this.props.rowKey;
    const key = (typeof rowKey === 'function') ? rowKey(record, index) : record[rowKey];
    warning(
      key !== undefined,
      'Each record in table should have a unique `key` prop,' +
      'or set `rowKey` to an unique primary key.',
    );
    return key === undefined ? index : key;
  };

  setScrollPosition(position) {
    this.scrollPosition = position;
    if (this.tableNode) {
      const { prefixCls } = this.props;
      if (position === 'both') {
        classes(this.tableNode)
          .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          .add(`${prefixCls}-scroll-position-left`)
          .add(`${prefixCls}-scroll-position-right`);
      } else {
        classes(this.tableNode)
          .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          .add(`${prefixCls}-scroll-position-${position}`);
      }
    }
  }

  setScrollPositionClassName() {
    const node = this.bodyTable;
    const scrollToLeft = node.scrollLeft === 0;
    const scrollToRight = node.scrollLeft + 1 >=
      node.children[0].getBoundingClientRect().width -
      node.getBoundingClientRect().width;
    if (scrollToLeft && scrollToRight) {
      this.setScrollPosition('both');
    } else if (scrollToLeft) {
      this.setScrollPosition('left');
    } else if (scrollToRight) {
      this.setScrollPosition('right');
    } else if (this.scrollPosition !== 'middle') {
      this.setScrollPosition('middle');
    }
  }

  handleWindowResize = () => {
    this.syncFixedTableRowHeight();
    this.setScrollPositionClassName();
  };

  syncFixedTableRowHeight = () => {
    const tableRect = this.tableNode.getBoundingClientRect();
    // If tableNode's height less than 0, suppose it is hidden and don't recalculate rowHeight.
    if (tableRect.height !== undefined && tableRect.height <= 0) {
      return;
    }
    const { prefixCls } = this.props;
    const headRows = this.headTable ? this.headTable.querySelectorAll('thead') : this.bodyTable.querySelectorAll('thead');
    const footRows = this.footTable ? this.footTable.querySelectorAll('tfoot') : this.bodyTable.querySelectorAll('tfoot');
    const bodyRows = this.bodyTable.querySelectorAll(`.${prefixCls}-row`) || [];
    const fixedColumnsHeadRowsHeight = [].map.call(
      headRows, row => row.getBoundingClientRect().height || 'auto',
    );
    const fixedColumnsFootRowsHeight = [].map.call(
      footRows, row => row.getBoundingClientRect().height || 'auto',
    );
    const state = this.store.getState();
    const fixedColumnsBodyRowsHeight = [].reduce.call(
      bodyRows,
      (acc, row) => {
        const rowKey = row.getAttribute('data-row-key');
        const height =
          row.getBoundingClientRect().height || state.fixedColumnsBodyRowsHeight[rowKey] || 'auto';
        acc[rowKey] = height;
        return acc;
      },
      {},
    );
    if (shallowequal(state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) &&
      shallowequal(state.fixedColumnsFootRowsHeight, fixedColumnsFootRowsHeight) &&
      shallowequal(state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)) {
      return;
    }

    this.store.setState({
      fixedColumnsHeadRowsHeight,
      fixedColumnsFootRowsHeight,
      fixedColumnsBodyRowsHeight,
    });
  };

  resetScrollX() {
    if (this.headTable) {
      this.headTable.scrollLeft = 0;
    }
    if (this.bodyTable) {
      this.bodyTable.scrollLeft = 0;
    }
    if (this.footTable) {
      this.footTable.scrollLeft = 0;
    }
  }

  hasScrollX() {
    const { scroll = {} } = this.props;
    return 'x' in scroll;
  }

  handleBodyScrollLeft = (e) => {
    if (e.currentTarget !== e.target) {
      return;
    }
    const target = e.target;
    const { scroll = {} } = this.props;
    const { headTable, bodyTable, footTable } = this;
    if (target.scrollLeft !== this.lastScrollLeft && scroll.x) {
      if (target === bodyTable) {
        if (headTable) headTable.scrollLeft = target.scrollLeft;
        if (footTable) footTable.scrollLeft = target.scrollLeft;
      } else if (target === headTable) {
        if (bodyTable) bodyTable.scrollLeft = target.scrollLeft;
        if (footTable) footTable.scrollLeft = target.scrollLeft;
      } else if (target === footTable) {
        if (bodyTable) bodyTable.scrollLeft = target.scrollLeft;
        if (headTable) headTable.scrollLeft = target.scrollLeft;
      }
      this.setScrollPositionClassName();
    }
    // Remember last scrollLeft for scroll direction detecting.
    this.lastScrollLeft = target.scrollLeft;
  };

  handleBodyScrollTop = (e) => {
    const target = e.target;
    if (e.currentTarget !== target) {
      return;
    }
    const { scroll = {} } = this.props;
    const { headTable, bodyTable, fixedColumnsBodyLeft, fixedColumnsBodyRight } = this;
    if (target.scrollTop !== this.lastScrollTop && scroll.y && target !== headTable) {
      const scrollTop = target.scrollTop;
      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
    }
    // Remember last scrollTop for scroll direction detecting.
    this.lastScrollTop = target.scrollTop;
  };

  handleBodyScroll = (e) => {
    this.handleBodyScrollLeft(e);
    this.handleBodyScrollTop(e);
  };

  handleWheel = event => {
    const { scroll = {} } = this.props;
    if (window.navigator.userAgent.match(/Trident\/7\./) && scroll.y) {
      event.preventDefault();
      const wd = event.deltaY;
      const target = event.target;
      const { bodyTable, fixedColumnsBodyLeft, fixedColumnsBodyRight } = this;
      let scrollTop = 0;

      if (this.lastScrollTop) {
        scrollTop = this.lastScrollTop + wd;
      } else {
        scrollTop = wd;
      }

      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
    }
  };

  saveRef = (name) => (node) => {
    this[name] = node;
  };

  handleInViewChange = (inView) => {
    if (inView) {
      this.syncFixedTableRowHeight();
    }
  };

  renderMainTable() {
    const { scroll, prefixCls } = this.props;
    const isAnyColumnsFixed = this.columnManager.isAnyColumnsFixed();
    const scrollable = isAnyColumnsFixed || scroll.x || scroll.y;

    const table = [
      this.renderTable({
        columns: this.columnManager.groupedColumns(),
        isAnyColumnsFixed,
      }),
      this.renderEmptyText(),
      this.renderFooter(),
    ];

    return scrollable ? (
      <div className={`${prefixCls}-scroll`}>{table}</div>
    ) : table;
  }

  renderLeftFixedTable() {
    const { prefixCls, scroll } = this.props;
    const columns = this.columnManager.leftColumns();
    return (
      <StickyShadow prefixCls={prefixCls} position="left" columns={columns} scroll={scroll}>
        {this.renderTable({
          columns,
          fixed: 'left',
        })}
      </StickyShadow>
    );
  }

  renderRightFixedTable() {
    const { prefixCls } = this.props;
    const columns = this.columnManager.rightColumns();
    return (
      <StickyShadow prefixCls={prefixCls} position="right" columns={columns} scroll={scroll}>
        {this.renderTable({
          columns,
          fixed: 'right',
        })}
      </StickyShadow>
    );
  }

  renderTable(options) {
    const { columns, fixed, isAnyColumnsFixed } = options;
    const { prefixCls, scroll = {}, resizable } = this.props;
    const tableClassName = (scroll.x || fixed) ? `${prefixCls}-fixed` : '';

    const headTable = (
      <HeadTable
        key="head"
        columns={columns}
        fixed={fixed}
        tableClassName={tableClassName}
        handleBodyScrollLeft={this.handleBodyScrollLeft}
        expander={this.expander}
      />
    );

    const bodyTable = (
      <BodyTable
        key="body"
        columns={columns}
        fixed={fixed}
        resizable={resizable}
        tableClassName={tableClassName}
        getRowKey={this.getRowKey}
        handleWheel={this.handleWheel}
        handleBodyScroll={this.handleBodyScroll}
        expander={this.expander}
        isAnyColumnsFixed={isAnyColumnsFixed}
      />
    );

    const footTable = (
      <FootTable
        key="foot"
        columns={columns}
        fixed={fixed}
        tableClassName={tableClassName}
        handleBodyScrollLeft={this.handleBodyScrollLeft}
        expander={this.expander}
      />
    );

    return [headTable, bodyTable, footTable];
  }

  renderTitle() {
    const { title, prefixCls } = this.props;
    return title ? (
      <div className={`${prefixCls}-title`} key="title">
        {title(this.props.data)}
      </div>
    ) : null;
  }

  renderFooter() {
    const { footer, prefixCls } = this.props;
    return footer ? (
      <div className={`${prefixCls}-footer`} key="footer">
        {footer(this.props.data)}
      </div>
    ) : null;
  }

  renderEmptyText() {
    const { emptyText, prefixCls, data } = this.props;
    if (data.length) {
      return null;
    }
    const emptyClassName = `${prefixCls}-placeholder`;
    return (
      <div className={emptyClassName} key="emptyText">
        {(typeof emptyText === 'function') ? emptyText() : emptyText}
      </div>
    );
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;

    if (this.state.columns) {
      this.columnManager.reset(props.columns);
    } else if (this.state.children) {
      this.columnManager.reset(null, props.children);
    }

    let className = props.prefixCls;
    if (props.className) {
      className += ` ${props.className}`;
    }
    if (props.useFixedHeader || (props.scroll && props.scroll.y)) {
      className += ` ${prefixCls}-fixed-header`;
    }
    if (this.scrollPosition === 'both') {
      className += ` ${prefixCls}-scroll-position-left ${prefixCls}-scroll-position-right`;
    } else {
      className += ` ${prefixCls}-scroll-position-${this.scrollPosition}`;
    }
    const hasLeftFixed = this.columnManager.isAnyColumnsLeftFixed();
    const hasRightFixed = this.columnManager.isAnyColumnsRightFixed();

    return (
      <TableContextProvider {...this.getContextValue()}>
        <Provider store={this.store}>
          <ExpandableTable
            {...props}
            columnManager={this.columnManager}
            getRowKey={this.getRowKey}
          >
            {(expander) => {
              this.expander = expander;
              return (
                <ViewSection
                  onInViewChange={this.handleInViewChange}
                  ref={this.saveRef('tableNode')}
                  className={className}
                  style={props.style}
                  id={props.id}
                >
                  {this.renderTitle()}
                  <div ref={this.saveRef('tableContent')} className={`${prefixCls}-content`}>
                    {this.renderMainTable()}
                    {!isStickySupport() && hasLeftFixed && this.renderLeftFixedTable()}
                    {!isStickySupport() && hasRightFixed && this.renderRightFixedTable()}
                  </div>
                  {
                    isStickySupport() && hasLeftFixed && (
                      <StickyShadow
                        prefixCls={prefixCls}
                        position="left"
                        columns={this.columnManager.leftColumns()}
                        scroll={props.scroll}
                      />
                    )
                  }
                  {
                    isStickySupport() && hasRightFixed && (
                      <StickyShadow
                        prefixCls={prefixCls}
                        position="right"
                        columns={this.columnManager.rightColumns()}
                        scroll={props.scroll}
                      />
                    )
                  }
                </ViewSection>
              );
            }}
          </ExpandableTable>
        </Provider>
      </TableContextProvider>
    );
  }
}
