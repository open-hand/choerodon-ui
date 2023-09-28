import React, { Component, CSSProperties, Key } from 'react';
import { createPortal, render } from 'react-dom';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import isPromise from 'is-promise';
import findLast from 'lodash/findLast';
import findLastIndex from 'lodash/findLastIndex';
import noop from 'lodash/noop';
import { ModalContainerState } from 'choerodon-ui/shared/modal-manager';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import warning from 'choerodon-ui/lib/_util/warning';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import ModalManager, { DrawerOffsets, IModalContainer } from '../modal-manager';
import Modal, { ModalProps } from '../modal/Modal';
import Animate from '../animate';
import Mask from './Mask';
import { stopEvent } from '../_util/EventManager';
import { suffixCls, toUsefulDrawerTransitionName } from '../modal/utils';
import { getDocument } from '../_util/DocumentUtils';
import { ViewComponentProps } from '../core/ViewComponent';
import { ModalProxy } from '../modal/interface';

export { ModalContainerState };

const { containerInstances } = ModalManager;

function getArrayIndex(array, index) {
  if (array.length > index) {
    return array[index];
  }
  return 0;
}

function getRoot(): HTMLElement | null {
  let { root } = ModalManager;
  if (typeof window !== 'undefined') {
    const doc = getDocument(window);
    if (root && root.ownerDocument === doc) {
      if (!root.parentNode) {
        doc.body.appendChild(root);
      }
    } else {
      root = doc.createElement('div');
      root.className = `${getProPrefixCls(suffixCls)}-container`;
      doc.body.appendChild(root);
      ModalManager.root = root;
    }
  }
  if (root) {
    return root;
  }
  return null;
}

/**
 * 判断body是否有滚动条
 *
 * @returns {boolean}
 */
function hasScrollBar(body: HTMLElement): boolean {
  const { scrollHeight, clientHeight } = body;
  return scrollHeight > clientHeight;
}

function hideBodyScrollBar(container: HTMLElement) {
  if (!ModalManager.containerStyles.has(container)) {
    const { style } = container;
    ModalManager.containerStyles.set(container, {
      overflow: style.overflow,
      paddingRight: style.paddingRight,
      position: style.position,
    });
    style.overflow = 'hidden';
    if (container.tagName.toLowerCase() === 'body') {
      if (hasScrollBar(container)) {
        style.paddingRight = pxToRem(measureScrollbar(), true) || '';
      }
    } else {
      const { ownerDocument } = container;
      if (ownerDocument) {
        const { defaultView } = ownerDocument;
        if (defaultView) {
          const { position } = defaultView.getComputedStyle(container);
          if (position === 'static') {
            style.position = 'relative';
          }
        }
      }
    }
  }
}

function showBodyScrollBar(container: HTMLElement) {
  const memoStyle = ModalManager.containerStyles.get(container);
  if (memoStyle) {
    const { style } = container;
    const { overflow, paddingRight, position } = memoStyle;
    ModalManager.containerStyles.delete(container);
    style.overflow = overflow;
    style.paddingRight = paddingRight;
    style.position = position;
  }
}

export interface ModalContainerProps {
  location?: { pathname: string };
  getContainer?: HTMLElement | null | (() => HTMLElement | undefined) | false;
}

@observer
export default class ModalContainer extends Component<ModalContainerProps> implements IModalContainer {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'ModalContainer';

  static defaultProps = {
    getContainer: getRoot,
  };

  context: ConfigContextValue;

  openTime?: number;

  state: ModalContainerState = {
    modals: [],
  };

  saveMount = (mount) => {
    if (mount) {
      this.setState({
        mount,
      });
    }
  };

  @observable maskHidden: boolean;

  @observable active: boolean;

  @observable drawerOffsets: DrawerOffsets;

  maskStyle?: CSSProperties | undefined;

  isUnMount = false;

  @computed
  get baseOffsets() {
    const offsets = {
      'slide-up': 0, 'slide-right': 0, 'slide-down': 0, 'slide-left': 0,
    };
    containerInstances.some((instance) => {
      if (instance === this) {
        return true;
      }
      const { drawerOffsets, active } = instance;
      if (active && instance.getOffsetContainer() === this.getOffsetContainer()) {
        offsets['slide-up'] += getArrayIndex(drawerOffsets['slide-up'], 0);
        offsets['slide-right'] += getArrayIndex(drawerOffsets['slide-right'], 0);
        offsets['slide-down'] += getArrayIndex(drawerOffsets['slide-down'], 0);
        offsets['slide-left'] += getArrayIndex(drawerOffsets['slide-left'], 0);
      }
      return false;
    });
    return offsets;
  }

