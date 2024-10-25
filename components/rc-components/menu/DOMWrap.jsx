import React, { cloneElement, Component } from 'react';
import ReactDOM from 'react-dom';
import ResizeObserver from 'resize-observer-polyfill';
import List from 'rc-virtual-list';
import SubMenu from './SubMenu';
import { getWidth, menuAllProps, setStyle } from './util';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const MENUITEM_OVERFLOWED_CLASSNAME = 'menuitem-overflowed';

// Fix ssr
if (canUseDOM) {
  require('mutationobserver-shim');
}

export default class DOMWrap extends Component {
  static defaultProps = {
    tag: 'div',
    className: '',
  };

  state = {
    lastVisibleIndex: undefined,
  };

  componentDidMount() {
    this.setChildrenWidthAndResize();
    if (this.props.level === 1 && this.props.mode === 'horizontal') {
      const menuUl = ReactDOM.findDOMNode(this);
      if (!menuUl) {
        return;
      }
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(this.setChildrenWidthAndResize);
      });

      [].slice
        .call(menuUl.children)
        .concat(menuUl)
        .forEach(el => {
          this.resizeObserver.observe(el);
        });

      if (typeof MutationObserver !== 'undefined') {
        this.mutationObserver = new MutationObserver(() => {
          this.resizeObserver.disconnect();
          [].slice
            .call(menuUl.children)
            .concat(menuUl)
            .forEach(el => {
              this.resizeObserver.observe(el);
            });
          this.setChildrenWidthAndResize();
        });
        this.mutationObserver.observe(menuUl, {
          attributes: false,
          childList: true,
          subTree: false,
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // get all valid menuItem nodes
  getMenuItemNodes = () => {
    const { prefixCls } = this.props;
    const ul = ReactDOM.findDOMNode(this);
    if (!ul) {
      return [];
    }

    // filter out all overflowed indicator placeholder
    return [].slice.call(ul.children).filter(node => {
      return node.className.split(' ').indexOf(`${prefixCls}-overflowed-submenu`) < 0;
    });
  };

  getOverflowedSubMenuItem = (keyPrefix, overflowedItems, renderPlaceholder) => {
    const { overflowedIndicator, level, mode, prefixCls, theme, style: propStyle } = this.props;
    if (level !== 1 || mode !== 'horizontal') {
      return null;
    }
    // put all the overflowed item inside a submenu
    // with a title of overflow indicator ('...')
    const copy = this.props.children[0];
    const { children: throwAway, title, eventKey, ...rest } = copy.props;

    let style = { ...propStyle };
    let key = `${keyPrefix}-overflowed-indicator`;

    if (overflowedItems.length === 0 && renderPlaceholder !== true) {
      style = {
        ...style,
        display: 'none',
      };
    } else if (renderPlaceholder) {
      style = {
        ...style,
        visibility: 'hidden',
        // prevent from taking normal dom space
        position: 'absolute',
      };
      key = `${key}-placeholder`;
    }

    const popupClassName = theme ? `${prefixCls}-${theme}` : '';
    const props = {};
    menuAllProps.forEach(k => {
      if (rest[k] !== undefined) {
        props[k] = rest[k];
      }
    });

    return (
      <SubMenu
        title={overflowedIndicator}
        className={`${prefixCls}-overflowed-submenu`}
        popupClassName={popupClassName}
        {...props}
        key={key}
        eventKey={`${keyPrefix}-overflowed-indicator`}
        disabled={false}
        style={style}
      >
        {overflowedItems}
      </SubMenu>
    );
  };

  // memorize rendered menuSize
  setChildrenWidthAndResize = () => {
    if (this.props.mode !== 'horizontal') {
      return;
    }
    const ul = ReactDOM.findDOMNode(this);

    if (!ul) {
      return;
    }

    const ulChildrenNodes = ul.children;

    if (!ulChildrenNodes || ulChildrenNodes.length === 0) {
      return;
    }

    const lastOverflowedIndicatorPlaceholder = ul.children[ulChildrenNodes.length - 1];

    // need last overflowed indicator for calculating length;
    setStyle(lastOverflowedIndicatorPlaceholder, 'display', 'inline-block');

    const menuItemNodes = this.getMenuItemNodes();

    // reset display attribute for all hidden elements caused by overflow to calculate updated width
    // and then reset to original state after width calculation

    const overflowedItems = menuItemNodes.filter(
      c => c.className.split(' ').indexOf(MENUITEM_OVERFLOWED_CLASSNAME) >= 0,
    );

    overflowedItems.forEach(c => {
      setStyle(c, 'display', 'inline-block');
    });

    this.menuItemSizes = menuItemNodes.map(c => getWidth(c));

    overflowedItems.forEach(c => {
      setStyle(c, 'display', 'none');
    });
    this.overflowedIndicatorWidth = getWidth(ul.children[ul.children.length - 1]);
    this.originalTotalWidth = this.menuItemSizes.reduce((acc, cur) => acc + cur, 0);
    this.handleResize();
    // prevent the overflowed indicator from taking space;
    setStyle(lastOverflowedIndicatorPlaceholder, 'display', 'none');
  };

  resizeObserver = null;
  mutationObserver = null;

  // original scroll size of the list
  originalTotalWidth = 0;

  // copy of overflowed items
  overflowedItems = [];

  // cache item of the original items (so we can track the size and order)
  menuItemSizes = [];

  handleResize = () => {
    if (this.props.mode !== 'horizontal') {
      return;
    }

    const ul = ReactDOM.findDOMNode(this);
    if (!ul) {
      return;
    }
    const width = getWidth(ul);

    this.overflowedItems = [];
    let currentSumWidth = 0;

    // index for last visible child in horizontal mode
    let lastVisibleIndex = undefined;

    if (this.originalTotalWidth > width) {
      lastVisibleIndex = -1;

      this.menuItemSizes.forEach(liWidth => {
        currentSumWidth += liWidth;
        if (currentSumWidth + this.overflowedIndicatorWidth <= width) {
          lastVisibleIndex++;
        }
      });
    }

    this.setState({ lastVisibleIndex });
  };

  renderChildren(children) {
    // need to take care of overflowed items in horizontal mode
    const { lastVisibleIndex } = this.state;
    return (children || []).reduce((acc, childNode, index) => {
      let item = childNode;
      if (this.props.mode === 'horizontal') {
        let overflowed = this.getOverflowedSubMenuItem(childNode.props.eventKey, []);
        if (
          lastVisibleIndex !== undefined &&
          this.props.className.indexOf(`${this.props.prefixCls}-root`) !== -1
        ) {
          if (index > lastVisibleIndex) {
            item = cloneElement(
              childNode,
              // 这里修改 eventKey 是为了防止隐藏状态下还会触发 openkeys 事件
              {
                style: { display: 'none' },
                eventKey: `${childNode.props.eventKey}-hidden`,
                className: `${childNode.className} ${MENUITEM_OVERFLOWED_CLASSNAME}`,
              },
            );
          }
          if (index === lastVisibleIndex + 1) {
            this.overflowedItems = children.slice(lastVisibleIndex + 1).map(c => {
              return cloneElement(
                c,
                // children[index].key will become '.$key' in clone by default,
                // we have to overwrite with the correct key explicitly
                { key: c.props.eventKey, mode: 'vertical-left' },
              );
            });

            overflowed = this.getOverflowedSubMenuItem(
              childNode.props.eventKey,
              this.overflowedItems,
            );
          }
        }

        const ret = [...acc, overflowed, item];

        if (index === children.length - 1) {
          // need a placeholder for calculating overflowed indicator width
          ret.push(this.getOverflowedSubMenuItem(childNode.props.eventKey, [], true));
        }
        return ret;
      }
      return [...acc, item];
    }, []);
  }

  render() {
    const {
      hiddenClassName,
      hidden,
      prefixCls,
      overflowedIndicator,
      mode,
      level,
      tag: Tag,
      children,
      theme,
      virtual,
      ...rest
    } = this.props;

    if (hidden) {
      rest.className += ` ${hiddenClassName}`;
    }

    // virtual height/itemHeight 暂用默认值
    if (virtual) {
      return (
        <List
          component={Tag}
          data={this.renderChildren(this.props.children)}
          height={234}
          itemHeight={28}
          fullHeight={false}
          virtual
          {...rest}
        >
          {(item) => item}
        </List>
      );
    }

    return <Tag {...rest}>{this.renderChildren(this.props.children)}</Tag>;
  }
}
