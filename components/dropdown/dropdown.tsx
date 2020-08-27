import React, { Children, cloneElement, Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import DropdownButton from './dropdown-button';
import warning from '../_util/warning';
import RcDropdown from '../rc-components/dropdown';
import { getPrefixCls } from '../configure';
import { Placements } from './enum';

export interface DropDownProps {
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  overlay: ReactNode;
  onVisibleChange?: (visible?: boolean) => void;
  visible?: boolean;
  disabled?: boolean;
  align?: Object;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  overlayClassName?:string;
  placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
  forceRender?: boolean;
  overlayPlacements?: Placements;
}

export default class Dropdown extends Component<DropDownProps, any> {
  static displayName = 'Dropdown';

  static Button: typeof DropdownButton;

  static defaultProps = {
    mouseEnterDelay: 0.15,
    mouseLeaveDelay: 0.1,
    placement: 'bottomLeft',
  };

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

  componentDidMount() {
    const { overlay } = this.props;
    const overlayProps = (overlay as any).props as any;
    warning(
      !overlayProps.mode || overlayProps.mode === 'vertical',
      `mode="${overlayProps.mode}" is not supported for Dropdown's Menu.`,
    );
  }

  render() {
    const {
      children,
      prefixCls: customizePrefixCls,
      overlay: overlayElements,
      trigger,
      disabled,
    } = this.props;
    const prefixCls = getPrefixCls('dropdown', customizePrefixCls);

    const child = Children.only(children) as ReactElement<any>;
    const overlay = Children.only(overlayElements) as ReactElement<any>;

    const dropdownTrigger = cloneElement(child, {
      className: classNames(child.props.className, `${prefixCls}-trigger`),
      disabled,
    });
    // menu cannot be selectable in dropdown defaultly
    const selectable = overlay.props.selectable || false;
    const fixedModeOverlay = cloneElement(overlay, {
      mode: 'vertical',
      selectable,
    });
    return (
      <RcDropdown
        {...this.props}
        prefixCls={prefixCls}
        transitionName={this.getTransitionName()}
        trigger={disabled ? [] : trigger}
        overlay={fixedModeOverlay}
      >
        {dropdownTrigger}
      </RcDropdown>
    );
  }
}
