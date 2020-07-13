import React, { Component, CSSProperties } from 'react';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import CollapsePanel from './CollapsePanel';
import RcCollapse from '../rc-components/collapse';
import { getPrefixCls, getConfig } from '../configure';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';

export type ExpandIconPosition = 'left' | 'right';

export type TriggerMode = 'icon' | 'header';


export interface PanelProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  disabled?: boolean;
  extra?: React.ReactNode;
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
  expandIcon?: (panelProps: PanelProps) => React.ReactNode | 'text';
  expandIconPosition?: ExpandIconPosition;
  trigger?: TriggerMode;
}

export default class Collapse extends Component<CollapseProps, any> {
  static displayName = 'Collapse';

  static Panel = CollapsePanel;

  static defaultProps = {
    bordered: true,
    openAnimation: {
      ...animation,
      appear() {},
    },
  };

  renderExpandIcon = (panelProps: PanelProps = {}) => {
    const { expandIcon } = this.props;
    return expandIcon ? expandIcon(panelProps) : null;
  };

  renderExpandTextContent = (panelProps: PanelProps = {}, locale) => {
    const {
      prefixCls: customizePrefixCls,
    } = this.props;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);

    const iconCls = classNames({
      [`${prefixCls}-expand-icon`]: true,
      [`${prefixCls}-expanded`]: panelProps.isActive,
      [`${prefixCls}-collapsed`]: !panelProps.isActive,
    });

    const icon = <i className={iconCls} />;

    return (
      <>
        {panelProps.isActive ? <span className={`${prefixCls}-expand-text`}>{locale.fold}</span> :
          <span className={`${prefixCls}-expand-text`}>{locale.unfold}</span>}
        {icon}
      </>
    );
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      expandIcon,
      bordered,
      expandIconPosition,
      trigger,
    } = this.props;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);
    const expandIconPositionCof = expandIconPosition || getConfig('collapseExpandIconPosition');
    const triggerCof = trigger || getConfig('collapseTrigger');

    const collapseClassName = classNames(
      {
        [`${prefixCls}-borderless`]: !bordered,
        // @ts-ignore
        [`${prefixCls}-text-action`]: expandIcon === 'text' && expandIconPositionCof === 'left',
        [`${prefixCls}-trigger`]: triggerCof === 'header',
        [`${prefixCls}-icon-position-${expandIconPositionCof}`]: true,
      },
      className,
    );
    let expandIconContent;

    if (typeof expandIcon === 'function') {
      expandIconContent = (panelProps: PanelProps) => this.renderExpandIcon(panelProps);
    } else if (expandIcon === 'text') {
      expandIconContent = (panelProps: PanelProps) => {
        return (
          <LocaleReceiver componentName="Collapse" defaultLocale={defaultLocale.Collapse}>
           {locale => this.renderExpandTextContent(panelProps, locale)}
         </LocaleReceiver>)
      };
    }

    return (
      <RcCollapse
        {...this.props}
        expandIcon={expandIconContent}
        prefixCls={prefixCls}
        className={collapseClassName}
      />
    );
  }
}
