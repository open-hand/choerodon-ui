import React, { MouseEventHandler, PureComponent } from 'react';
import Tooltip from '../tooltip';
import { Item } from '../rc-components/menu';
import MenuContext, { MenuContextValue } from './MenuContext';

class MenuItem extends PureComponent<any, any> {
  static get contextType(): typeof MenuContext {
    return MenuContext;
  }

  static isMenuItem = 1;

  context: MenuContextValue;

  private menuItem: any;

  onKeyDown: MouseEventHandler<HTMLElement> = e => {
    this.menuItem.onKeyDown(e);
  };

  saveMenuItem = (menuItem: any) => {
    this.menuItem = menuItem;
  };

  render() {
    const { inlineCollapsed } = this.context;
    const props = this.props;
    const item = <Item {...props} ref={this.saveMenuItem} />;
    if (inlineCollapsed && props.level === 1) {
      return (
        <Tooltip
          prefixCls={props.tooltipPrefixCls}
          title={props.children}
          placement="right"
          overlayClassName={`${props.rootPrefixCls}-inline-collapsed-tooltip`}
        >
          {item}
        </Tooltip>
      );
    }
    return item;
  }
}

export default MenuItem;
