import React, { Children } from 'react';

export function getKeyFromChildrenIndex(child, menuEventKey, index) {
  const prefix = menuEventKey || '';
  return child.key || `${prefix}item_${index}`;
}

export function getMenuIdFromSubMenuEventKey(eventKey) {
  return `${eventKey}-menu-`;
}

export function loopMenuItem(children, cb) {
  let index = -1;
  Children.forEach(children, c => {
    index++;
    if (c && c.type && c.type.isMenuItemGroup) {
      Children.forEach(c.props.children, c2 => {
        index++;
        cb(c2, index);
      });
    } else {
      cb(c, index);
    }
  });
}

export function loopMenuItemRecursively(children, keys, ret) {
  if (!children || ret.find) {
    return;
  }
  Children.forEach(children, c => {
    if (c) {
      const construct = c.type;
      if (
        !construct ||
        !(construct.isSubMenu || construct.isMenuItem || construct.isMenuItemGroup)
      ) {
        return;
      }
      if (keys.indexOf(c.key) !== -1) {
        ret.find = true;
      } else if (c.props.children) {
        loopMenuItemRecursively(c.props.children, keys, ret);
      }
    }
  });
}

export const menuAllProps = [
  'defaultSelectedKeys',
  'selectedKeys',
  'defaultOpenKeys',
  'openKeys',
  'mode',
  'getPopupContainer',
  'onSelect',
  'onDeselect',
  'onDestroy',
  'openTransitionName',
  'openAnimation',
  'subMenuOpenDelay',
  'subMenuCloseDelay',
  'forceSubMenuRender',
  'triggerSubMenuAction',
  'level',
  'selectable',
  'multiple',
  'onOpenChange',
  'visible',
  'focusable',
  'defaultActiveFirst',
  'prefixCls',
  'inlineIndent',
  'parentMenu',
  'title',
  'rootPrefixCls',
  'eventKey',
  'active',
  'onItemHover',
  'onTitleMouseEnter',
  'onTitleMouseLeave',
  'onTitleClick',
  'popupAlign',
  'popupOffset',
  'isOpen',
  'renderMenuItem',
  'manualRef',
  'subMenuKey',
  'disabled',
  'index',
  'isSelected',
  'store',
  'activeKey',
  'builtinPlacements',
  'overflowedIndicator',

  // the following keys found need to be removed from test regression
  'attribute',
  'value',
  'popupClassName',
  'inlineCollapsed',
  'menu',
  'theme',
  'itemIcon',
  'expandIcon',
  'checkable',
  'rippleDisabled',
];

export const getWidth = elem => {
  let width =
    elem &&
    typeof elem.getBoundingClientRect === 'function' &&
    elem.getBoundingClientRect().width;
  if (width) {
    width = +width.toFixed(6);
  }
  return width || 0;
};

export const setStyle = (elem, styleProperty, value) => {
  if (elem && typeof elem.style === 'object') {
    elem.style[styleProperty] = value;
  }
};
