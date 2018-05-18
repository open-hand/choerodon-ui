import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SubMenu as RcSubMenu } from '../rc-components/menu';

class SubMenu extends React.Component<any, any> {
  static contextTypes = {
    antdMenuTheme: PropTypes.string,
  };
  private subMenu: any;
  onKeyDown = (e: React.MouseEvent<HTMLElement>) => {
    this.subMenu.onKeyDown(e);
  };
  saveSubMenu = (subMenu: any) => {
    this.subMenu = subMenu;
  };

  render() {
    const { rootPrefixCls, className } = this.props;
    const theme = this.context.antdMenuTheme;
    return (
      <RcSubMenu
        {...this.props}
        ref={this.saveSubMenu}
        popupClassName={classNames(`${rootPrefixCls}-${theme}`, className)}
      />
    );
  }
}

export default SubMenu;
