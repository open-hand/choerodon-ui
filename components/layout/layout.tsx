import React, { ComponentClass, FunctionComponent, HTMLAttributes, PureComponent } from 'react';
import classNames from 'classnames';
import { SiderProps } from './Sider';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { LayoutContextProvider } from './LayoutContext';

export interface BasicProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  displayName?: string;
  hasSider?: boolean;
}

export type GeneratorProps = {
  suffixCls: string;
  displayName: string;
};

function generator({ displayName, suffixCls }: GeneratorProps) {
  return (BasicComponent: FunctionComponent<BasicProps> | ComponentClass<BasicProps>): any => {
    return class Adapter extends PureComponent<BasicProps, any> {
      static displayName = displayName;

      static get contextType(): typeof ConfigContext {
        return ConfigContext;
      }

      static Header: any;

      static Footer: any;

      static Content: any;

      static Sider: any;

      context: ConfigContextValue;

      render() {
        const { prefixCls: customizePrefixCls } = this.props;
        const { getPrefixCls } = this.context;
        return (
          <BasicComponent prefixCls={getPrefixCls(suffixCls, customizePrefixCls)} {...this.props} />
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

class BasicLayout extends PureComponent<BasicProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'BasicLayout';

  state = { siders: [] };

  context: ConfigContextValue;

  getContextValue() {
    const { siders } = this.state;
    const { getPrefixCls } = this.context;
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
      getPrefixCls,
    };
  }

  render() {
    const { prefixCls, className, children, hasSider, ...others } = this.props;
    const { siders } = this.state;
    const divCls = classNames(className, prefixCls, {
      [`${prefixCls}-has-sider`]: hasSider || siders.length > 0,
    });
    return (
      <LayoutContextProvider {...this.getContextValue()}>
        <div className={divCls} {...others}>
          {children}
        </div>
      </LayoutContextProvider>
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
