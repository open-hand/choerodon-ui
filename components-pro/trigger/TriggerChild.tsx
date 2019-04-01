import { Children, cloneElement, PureComponent, ReactElement } from 'react';
import PropTypes from 'prop-types';

export type hook = (eventName: string, child: ReactElement<any>, e) => void;

export interface TriggerChildProps {
  onContextMenu?: hook;
  onClick?: hook;
  onMouseDown?: hook;
  onMouseEnter?: hook;
  onMouseLeave?: hook;
  onFocus?: hook;
  onBlur?: hook;
}

export default class TriggerChild extends PureComponent<TriggerChildProps> {
  static displayName = 'TriggerChild';

  static propTypes = {
    onContextMenu: PropTypes.func,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  handleContextMenu;
  handleClick;
  handleMouseDown;
  handleMouseEnter;
  handleMouseLeave;
  handleFocus;
  handleBlur;

  constructor(props, context) {
    super(props, context);
    const createChains = eventName => e => {
      const { [`on${eventName}`]: handle, children } = this.props;
      const child = Children.only(children);
      if (handle) {
        handle(eventName, child, e);
      } else if (child) {
        const { [`on${eventName}`]: childHandle } = child.props;
        if (childHandle) {
          childHandle(e);
        }
      }
    };

    this.handleContextMenu = createChains('ContextMenu');
    this.handleClick = createChains('Click');
    this.handleMouseDown = createChains('MouseDown');
    this.handleMouseEnter = createChains('MouseEnter');
    this.handleMouseLeave = createChains('MouseLeave');
    this.handleFocus = createChains('Focus');
    this.handleBlur = createChains('Blur');
  }

  render() {
    return cloneElement(Children.only(this.props.children), {
      onContextMenu: this.handleContextMenu,
      onClick: this.handleClick,
      onMouseDown: this.handleMouseDown,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    });
  }
}
