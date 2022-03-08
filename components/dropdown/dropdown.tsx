import React, { Children, cloneElement, Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import DropdownButton from './dropdown-button';
import warning from '../_util/warning';
import RcDropdown from '../rc-components/dropdown';
import { RenderFunction } from '../tooltip';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface DropDownProps {
  trigger?: 'click' | 'hover' | 'contextMenu' | ('click' | 'hover' | 'contextMenu')[];
  overlay: ReactNode | RenderFunction;
  onVisibleChange?: (visible?: boolean) => void;
  visible?: boolean;
  disabled?: boolean;
  align?: Record<string, any>;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  overlayClassName?: string;
  placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
  forceRender?: boolean;
  overlayPlacements?: object;
}

export default class Dropdown extends Component<DropDownProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Dropdown';

  static Button: typeof DropdownButton;

  static defaultProps = {
    mouseEnterDelay: 0.15,
    mouseLeaveDelay: 0.1,
    placement: 'bottomLeft',
  };

  context: ConfigContextValue;

  getTransitionName() {
    const { placement = '', transitionName } = this.props;
    if (transitionName !== undefined) {
      return transitionName;
    }
    if (placement.indexOf('top') >= 0) {
      return 'slide-down';
    }
    return 'slide-up';
  }

  renderOverlay = () => {
    const { overlay } = this.props;
    const overlayElements = typeof overlay === 'function' ? overlay() : overlay;
    if (overlayElements) {
      const overlayElement: ReactElement<any> = Children.only(overlayElements) as ReactElement<any>;

      const overlayProps = overlayElement.props;
      warning(
        !overlayProps.mode || overlayProps.mode === 'vertical',
        `mode="${overlayProps.mode}" is not supported for Dropdown's Menu.`,
      );

      // menu cannot be selectable in dropdown defaultly
      const { selectable = false, focusable = true } = overlayProps;
      return typeof overlayElement.type === 'string' ? overlayElement : cloneElement(overlayElement, {
        mode: 'vertical',
        selectable,
        focusable,
      });
    }
  };

  render() {
    const {
      children,
      prefixCls: customizePrefixCls,
      trigger,
      disabled,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('dropdown', customizePrefixCls);

    const child = Children.only(children) as ReactElement<any>;

    const dropdownTrigger = cloneElement(child, {
      className: classNames(child.props.className, `${prefixCls}-trigger`),
      disabled,
    });

    const triggerActions = disabled ? [] : trigger;
    let alignPoint;
    if (triggerActions && triggerActions.indexOf('contextMenu') !== -1) {
      alignPoint = true;
    }

    return (
      <RcDropdown
        alignPoint={alignPoint}
        {...this.props}
        prefixCls={prefixCls}
        transitionName={this.getTransitionName()}
        trigger={triggerActions}
        overlay={this.renderOverlay}
      >
        {dropdownTrigger}
      </RcDropdown>
    );
  }
}
