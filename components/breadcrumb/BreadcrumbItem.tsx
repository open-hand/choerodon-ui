import React, { ReactNode, useState, useCallback } from 'react';
import classNames from 'classnames';
import DropDown, { DropDownProps } from 'choerodon-ui/pro/lib/dropdown/Dropdown';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum'
import { getPrefixCls } from '../configure';
import Icon from '../icon';
import List, { ListProps } from '../list';


export interface menuListItemProps {
  href?: string;
  listItemName?: string;
  listChildren?: ({ listItemName, href }: { listItemName: string, href: string }) => React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
}

export interface BreadcrumbItemProps {
  prefixCls?: string;
  separator?: ReactNode;
  href?: string;
  overlay?: DropDownProps['overlay'];
  dropdownProps?: DropDownProps;
  listProps?: ListProps;
  menuList?: menuListItemProps[];
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
}

interface BreadcrumbItemInterface extends React.FC<BreadcrumbItemProps> {
  __ANT_BREADCRUMB_ITEM: boolean;
}

const BreadcrumbItem: BreadcrumbItemInterface = ({
  prefixCls: customizePrefixCls,
  separator = '/',
  menuList = [],
  children,
  overlay,
  listProps,
  dropdownProps,
  ...restProps
}) => {
  const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
  const [active, setActive] = useState(false)
  const isMenuListOn = !!(menuList && menuList.length > 0);
  const onVisibleChange = async (visible: boolean) => {
    if (menuList.length > 0) {
      setActive(!visible)
    }
  }
  /**
   * 渲染Link
   * @param childrenLink
   * @param restPropsLink
   */
  const renderLink = (childrenLink, restPropsLink, classNameLink, key): React.ReactNode => {
    if (key in restPropsLink) {
      return (
        <a className={`${prefixCls}-${classNameLink}`} {...restPropsLink}>
          {childrenLink}
        </a>
      )
    }
    return (
      <span className={`${prefixCls}-${classNameLink}`} {...restPropsLink}>
        {childrenLink}
      </span>
    )
  }

  /**
   * 渲染List列表
   */
  const renderList = (
    <List
      className={`${prefixCls}-overlay-menu-list`}
      grid={{ gutter: 16, column: 4 }}
      {...listProps}
      dataSource={menuList}
      renderItem={item => {
        const { href } = item
        const { listChildren, listItemName, ...listRestProps } = item
        let titleItem = listItemName || href;
        titleItem = listChildren ? listChildren({ href, listItemName }) : listItemName;
        return (
          renderLink(titleItem, listRestProps, 'overlay-menu-list-item', 'href')
        )
      }}
    />
  );

  const overlayMenu = overlay || (isMenuListOn && renderList);

  const onOverlayClick = useCallback(() => {
    setTimeout(() => {
      setActive(false)
    }, 300)
  }, [])

  const renderBreadcrumbMenu = (linkItem: React.ReactNode) => {
    if (overlayMenu) {
      const dropDownProps = {
        popupClassName: isMenuListOn ? `${prefixCls}-overlay-popup` : undefined,
        onOverlayClick,
        overlay: overlayMenu,
        placement: isMenuListOn ? Placements.bottomLeft : Placements.bottomCenter,
        onHiddenChange: onVisibleChange,
        ...dropdownProps,
      }
      return (
        <DropDown {...dropDownProps}>
          <span className={classNames(`${prefixCls}-overlay-link`, {
            [`${prefixCls}-overlay-border`]: active,
            [`${prefixCls}-overlay-menu`]: isMenuListOn,
          })}>
            {linkItem}
            {isMenuListOn || <Icon type="arrow_drop_down" />}
            <i className={classNames(`${prefixCls}-overlay-cover`, {
              [`${prefixCls}-overlay-cover-active`]: active,
            })} />
          </span>
        </DropDown>
      )
    }
    return linkItem;
  }

  let link: string | React.ReactNode = renderLink(children, restProps, `link`, 'href');



  // wrap to dropDown
  link = renderBreadcrumbMenu(link);

  if (children) {
    return (
      <span>
        {link}
        {separator && separator !== '' && (
          <span className={`${prefixCls}-separator`}>{separator}</span>
        )}
      </span>
    );
  }
  return null;
}

BreadcrumbItem.__ANT_BREADCRUMB_ITEM = true;

export default BreadcrumbItem;
