import { MouseEvent } from 'react';
import { action, observable } from 'mobx';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { EventManager } from 'choerodon-ui/dataset';
import { getMousePosition, transformZoomData } from '../util';

export type MousePosition = { x: number; y: number; vw: number; vh: number };

export interface ModalContainerState {
  modals: ModalProps[];
  mount?: HTMLElement;
}

export type DrawerOffsets = { 'slide-up': number[]; 'slide-right': number[]; 'slide-down': number[]; 'slide-left': number[] };

export interface IModalContainer {
  context: ConfigContextValue;

  maskHidden: boolean;

  active: boolean;

  drawerOffsets: DrawerOffsets;

  clear(closeByLocationChange?: boolean);

  getContainer(): HTMLElement | undefined;

  getOffsetContainer(): HTMLElement | null;

  mergeModals(modals: ModalProps[]);

  state: ModalContainerState;

  open(props: ModalProps);

  close(props: ModalProps);

  update(props: ModalProps);

}

export type ModalManagerType = {
  containerInstances: IModalContainer[];
  addInstance: (instance: IModalContainer) => void;
  removeInstance: (instance: IModalContainer) => void;
  getKey: () => string;
  clear: (closeByLocationChange?: boolean) => void;
  registerMousePosition: () => void;
  mousePositionEventBound: WeakSet<Document>;
  mousePosition?: MousePosition;
  containerStyles: WeakMap<HTMLElement, { overflow: string, paddingRight: string, position: string }>
  root?: HTMLElement;
}

const KeyGen = (function* (id) {
  while (true) {
    yield `modal-${id}`;
    id += 1;
  }
})(1);

const containerInstances: IModalContainer[] = observable.array<IModalContainer>();

const removeInstance: (instance: IModalContainer) => void = action((instance: IModalContainer) => {
  const index = containerInstances.indexOf(instance);
  if (index > -1) {
    containerInstances.splice(index, 1);
  }
});

const addInstance: (instance: IModalContainer) => void = action((instance: IModalContainer) => {
  removeInstance(instance);
  containerInstances.unshift(instance);
});

function getKey(): string {
  return KeyGen.next().value;
}

function clear(closeByLocationChange) {
  containerInstances.forEach((instance) => {
    instance.clear(closeByLocationChange);
  });
}

const mousePositionEventBound = new WeakSet<Document>();

function registerMousePosition() {
  const doc = typeof window === 'undefined' ? undefined : document;
  if (doc && !mousePositionEventBound.has(doc)) {
    // 只有点击事件支持从鼠标位置动画展开
    new EventManager(doc).addEventListener(
      'click',
      (e: MouseEvent) => {
        ModalManager.mousePosition = getMousePosition(transformZoomData(e.clientX), transformZoomData(e.clientY), window);
        // 100ms 内发生过点击事件，则从点击位置动画展示
        // 否则直接 zoom 展示
        // 这样可以兼容非点击方式展开
        setTimeout(() => (delete ModalManager.mousePosition), 100);
      },
      true,
    );
    mousePositionEventBound.add(doc);
  }
}

const ModalManager: ModalManagerType = {
  addInstance,
  removeInstance,
  getKey,
  mousePositionEventBound,
  containerInstances,
  clear,
  containerStyles: new WeakMap(),
  registerMousePosition,
};

export default ModalManager;
