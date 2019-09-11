import React, { Component, ComponentClass, FunctionComponent, HTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SiderProps } from './Sider';
import { getPrefixCls } from '../configure';

export interface BasicProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  displayName: string;
  hasSider?: boolean;
}

export type GeneratorProps = {
  suffixCls: string;
  displayName: string;
};

function generator({ displayName, suffixCls }: GeneratorProps) {
  return (BasicComponent: FunctionComponent<BasicProps> | ComponentClass<BasicProps>): any => {
    return class Adapter extends Component<BasicProps, any> {
      static displayName = displayName;

      static Header: any;

      static Footer: any;

      static Content: any;

      static Sider: any;

      render() {
        const { prefixCls: customizePrefixCls } = this.props;
        return (
          <BasicComponent {...this.props} prefixCls={getPrefixCls(suffixCls, customizePrefixCls)} />
        );
      }
    };
  };
}

function Basic(props: BasicProps) {
  const { prefixCls, className, children, ...others } = props;
  const divCls = classNames(className, prefixCls);
  return (
    <div className={divCls} {...others}>
      {children}
    </div>
  );
}

class BasicLayout extends Component<BasicProps, any> {
  static childContextTypes = {
    siderHook: PropTypes.object,
  };

  state = { siders: [] };

  getChildContext() {
    const { siders } = this.state;
    return {
      siderHook: {
        addSider: (id: string) => {
          this.setState({
            siders: [...siders, id],
          });
        },
        removeSider: (id: string) => {
          this.setState({
            siders: siders.filter(currentId => currentId !== id),
          });
        },
      },
    };
  }

  render() {
    const { prefixCls, className, children, hasSider, ...others } = this.props;
    const { siders } = this.state;
    const divCls = classNames(className, prefixCls, {
      [`${prefixCls}-has-sider`]: hasSider || siders.length > 0,
    });
    return (
      <div className={divCls} {...others}>
        {children}
      </div>
    );
  }
}

const Layout: ComponentClass<BasicProps> & {
  Header: ComponentClass<BasicProps>;
  Footer: ComponentClass<BasicProps>;
  Content: ComponentClass<BasicProps>;
  Sider: ComponentClass<SiderProps>;
} = generator({
  suffixCls: 'layout',
  displayName: 'Layout',
})(BasicLayout);

const Header = generator({
  suffixCls: 'layout-header',
  displayName: 'Header',
})(Basic);

const Footer = generator({
  suffixCls: 'layout-footer',
  displayName: 'Footer',
})(Basic);

const Content = generator({
  suffixCls: 'layout-content',
  displayName: 'Content',
})(Basic);

Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;

export default Layout;