  @computed
  get isTop(): boolean {
    let is = true;
    containerInstances.some(instance => {
      if (instance !== this && !instance.maskHidden) {
        is = false;
        return true;
      }
      if (instance === this) {
        return true;
      }
      return false;
    });
    return is;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.maskHidden = true;
      this.active = false;
      this.drawerOffsets = { 'slide-up': [], 'slide-right': [], 'slide-down': [], 'slide-left': [] };
      this.top();
      ModalManager.registerMousePosition();
    });
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
        this.updateModals(modals);
      }
    }
  };

  handleMaskClick = () => {
    const { modals } = this.state;
    const modal: ModalProps | undefined = findLast(modals, (modalProps: ModalProps) => Boolean(!modalProps.hidden && modalProps.mask));
    if (modal) {
      const { context } = this;
      const { close = noop, onCancel = noop, maskClosable = context.getConfig('modalMaskClosable') } = modal;
      if (maskClosable) {
        const ret: Promise<boolean | undefined> | boolean | undefined = onCancel();
        const cb = (result) => {
          if (result !== false) {
            close();
          }
        };
        if (isPromise(ret)) {
          ret.then(cb);
        } else {
          cb(ret);
        }
      }
    }
  };

  handleModalTopChange = (key?: Key) => {
    const { modals } = this.state;
    if (key) {
      const last = findLast(modals, (modalProps: ModalProps) => !modalProps.hidden);
      if (last && last.key !== key) {
        const [under, top] = modals.reduce<[ModalProps[], ModalProps[]]>(([left, right], modal) => {
          if (modal.key === key) {
            right.push(modal);
          } else {
            left.push(modal);
          }
          return [left, right];
        }, [[], []]);
        this.setState({
          modals: under.concat(top),
        });
      }
    }
  };

  @action
  top(): IModalContainer {
    ModalManager.addInstance(this);
    return this;
  }

  componentDidUpdate(prevProps) {
    const { location } = prevProps;
    const { location: currentLocation } = this.props;
    if (location && currentLocation && location.pathname !== currentLocation.pathname) {
      ModalManager.clear(true);
    }
  }

  componentWillUnmount() {
    const { modals, mount } = this.state;
    this.isUnMount = true;
    ModalManager.removeInstance(this);
    if (!mount && modals.length) {
      const container = this.getContainer();
      if (container) {
        const current = ModalManager.containerInstances.find((instance) => !instance.state.mount && instance.getContainer() === container);
        if (current) {
          current.mergeModals(modals.reduce<ModalProps[]>((list, modal) => modal.__deprecate__ && (!modal.hidden || !modal.destroyOnClose) ? list.concat({
            ...modal,
            transitionAppear: false,
          }) : list, []));
        }
      }
    }
  }

  @action
  updateModals(modals: ModalProps[]) {
    this.top();
    let maskHidden = true;
    let active = false;
    const drawerOffsets: DrawerOffsets = { 'slide-up': [], 'slide-right': [], 'slide-down': [], 'slide-left': [] };
    modals.slice().reverse().forEach(({ hidden, drawer, drawerOffset, drawerTransitionName, mask }) => {
      if (!hidden) {
        active = true;
        if (mask) {
          maskHidden = false;
        }
        const transitionName = toUsefulDrawerTransitionName(drawerTransitionName);
        if (drawer && transitionName) {
          const offsets = drawerOffsets[transitionName];
          const offset = offsets[0] || 0;
          offsets.unshift(offset + (drawerOffset || 0));
        }
      }
    });
    this.drawerOffsets = drawerOffsets;
    this.maskHidden = maskHidden; // modals.every(({ hidden }) => hidden);
    this.active = active;
    this.setState({ modals });
  }

  mergeModals(newModals: ModalProps[]) {
    const { modals } = this.state;
    const map = new Map<Key, ModalProps>();
    modals.forEach((modal) => {
      if (modal.key) {
        map.set(modal.key, modal);
      }
    });
    newModals.forEach((modal) => {
      if (modal.key) {
        map.set(modal.key, modal);
      }
    });
    this.updateModals(Array.from(map.values()));
  }

  findIndex(modalKey) {
    const { modals } = this.state;
    return modals.findIndex(({ key }) => key === modalKey);
  }

  open(props: ModalProps) {
    const { beforeOpen } = props;
    if (beforeOpen) {
      beforeOpen();
    }
    const { modals } = this.state;
    if (!props.key) {
      props.key = ModalManager.getKey();
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
    this.updateModals(modals);
  }

  close(props: ModalProps) {
    const { modals } = this.state;
    const target = modals.find(({ key }) => key === props.key);
    if (target) {
      Object.assign(target, props, { hidden: true });
      this.updateModals(modals);
    }
  }

  update(props: ModalProps) {
    const { modals: originModals } = this.state;
    const modals = [...originModals];
    if (props.key) {
      const index = this.findIndex(props.key);
      if (index !== -1) {
        modals[index] = { ...modals[index], ...props };
        this.updateModals(modals);
      }
    }
  }

  clear(closeByLocationChange) {
    const { modals } = this.state;
    this.updateModals(modals.map(modal => closeByLocationChange && !modal.closeOnLocationChange ? modal : ({
      ...modal,
      destroyOnClose: true,
      hidden: true,
    })));
  }

  getModalWidth(modal) {
    return (modal && modal.style && modal.style.width) || 520;
  }

  getComponent(mount?: HTMLElement) {
    const { maskHidden, isTop, drawerOffsets, baseOffsets, props: { getContainer } } = this;
    const { modals } = this.state;
    const { context } = this;
    const indexes = { 'slide-up': 1, 'slide-right': 1, 'slide-down': 1, 'slide-left': 1 };
    const activeModalIndex: number = isTop ? findLastIndex<ModalProps>(modals, ({ mask, hidden }) => Boolean(!hidden && mask)) : -1;
    const activeModal: ModalProps | undefined = modals[activeModalIndex];
    let maskTransition = true;
    const offsetContainer = this.getOffsetContainer();
    const isEmbeddedContainer = offsetContainer && offsetContainer.tagName.toLowerCase() !== 'body';
    const prefixCls = context.getProPrefixCls(`${suffixCls}-container`);
    const items = modals.map((props, index) => {
      const getAutoCenterConfig = 'autoCenter' in props ? props.autoCenter : context.getConfig('modalAutoCenter');
      const {
        drawerTransitionName = context.getConfig('drawerTransitionName'),
        drawer,
        key,
        transitionAppear = true,
        mask,
        maskClosable = context.getConfig('modalMaskClosable'),
      } = props;
      const transitionName = toUsefulDrawerTransitionName(drawerTransitionName);
      const style: CSSProperties = {
        ...props.style,
      };
      if (drawer) {
        const i = indexes[transitionName];
        indexes[transitionName] += 1;
        const offset = getArrayIndex(drawerOffsets[transitionName], i) + baseOffsets[transitionName];
        if (offset) {
          switch (transitionName) {
            case 'slide-up':
              style.marginTop = offset;
              style.transition = 'margin-top 0.3s ease-in-out';
              break;
            case 'slide-down':
              style.marginBottom = offset;
              style.transition = 'margin-bottom 0.3s ease-in-out';
              break;
            case 'slide-left':
              style.marginLeft = offset;
              style.transition = 'margin-left 0.3s ease-in-out';
              break;
            default:
              style.marginRight = offset;
              style.transition = 'margin-right 0.3s ease-in-out';
          }
        }
      } else if (isEmbeddedContainer && offsetContainer) {
        style.top = pxToRem(offsetContainer.scrollTop + (getAutoCenterConfig ? 0 : toPx(style.top) || 100), true)!;
      }
      if (transitionAppear === false) {
        maskTransition = false;
      }
      if (getAutoCenterConfig && maskClosable) {
        const {
          onClick: customizedClick = noop,
          onDoubleClick: customizedDoubleClick = noop,
        } = props;
        if (maskClosable === 'dblclick') {
          props.onDoubleClick = (e) => {
            if (e.target === e.currentTarget) {
              this.handleMaskClick();
            } else {
              customizedDoubleClick(e);
            }
          };
        } else {
          props.onClick = (e) => {
            if (e.target === e.currentTarget) {
              this.handleMaskClick();
            } else {
              customizedClick(e);
            }
          };
        }
      }
      const wrapperClassName = classNames(props.drawer ? `${prefixCls}-drawer` : `${prefixCls}-pristine`, {
        [`${prefixCls}-embedded`]: isEmbeddedContainer,
      });
      return (
        <Animate
          key={key}
          component="div"
          // UED 用类名判断
          className={wrapperClassName}
          transitionAppear={transitionAppear}
          transitionName={transitionAppear ? drawer ? transitionName : 'zoom' : undefined}
          hiddenProp="hidden"
          onEnd={this.handleAnimationEnd}
        >
          <Modal
            eventKey={key}
            mousePosition={ModalManager.mousePosition}
            {...props}
            style={style}
            active={index === activeModalIndex || (isTop && !mask && index > activeModalIndex)}
            onTop={mask || drawer ? undefined : this.handleModalTopChange}
          />
        </Animate>
      );
    });
    const animationProps: any = {};
    if (mount && offsetContainer) {
      if (containerInstances.every(instance => !instance.active || instance.getOffsetContainer() !== offsetContainer)) {
        animationProps.onEnd = () => showBodyScrollBar(offsetContainer);
      } else {
        hideBodyScrollBar(offsetContainer);
      }
    }
    const maskProps: ViewComponentProps = {};
    const style: CSSProperties = {};
    if (activeModal) {
      const { maskClosable = context.getConfig('modalMaskClosable'), maskStyle, maskClassName } = activeModal;
      maskProps.className = maskClassName;
      maskProps.onMouseDown = stopEvent;
      this.openTime = new Date().valueOf();
      if (maskClosable === 'dblclick') {
        maskProps.onDoubleClick = () => {
          const nowTime = new Date().valueOf();
          if (nowTime - this.openTime! > 500) {
            this.handleMaskClick();
          }
        };
      } else {
        maskProps.onClick = this.handleMaskClick;
      }
      Object.assign(style, maskStyle);
      if (isEmbeddedContainer && offsetContainer) {
        style.position = 'absolute';
        style.height = pxToRem(offsetContainer.scrollHeight, true)!;
      }
    }
    if (this.active) {
      maskProps.hidden = false;
      if (maskHidden) {
        style.display = 'none';
      }
      maskProps.style = style;
      this.maskStyle = style;
    } else {
      maskProps.hidden = true;
      maskProps.style = this.maskStyle;
    }
    return (
      <>
        <Animate
          component=""
          transitionAppear
          transitionName={maskTransition ? 'fade' : undefined}
          hiddenProp="hidden"
          {...animationProps}
        >
          <Mask {...maskProps} />
        </Animate>
        {items}
        {getContainer === false && <span ref={this.saveMount} />}
      </>
    );
  }

  getContainer(): HTMLElement | undefined {
    const { getContainer: getModalContainer } = this.props;
    if (typeof getModalContainer === 'function') {
      return getModalContainer();
    }
    if (getModalContainer) {
      return getModalContainer;
    }
    return undefined;
  }

  getOffsetContainer(): HTMLElement | null {
    const { mount } = this.state;
    if (mount) {
      const { parentElement } = mount;
      if (parentElement) {
        return parentElement;
      }
    }
    const container = this.getContainer();
    if (container && container !== ModalManager.root) {
      return container;
    }
    // body maybe null ?
    return getDocument(window).body;
  }

  render() {
    const { getContainer: getModalContainer } = this.props;
    if (getModalContainer === false) {
      const { mount } = this.state;
      return this.getComponent(mount);
    }
    const mount = this.getContainer();
    if (mount) {
      return createPortal(this.getComponent(mount), mount);
    }
    return null;
  }
}

