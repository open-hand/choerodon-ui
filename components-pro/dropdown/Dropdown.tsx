import React, { cloneElement, isValidElement, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Trigger from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import { Placements } from './enum';
import placements from './placements';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';

export interface DropDownProps {
  trigger?: Action[];
  overlay: React.ReactNode;
  onHiddenChange?: (hidden?: boolean) => void;
  onVisibleChange?: (visible?: boolean) => void;
  onOverlayClick?: (e) => void;
  hidden?: boolean;
  visible?: boolean;
  defaultHidden?: boolean;
  defaultVisible?: boolean;
  disabled?: boolean;
  align?: Object;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  suffixCls?: string;
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  placement?: Placements;
  forceRender?: boolean;
}

export interface DropdownState {
  hidden?: boolean;
}

export default class Dropdown extends PureComponent<DropDownProps> {
  static displayName = 'Dropdown';
  static propTypes = {
    trigger: PropTypes.arrayOf(PropTypes.oneOf([
      Action.focus,
      Action.hover,
      Action.click,
      Action.contextMenu,
    ])),
    overlay: PropTypes.any,
    placement: PropTypes.oneOf([
      Placements.bottomLeft,
      Placements.bottomCenter,
      Placements.bottomRight,
      Placements.topLeft,
      Placements.topCenter,
      Placements.topRight,
    ]),
    hidden: PropTypes.bool,
    visible: PropTypes.bool,
    onHiddenChange: PropTypes.func,
    onVisibleChange: PropTypes.func,
    onOverlayClick: PropTypes.func,
    suffixCls: PropTypes.string,
    prefixCls: PropTypes.string,
    defaultHidden: PropTypes.bool,
    defaultVisible: PropTypes.bool,
  };
  static defaultProps = {
    suffixCls: 'dropdown',
    placement: Placements.bottomLeft,
    trigger: [Action.hover, Action.focus],
    defaultHidden: true,
  };

  get triggerAction(): Action[] {
    const { trigger } = this.props;
    return trigger as Action[];
  }

  get transitionName() {
    const { placement } = this.props;
    let result = 'slide-up';
    if (placement && placement.startsWith('top')) {
      result = 'slide-down';
    }
    return result;
  }

  get prefixCls(): string {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  state: DropdownState;

  constructor(props) {
    super(props);
    if ('hidden' in props) {
      this.state = {
        hidden: props.hidden,
      };
    } else if ('visible' in props) {
      this.state = {
        hidden: !props.visible,
      };
    } else if ('defaultHidden' in props) {
      this.state = {
        hidden: props.defaultHidden,
      };
    } else {
      this.state = {
        hidden: !props.defaultVisible,
      };
    }
  }

  /**
   * 调用传入的onHiddenChange方法
   *
   * @param {boolean} hidden
   */
  handlePopupHiddenChange = (hidden: boolean) => {
    const { onHiddenChange, onVisibleChange, hidden: propsHidden, visible: propsVisible } = this.props;
    if (propsHidden === void 0 && propsVisible === void 0) {
      this.setState({
        hidden,
      });
    }
    if (onHiddenChange) {
      onHiddenChange(hidden);
    }
    if (onVisibleChange) {
      onVisibleChange(!hidden);
    }
  };

  handleClick = (e) => {
    const { onOverlayClick, overlay, hidden, visible } = this.props;
    const { onClick } = (isValidElement(overlay) && overlay.props || {}) as { onClick };
    if (onOverlayClick) {
      onOverlayClick(e);
    }
    if (onClick) {
      onClick(e);
    }
    if (hidden === void 0 && visible === void 0) {
      this.setState({
        hidden: true,
      });
    }
  };

  getMenuElement() {
    const { overlay } = this.props;
    if (isValidElement(overlay)) {
      return cloneElement<any>(overlay, {
        onClick: this.handleClick,
      });
    }
  }

  componentWillReceiveProps({ hidden, visible }: DropDownProps) {
    if (hidden !== void 0) {
      this.setState({
        hidden,
      });
    } else if (visible !== void 0) {
      this.setState({
        hidden: !visible,
      });
    }
  }

  render() {
    const {
      prefixCls,
      props: {
        children,
        placement,
      },
    } = this;

    return (
      <Trigger
        prefixCls={prefixCls}
        action={this.triggerAction}
        builtinPlacements={placements}
        popupPlacement={placement}
        popupContent={this.getMenuElement()}
        popupStyle={{ whiteSpace: 'nowrap' }}
        onPopupHiddenChange={this.handlePopupHiddenChange}
        popupHidden={this.state.hidden}
      >
        {children}
      </Trigger>
    );
  }
}
