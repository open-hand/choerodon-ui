import React, { Component, CSSProperties, Key, MouseEvent } from 'react';
import { createPortal, render } from 'react-dom';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import findLast from 'lodash/findLast';
import noop from 'lodash/noop';
import EventManager from 'choerodon-ui/lib/_util/EventManager';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import ModalManager, { DrawerOffsets, IModalContainer } from '../modal-manager';
import Modal, { ModalProps } from '../modal/Modal';
import Animate from '../animate';
import Mask from './Mask';
import { stopEvent } from '../_util/EventManager';
import { suffixCls } from '../modal/utils';

const { containerInstances } = ModalManager;

function getArrayIndex(array, index) {
  if (array.length > index) {
    return array[index];
  }
  return 0;
}

function getRoot(): HTMLDivElement | undefined {
  let { root } = ModalManager;
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
      ModalManager.root = root;
    }
  }
  return root;
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

function hideBodyScrollBar(body: HTMLElement) {
  const { style } = body;
  if (!ModalManager.defaultBodyStyle) {
    ModalManager.defaultBodyStyle = {
      overflow: style.overflow,
      paddingRight: style.paddingRight,
    };
    style.overflow = 'hidden';
    if (hasScrollBar(body)) {
      style.paddingRight = pxToRem(measureScrollbar()) || '';
    }
  }
}

function showBodyScrollBar(body: HTMLElement) {
  const { style } = body;
  if (ModalManager.defaultBodyStyle) {
    const { overflow, paddingRight } = ModalManager.defaultBodyStyle;
    ModalManager.defaultBodyStyle = undefined;
    style.overflow = overflow;
    style.paddingRight = paddingRight;
  }
}

export interface ModalContainerProps {
  location?: { pathname: string };
  getContainer?: HTMLElement | (() => HTMLElement) | false;
}

export interface ModalContainerState {
  modals: ModalProps[];
  mount?: HTMLElement;
}

@observer
export default class ModalContainer extends Component<ModalContainerProps> implements IModalContainer {
  static displayName = 'ModalContainer';

  static defaultProps = {
    getContainer: getRoot,
  };

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

  @observable drawerOffsets: DrawerOffsets;