export async function getContainer(): Promise<IModalContainer> {
  const { length } = containerInstances;
  if (length) {
    return containerInstances.find(instance => {
      const container = instance.getOffsetContainer();
      return container ? container.tagName.toLowerCase() === 'body' : false;
    }) || containerInstances[0];
  }
  await new Promise(resolve => {
    render(<ModalContainer />, getRoot(), resolve);
  });
  return getContainer();
}

export function open(props: ModalProps): ModalProxy {
  const containerPromise = getContainer();

  async function getCurrentContainer(): Promise<IModalContainer> {
    const container = await containerPromise;
    return containerInstances.includes(container) ? container : getContainer();
  }

  async function close(destroy?: boolean) {
    const { onClose = noop } = props;
    if ((await onClose()) !== false) {
      const $container = await getCurrentContainer();
      if (destroy) {
        $container.close({ ...props, destroyOnClose: true });
      } else {
        $container.close(props);
      }
    }
  }

  async function update(newProps: ModalProps) {
    const $container = await getCurrentContainer();
    $container.update({ ...newProps, key: props.key });
  }

  props = {
    __deprecate__: true,
    close,
    update,
    ...Modal.defaultProps as ModalProps,
    ...props,
  };
  containerPromise.then(($container) => {
    const { autoCenter = $container.context.getConfig('modalAutoCenter') } = props;
    props = {
      ...props,
      autoCenter,
    };
    $container.open(props);
  });

  async function show(newProps?: ModalProps) {
    const $container = await getCurrentContainer();
    $container.open({ ...props, ...newProps });
  }

  return {
    close,
    open: show,
    update,
  };
}
