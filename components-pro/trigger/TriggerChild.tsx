import { Children, cloneElement, PureComponent, ReactElement } from 'react';

export type hook = (eventName: string, child: ReactElement<any>, e) => void;

export interface TriggerChildProps {
  onContextMenu?: hook;
  onClick?: hook;
  onMouseDown?: hook;
  onMouseEnter?: hook;
  onMouseLeave?: hook;
  onFocus?: hook;
  onBlur?: hook;
  isClickScrollbar?: {
    value: boolean | undefined
  };
  popupHidden?: boolean,
}

export default class TriggerChild extends PureComponent<TriggerChildProps> {
  static displayName = 'TriggerChild';

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
      if (eventName === 'Blur') {
        const { isClickScrollbar, popupHidden } = this.props;
        if (isClickScrollbar) {
          // 判断是否已经关闭
          if (popupHidden) {
            isClickScrollbar.value = false;
          }
          if (isClickScrollbar.value) {
            e.target.focus();
            return;
          }
        }
      }
      const { [`on${eventName}`]: handle, children } = this.props as { [key: string]: any };
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
    const { children } = this.props;
    return cloneElement(Children.only(children as ReactElement), {
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
