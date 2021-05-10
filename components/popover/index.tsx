import React, { Component, ReactNode } from 'react';
import Tooltip, { AbstractTooltipProps, RenderFunction } from '../tooltip';
import warning from '../_util/warning';
import { getPrefixCls } from '../configure';

export interface PopoverProps extends AbstractTooltipProps {
  title?: ReactNode;
  content?: ReactNode | RenderFunction;
}

export default class Popover extends Component<PopoverProps, {}> {
  static displayName = 'Popover';

  static defaultProps = {
    placement: 'top',
    transitionName: 'zoom-big',
    trigger: 'hover',
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    overlayStyle: {},
  };

  private tooltip: Tooltip;

  getPopupDomNode() {
    return this.tooltip.getPopupDomNode();
  }

  getOverlay = () => {
    const { title, content } = this.props;
    const prefixCls = this.getPrefixCls();
    warning(
      !('overlay' in this.props),
      'Popover[overlay] is removed, please use Popover[content] instead',
    );
    const header = typeof title === 'function' ? title() : title;
    return (
      <div>
        {header && <div className={`${prefixCls}-title`}>{header}</div>}
        <div className={`${prefixCls}-inner-content`}>{typeof content === 'function' ? content() : content}</div>
      </div>
    );
  }

  saveTooltip = (node: any) => {
    this.tooltip = node;
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('popover', prefixCls);
  }

  render() {
    const props = { ...this.props };
    delete props.title;
    return (
      <Tooltip
        {...props}
        prefixCls={this.getPrefixCls()}
        ref={this.saveTooltip}
        overlay={this.getOverlay}
      />
    );
  }
}
