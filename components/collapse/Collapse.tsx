import React, { isValidElement, cloneElement, Component, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import toArray from 'lodash/toArray';
import isArray from 'lodash/isArray';
import animation from '../_util/openAnimation';
import CollapsePanel, { CollapsibleType } from './CollapsePanel';
import RcCollapse from '../rc-components/collapse';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export type ExpandIconPosition = 'left' | 'right' | 'text-right';

export type TriggerMode = 'icon' | 'header';

export interface PanelProps {
  isActive?: boolean;
  header?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  disabled?: boolean;
  extra?: ReactNode;
  collapsible?: CollapsibleType;
  children?: ReactNode;
}

export interface CollapseProps {
  activeKey?: Array<string> | string;
  defaultActiveKey?: Array<string>;
  /** 手风琴效果 */
  accordion?: boolean;
  onChange?: (key: string | string[]) => void;
  style?: CSSProperties;
  className?: string;
  bordered?: boolean;
  prefixCls?: string;
  expandIcon?: ((panelProps: PanelProps) => ReactNode) | 'text';
  expandIconPosition?: ExpandIconPosition;
  trigger?: TriggerMode;
  ghost?: boolean;
  collapsible?: CollapsibleType;
  children?: ReactNode;
}

export default class Collapse extends Component<CollapseProps, any> {
  static displayName = 'Collapse';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Panel = CollapsePanel;

  static defaultProps = {
    bordered: true,
    openAnimation: {
      ...animation,
      appear() {/* noop */ },
    },
  };

  context: ConfigContextValue;

  renderExpandTextContent = (panelProps: PanelProps = {}, locale, localeCode, expandIconPositionCof) => {
    const {
      prefixCls: customizePrefixCls,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);

    const iconCls = classNames({
      [`${prefixCls}-expand-icon`]: true,
      [`${prefixCls}-expanded`]: panelProps.isActive,
      [`${prefixCls}-collapsed`]: !panelProps.isActive,
    });

    const icon = <i className={iconCls} />;

    return (
      <>
        {expandIconPositionCof === 'left' && icon}
        {panelProps.isActive ? <span className={`${prefixCls}-expand-text`} style={{ minWidth: localeCode === 'zh-cn' ? '0.38rem' : '0.52rem' }}>{locale.fold}</span> :
          <span className={`${prefixCls}-expand-text`} style={{ minWidth: localeCode === 'zh-cn' ? '0.38rem' : '0.52rem' }}>{locale.unfold}</span>}
        {expandIconPositionCof === 'right' && icon}
      </>
    );
  };

  renderItems = () => {
    const { children, collapsible: parentCollapsible } = this.props

    let arrayChildren: ReactNode = children;
    if (!isArray(children)) {
      arrayChildren = [children];
    }
    return toArray(arrayChildren).map((child: React.ReactElement<PanelProps>, index: number) => {
      if (isValidElement(child)) {
        const key = child.key || String(index);
        const { disabled, collapsible } =  child.props;
        if (disabled) {
          const childProps: PanelProps & { key: React.Key } = {
            ...omit(child.props, 'disabled'),
            key,
            disabled: collapsible && (collapsible === 'header' || collapsible === 'icon') ? false : disabled,
          };
          return cloneElement(child, childProps);
        }
        return cloneElement(child, { ...child.props, key, disabled: collapsible ? collapsible === 'disabled' : parentCollapsible === 'disabled' });
      }
      return child;
    });
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      expandIcon,
      bordered,
      expandIconPosition,
      trigger,
      ghost,
    } = this.props;
    const { getPrefixCls, getConfig } = this.context;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);
    const expandIconPositionCof = expandIconPosition || getConfig('collapseExpandIconPosition');
    const expandIconCof: ReactNode = expandIcon || getConfig('collapseExpandIcon');
    const triggerCof = trigger || getConfig('collapseTrigger');

    const collapseClassName = classNames(
      {
        [`${prefixCls}-borderless`]: !bordered,
        [`${prefixCls}-text-action`]: expandIconCof === 'text' && expandIconPositionCof === 'left',
        [`${prefixCls}-trigger`]: triggerCof === 'header',
        [`${prefixCls}-ghost`]: ghost,
        [`${prefixCls}-icon-position-${expandIconPositionCof}`]: true,
      },
      className,
    );
    let expandIconContent;

    if (typeof expandIconCof === 'function') {
      expandIconContent = (panelProps: PanelProps) => expandIconCof(panelProps);
    } else if (expandIconCof === 'text') {
      expandIconContent = (panelProps: PanelProps) => {
        return (
          <LocaleReceiver componentName="Collapse" defaultLocale={getRuntimeLocale().Collapse || {}}>
            {(locale, localeCode) => this.renderExpandTextContent(panelProps, locale, localeCode, expandIconPositionCof)}
          </LocaleReceiver>)
      };
    }

    return (
      <RcCollapse
        {...this.props}
        expandIcon={expandIconContent}
        expandIconPosition={expandIconPositionCof}
        prefixCls={prefixCls}
        className={collapseClassName}
      >
        {this.renderItems()}
      </RcCollapse>
    );
  }
}
