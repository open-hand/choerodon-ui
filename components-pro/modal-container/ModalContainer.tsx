import React, { Component } from 'react';
import ReactDOM, { createPortal, render } from 'react-dom';
import classNames from 'classnames';
import findLast from 'lodash/findLast.js';
import noop from 'lodash/noop';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import warning from 'choerodon-ui/lib/_util/warning';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Modal, { ModalProps, destroyFns } from '../modal/Modal';
import Animate from '../animate';
import Mask from './Mask';
import { stopEvent } from '../_util/EventManager';
import { suffixCls } from '../modal/utils';

const KeyGen = (function*(id) {
  while (true) {
    yield `${getProPrefixCls(suffixCls)}-${id}`;
    id += 1;
  }
})(1);

const containerInstanses: ModalContainer[] = [];

function removeInstanse(instanse: ModalContainer) {
  const index = containerInstanses.indexOf(instanse);
  if (index > -1) {
    containerInstanses.splice(index, 1);
  }
}

function addInstanse(instanse: ModalContainer) {
  removeInstanse(instanse);
  containerInstanses.push(instanse);
}

export function getKey(): string {
  return KeyGen.next().value;
}

let root;
let defaultBodyStyle: { overflow; paddingRight } | undefined;

function getRoot() {
  if (typeof window !== 'undefined') {
    const doc = window.document;
    if (root) {
      if (!root.parentNode) {
        doc.body.appendChild(root);
      }
    } else {
      root = doc.createElement('div');
      root.className = `${getProPrefixCls(suffixCls)}-container`;
      doc.body.appendChild(root);
    }
  }
  return root;
}

/**
 * 判断body是否有滚动条
 *
 * @returns {boolean}
 */
function hasScrollBar(): boolean {
  const { scrollHeight, clientHeight } = document.body;
  return scrollHeight > clientHeight;
}

function hideBodyScrollBar() {
  const { style } = document.body;
  if (!defaultBodyStyle) {
    defaultBodyStyle = {
      overflow: style.overflow,
      paddingRight: style.paddingRight,
    };
    style.overflow = 'hidden';
    if (hasScrollBar()) {
      style.paddingRight = pxToRem(measureScrollbar()) || '';
    }
  }
}

function showBodyScrollBar() {
  const { style } = document.body;
  if (defaultBodyStyle) {
    const { overflow, paddingRight } = defaultBodyStyle;
    defaultBodyStyle = undefined;
    style.overflow = overflow;
    style.paddingRight = paddingRight;
  }
}

export interface ModalContainerProps {
  location?: { pathname: string };
}

export interface ModalContainerState {
  modals: ModalProps[];
}

export default class ModalContainer extends Component<ModalContainerProps> {
  static displayName = 'ModalContainer';

  state: ModalContainerState = {
    modals: [],
  };

  constructor(props, context) {
    super(props, context);
    this.top();
  }

  handleAnimationEnd = (modalKey, isEnter) => {
    if (!isEnter) {
      const { modals } = this.state;
      const index = this.findIndex(modalKey);
      if (index !== -1) {
        const props = modals[index];
        modals.splice(index, 1);
        if (!props.destroyOnClose) {
          modals.unshift(props);
        }
        if (props.afterClose) {
          props.afterClose();
        }
        this.setState({ modals });
      }
    }
  };

  handleMaskClick = async () => {
    const { modals } = this.state;
    const modal = findLast(modals, ({ hidden }) => !hidden);
    if (modal) {
      const { close = noop, onCancel = noop, maskClosable } = modal;
      if (maskClosable) {
        const ret = await onCancel();
        if (ret !== false) {
          close();
        }
      }
    }
  };

  top(): ModalContainer {
    addInstanse(this);
    return this;
  }

  componentWillUpdate(nextProps) {
    const { location } = nextProps;
    const { location: currentLocation } = this.props;
    if (location && currentLocation && location.pathname !== currentLocation.pathname) {
      this.clear();
    }
    this.top();
  }

  componentWillUnmount() {
    removeInstanse(this);
  }

  findIndex(modalKey) {
    const { modals } = this.state;
    return modals.findIndex(({ key }) => key === modalKey);
  }

  open(props: ModalProps) {
    const { modals } = this.state;
    // eslint-disable-next-line no-console
    console.log('props', props);
    if (!props.key) {
      props.key = getKey();
      warning(
        !!props.destroyOnClose,
        `The modal which opened has no key, please provide a key or set the \`destroyOnClose\` as true.`,
      );
    } else {
      const index = this.findIndex(props.key);
      if (index !== -1) {
        modals.splice(index, 1);
      }
    }
    modals.push({ ...props, hidden: false });
    this.setState({ modals });
  }

  close(props: ModalProps) {
    const { modals } = this.state;
    const target = modals.find(({ key }) => key === props.key);
    if (target) {
      Object.assign(target, props, { hidden: true });
      this.setState({ modals });
    }
  }

  destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(getRoot());
    if (unmountResult && getRoot().parentNode) {
      getRoot().parentNode.removeChild(getRoot());
    }
    // const triggerCancel = args.some(param => param && param.triggerCancel);
    // if (props.onCancel && triggerCancel) {
    //   props.onCancel();
    // }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  }

  update(props: ModalProps) {
    const { modals: originModals } = this.state;
    const modals = [...originModals];
    if (props.key) {
      const index = this.findIndex(props.key);
      if (index !== -1) {
        modals[index] = props;
        this.setState({ modals });
      }
    }
  }

  clear() {
    const { modals } = this.state;
    modals.forEach(modal => this.close({ ...modal, destroyOnClose: true }));
  }

  getOffset(modals, idx) {
    const MARGIN_RIGHT_ARRAY: any = [];
    const DEFAULT = 150;
    const drawers = modals.filter(modal => modal.drawer && !modal.hidden);
    const indexInDrawers = drawers.findIndex(drawer => drawer.key === modals[idx].key);
    if (indexInDrawers === -1) {
      return 0;
    }
    for (let i = drawers.length - 1; i >= indexInDrawers; i--) {
      if (i === drawers.length - 1) {
        MARGIN_RIGHT_ARRAY.push(0);
      } else {
        const CURRENT_WIDTH = this.getModalWidth(drawers[i]);
        const NEXT_WIDTH = this.getModalWidth(drawers[i + 1]);
        const NEXT_MARGIN = MARGIN_RIGHT_ARRAY[drawers.length - i - 2];
        if (CURRENT_WIDTH >= NEXT_MARGIN + NEXT_WIDTH + DEFAULT) {
          MARGIN_RIGHT_ARRAY.push(0);
        } else {
          MARGIN_RIGHT_ARRAY.push(NEXT_MARGIN + NEXT_WIDTH + DEFAULT - CURRENT_WIDTH);
        }
      }
    }
    return MARGIN_RIGHT_ARRAY[MARGIN_RIGHT_ARRAY.length - 1];
  }

  getModalWidth(modal) {
    return (modal && modal.style && modal.style.width) || 520;
  }

  getComponent() {
    let hidden = true;
    const { modals } = this.state;
    const items = modals.map((props, index) => {
      const thisHidden = props.hidden;
      const { drawerTransitionName = 'slide-right' } = props;
      if (hidden && !thisHidden) {
        hidden = false;
      }
      const newProps: any = {};
      if (props.drawer) {
        newProps.style = {
          marginRight: this.getOffset(modals, index),
          ...props.style,
        };
      }
      if (index === modals.length - 1) {
        newProps.className = classNames(props.className, `${getProPrefixCls(suffixCls)}-active`);
      }
      return (
        <Animate
          key={props.key}
          component="div"
          transitionAppear
          transitionName={props.drawer ? drawerTransitionName : 'zoom'}
          hiddenProp="hidden"
          onEnd={this.handleAnimationEnd}
        >
          <Modal key={props.key} {...props} {...newProps} />
        </Animate>
      );
    });
    const animationProps: any = {};
    if (typeof window !== 'undefined') {
      if (hidden) {
        animationProps.onEnd = showBodyScrollBar;
      } else {
        hideBodyScrollBar();
      }
    }
    return (
      <>
        <Animate
          component=""
          transitionAppear
          transitionName="fade"
          hiddenProp="hidden"
          {...animationProps}
        >
          <Mask hidden={hidden} onClick={this.handleMaskClick} onMouseDown={stopEvent} />
        </Animate>
        {items}
      </>
    );
  }

  render() {
    const mount = getRoot();
    if (mount) {
      return createPortal(this.getComponent(), mount);
    }
    return null;
  }
}

export function getContainer(loop?: boolean) {
  const { length } = containerInstanses;
  if (length) {
    return containerInstanses[length - 1];
  }
  if (loop !== true) {
    render(<ModalContainer />, getRoot());
    return getContainer(true);
  }
}

export function open(props: ModalProps & { children }) {
  const container = getContainer();

  async function close(destroy?: boolean) {
    const { onClose = noop } = props;
    if ((await onClose()) !== false) {
      if (destroy) {
        container.close({ ...props, destroyOnClose: true });
      } else {
        container.close(props);
      }
    }
  }

  function update(newProps) {
    container.update({ ...props, ...newProps });
  }

  props = {
    close,
    update,
    ...Modal.defaultProps,
    ...props,
  };
  container.open(props);

  destroyFns.push(close);
  // eslint-disable-next-line no-console
  console.log('destroyFns', destroyFns);

  function show(newProps) {
    // eslint-disable-next-line no-console
    console.log('object', props);
    container.open({ ...props, ...newProps });
  }

  return {
    close,
    open: show,
    update,
  };
}