  @computed
  get baseOffsets() {
    const offsets = {
      'slide-up': 0, 'slide-right': 0, 'slide-down': 0, 'slide-left': 0,
    };
    containerInstances.some((instance) => {
      if (instance === this) {
        return true;
      }
      const { drawerOffsets, maskHidden } = instance;
      if (!maskHidden) {
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
      this.drawerOffsets = { 'slide-up': [], 'slide-right': [], 'slide-down': [], 'slide-left': [] };
      this.top();
      if (!ModalManager.mousePositionEventBound) {
        new EventManager(
          typeof window === 'undefined' ? undefined : document,
        ).addEventListener(
          'click',
          (e: MouseEvent<any>) => {
            ModalManager.mousePosition = {
              x: e.pageX,
              y: e.pageY,
            };
            // 100ms 内发生过点击事件，则从点击位置动画展示
            // 否则直接 zoom 展示
            // 这样可以兼容非点击方式展开
            setTimeout(() => (ModalManager.mousePosition = undefined), 100);
          },
          true,
        );
        ModalManager.mousePositionEventBound = true;
      }
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

  handleMaskClick = async () => {
    const { modals } = this.state;
    const modal = findLast(modals, ({ hidden }) => !hidden);
    if (modal) {
      const { close = noop, onCancel = noop, maskClosable = getConfig('modalMaskClosable') } = modal;
      if (maskClosable) {
        const ret = await onCancel();
        if (ret !== false) {
          close();
        }
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
      ModalManager.clear();
    }
  }

  componentWillUnmount() {
    const { modals } = this.state;
    ModalManager.removeInstance(this);
    const current = ModalManager.containerInstances[0];
    if (current && modals.length) {
      current.mergeModals(modals.reduce<ModalProps[]>((list, modal) => modal.__deprecate__ ? list.concat({
        ...modal,
        transitionAppear: false,
      }) : list, []));
    }
  }

  @action
  updateModals(modals: ModalProps[]) {
    this.top();
    let maskHidden = true;
    const drawerOffsets: DrawerOffsets = { 'slide-up': [], 'slide-right': [], 'slide-down': [], 'slide-left': [] };
    modals.slice().reverse().forEach(({ hidden, drawer, drawerOffset, drawerTransitionName }) => {
      if (!hidden) {
        maskHidden = false;
        if (drawer && drawerTransitionName) {
          const offsets = drawerOffsets[drawerTransitionName];
          const offset = offsets[0] || 0;
          offsets.unshift(offset + (drawerOffset || 0));
        }
      }
    });
    this.drawerOffsets = drawerOffsets;
    this.maskHidden = maskHidden; // modals.every(({ hidden }) => hidden);
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
    this.updateModals([...map.values()]);
  }

  findIndex(modalKey) {
    const { modals } = this.state;
    return modals.findIndex(({ key }) => key === modalKey);
  }

  open(props: ModalProps) {
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

  clear() {
    const { modals } = this.state;
    this.updateModals(modals.map(modal => ({ ...modal, destroyOnClose: true, hidden: true })));
  }

  getModalWidth(modal) {
    return (modal && modal.style && modal.style.width) || 520;
  }

  getComponent(mount?: HTMLElement) {
    const { maskHidden: hidden, isTop, drawerOffsets, baseOffsets } = this;
    const { modals } = this.state;
    const indexes = { 'slide-up': 1, 'slide-right': 1, 'slide-down': 1, 'slide-left': 1 };
    let activeModal: ModalProps | undefined;
    let maskTransition = true;
    const items = modals.map((props, index) => {
      const { drawerTransitionName = getConfig('drawerTransitionName'), drawer, key, transitionAppear = true } = props;
      const style: CSSProperties = {
        ...props.style,
      };
      if (drawer && drawerTransitionName) {
        const i = indexes[drawerTransitionName];
        indexes[drawerTransitionName] += 1;
        const offset = getArrayIndex(drawerOffsets[drawerTransitionName], i) + baseOffsets[drawerTransitionName];
        if (offset) {
          switch (drawerTransitionName) {
            case 'slide-up':
              style.marginTop = offset;
              break;
            case 'slide-down':
              style.marginBottom = offset;
              break;
            case 'slide-left':
              style.marginLeft = offset;
              break;
            default:
              style.marginRight = offset;
          }
        }
      }
      const active = isTop && index === modals.length - 1;
      if (active) {
        activeModal = props;
      }
      if (transitionAppear === false) {
        maskTransition = false;
      }
      return (
        <Animate
          key={key}
          component="div"
          // UED 用类名判断
          className={props.drawer ? `${getProPrefixCls(suffixCls)}-container-drawer` : `${getProPrefixCls(suffixCls)}-container-pristine`}
          transitionAppear={transitionAppear}
          transitionName={drawer ? drawerTransitionName : 'zoom'}
          hiddenProp="hidden"
          onEnd={this.handleAnimationEnd}
        >
          <Modal key={key} mousePosition={ModalManager.mousePosition} {...props} style={style} active={active} />
        </Animate>
      );
    });
    const animationProps: any = {};
    if (mount && mount.ownerDocument) {
      const { body } = mount.ownerDocument;
      if (containerInstances.every(instance => instance.maskHidden)) {
        animationProps.onEnd = () => showBodyScrollBar(body);
      } else {
        hideBodyScrollBar(body);
      }
    }
    const eventProps: any = {};
    if (activeModal && activeModal.mask) {
      const { maskClosable = getConfig('modalMaskClosable') } = activeModal;
      if (maskClosable === 'dblclick') {
        eventProps.onDoubleClick = this.handleMaskClick;
      } else {
        eventProps.onClick = this.handleMaskClick;
      }
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
          {
            activeModal && activeModal.mask ? (
              <Mask style={activeModal.maskStyle} className={activeModal.maskClassName} hidden={hidden} {...eventProps} onMouseDown={stopEvent} />
            ) : <div hidden={hidden} />
          }
        </Animate>
        {items}
        {!mount && <span ref={this.saveMount} />}
      </>
    );
  }

  getContainer() {
    const { getContainer: getModalContainer } = this.props;
    if (typeof getModalContainer === 'function') {
      return getModalContainer();
    }
    return getModalContainer;
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

export function getContainer(loop?: boolean) {
  const { length } = containerInstances;
  if (length) {
    return containerInstances[0];
  }
  if (loop !== true) {
    const root = getRoot();
    if (root) {
      render(<ModalContainer />, root);
    }
    return getContainer(true);
  }
}

export function open(props: ModalProps & { children? }) {
  const container = getContainer();

  function getCurrentContainer() {
    return containerInstances.includes(container) ? container : getContainer();
  }

  async function close(destroy?: boolean) {
    const { onClose = noop } = props;
    if ((await onClose()) !== false) {
      if (destroy) {
        getCurrentContainer().close({ ...props, destroyOnClose: true });
      } else {
        getCurrentContainer().close(props);
      }
    }
  }

  function update(newProps) {
    getCurrentContainer().update({ ...newProps, key: props.key });
  }

  props = {
    __deprecate__: true,
    close,
    update,
    ...Modal.defaultProps as ModalProps,
    ...props,
  };
  container.open(props);

  function show(newProps) {
    getCurrentContainer().open({ ...props, ...newProps });
  }

  return {
    close,
    open: show,
    update,
  };
}
