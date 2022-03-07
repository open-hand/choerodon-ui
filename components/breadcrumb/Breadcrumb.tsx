import React, { Children, cloneElement, Component, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import warning from '../_util/warning';
import BreadcrumbItem, { BreadcrumbItemProps } from './BreadcrumbItem';
import { DropDownProps } from '../dropdown';
import { ListProps } from '../list';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface Route {
  path: string;
  breadcrumbName: string;
}

export interface BreadcrumbProps {
  prefixCls?: string;
  routes?: Route[];
  params?: any;
  separator?: ReactNode;
  itemRender?: (route: any, params: any, routes: Array<any>, paths: Array<string>) => ReactNode;
  style?: CSSProperties;
  className?: string;
  dropdownProps?: Partial<DropDownProps>;
  listProps?: Partial<ListProps>;
}

function getBreadcrumbName(route: Route, params: any) {
  if (!route.breadcrumbName) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  const name = route.breadcrumbName.replace(
    new RegExp(`:(${paramsKeys})`, 'g'),
    (replacement, key) => params[key] || replacement,
  );
  return name;
}

function defaultItemRender(route: Route, params: any, routes: Route[], paths: string[]) {
  const isLastItem = routes.indexOf(route) === routes.length - 1;
  const name = getBreadcrumbName(route, params);
  return isLastItem ? <span>{name}</span> : <a href={`#/${paths.join('/')}`}>{name}</a>;
}

export default class Breadcrumb extends Component<BreadcrumbProps, any> {
  static displayName = 'Breadcrumb';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Item: any;

  static defaultProps = {
    separator: '/',
  };

  context: ConfigContextValue;

  componentDidMount() {
    const props = this.props;
    warning(
      !('linkRender' in props || 'nameRender' in props),
      '`linkRender` and `nameRender` are removed, please use `itemRender` instead',
    );
  }

  render() {
    let crumbs;
    const {
      separator,
      prefixCls,
      style,
      className,
      routes,
      params = {},
      children,
      itemRender = defaultItemRender,
      dropdownProps,
      listProps,
    } = this.props;
    const { getPrefixCls } = this.context;
    if (routes && routes.length > 0) {
      const paths: string[] = [];
      crumbs = routes.map(route => {
        route.path = route.path || '';
        let path: string = route.path.replace(/^\//, '');
        Object.keys(params).forEach(key => {
          path = path.replace(`:${key}`, params[key]);
        });
        if (path) {
          paths.push(path);
        }
        return (
          <BreadcrumbItem prefixCls={prefixCls} dropdownProps={dropdownProps} listProps={listProps} separator={separator} key={route.breadcrumbName || path}>
            {itemRender(route, params, routes!, paths)}
          </BreadcrumbItem>
        );
      });
    } else if (children) {
      crumbs = Children.map(children, (element: any, index) => {
        if (!element) {
          return element;
        }
        warning(
          element.type && element.type.__C7N_BREADCRUMB_ITEM,
          'Breadcrumb only accepts Breadcrumb.Item as it\'s children',
        );
        return cloneElement<BreadcrumbItemProps>(element, {
          prefixCls,
          dropdownProps,
          listProps,
          separator,
          key: index,
        });
      });
    }
    return (
      <div className={classNames(className, getPrefixCls('breadcrumb', prefixCls))} style={style}>
        {crumbs}
      </div>
    );
  }
}
