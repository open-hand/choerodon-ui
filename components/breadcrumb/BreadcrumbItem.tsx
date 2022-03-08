import React, { FunctionComponent, memo, MouseEventHandler, ReactNode, useCallback, useContext, useState } from 'react';
import classNames from 'classnames';
import DropDown, { DropDownProps } from '../dropdown';
import { Placements } from '../dropdown/enum';
import Icon from '../icon';
import List, { ListProps } from '../list';
import buildPlacements from './placements';
import ConfigContext from '../config-provider/ConfigContext';

export interface menuListItemProps {
  href?: string;
  listItemName?: string;
  listChildren?: ({ listItemName, href }: { listItemName: string; href: string }) => ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
}

export interface BreadcrumbItemProps {
  prefixCls?: string;
  separator?: ReactNode;
  href?: string;
  overlay?: DropDownProps['overlay'];
  dropdownProps?: Partial<DropDownProps>;
  listProps?: Partial<ListProps>;
  menuList?: menuListItemProps[];
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
  children?: ReactNode;
}

interface BreadcrumbItemInterface extends FunctionComponent<BreadcrumbItemProps> {
  __C7N_BREADCRUMB_ITEM?: boolean;
}

const BreadcrumbItem: BreadcrumbItemInterface = function BreadcrumbItem({
  prefixCls: customizePrefixCls,
  separator = '/',
  menuList = [],
  children,
  overlay,
  listProps,
  dropdownProps,
  ...restProps
}) {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
  const [active, setActive] = useState(false);
  const isMenuListOn = menuList ? menuList.length > 0 : false;
  const onVisibleChange = useCallback(async (visible: boolean) => {
    if (isMenuListOn) {
      setActive(visible);
    }
  }, [isMenuListOn]);
  /**
   * 渲染Link
   * @param childrenLink
   * @param restPropsLink
   */
  const renderLink = (childrenLink, restPropsLink, classNameLink, key): ReactNode => {
    if (key in restPropsLink) {
      return (
        <a className={`${prefixCls}-${classNameLink}`} {...restPropsLink}>
          {childrenLink}
        </a>
      );
    }
    return (
      <span className={`${prefixCls}-${classNameLink}`} {...restPropsLink}>
        {childrenLink}
      </span>
    );
  };

  /**
   * 渲染List列表
   */
  const renderList = (
    <List
      className={`${prefixCls}-overlay-menu-list`}
      grid={{ gutter: 0, column: 3 }}
      {...listProps}
      dataSource={menuList}
      renderItem={item => {
        const { href } = item;
        const { listChildren, listItemName, ...listRestProps } = item;
        let titleItem = listItemName || href;
        titleItem = listChildren ? listChildren({ href, listItemName }) : listItemName;
        return (
          <List.Item>
            {renderLink(titleItem, listRestProps, 'overlay-menu-list-item', 'href')}
          </List.Item>
        );
      }}
    />
  );

  const overlayMenu = overlay || (isMenuListOn && renderList);

  const onOverlayClick = useCallback(() => {
    setTimeout(() => {
      setActive(false);
    }, 300);
  }, []);

  if (children) {

    const renderBreadcrumbMenu = (linkItem: ReactNode) => {
      if (overlayMenu) {
        const buildASPlacements = buildPlacements;
        const dropDownProps = {
          overlayClassName: isMenuListOn ? `${prefixCls}-overlay-popup` : undefined,
          onOverlayClick,
          overlay: overlayMenu,
          placement: isMenuListOn ? Placements.bottomLeft : Placements.bottomCenter,
          onVisibleChange,
          overlayPlacements: buildASPlacements,
          ...dropdownProps,
        };
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
        );
      }
      return linkItem;
    };

    let link: ReactNode = renderLink(children, restProps, `link`, 'href');

    // wrap to dropDown
    link = renderBreadcrumbMenu(link);
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
};

BreadcrumbItem.displayName = 'BreadcrumbItem';

BreadcrumbItem.__C7N_BREADCRUMB_ITEM = true;

export default memo(BreadcrumbItem);
