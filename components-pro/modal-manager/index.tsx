import { action, observable } from 'mobx';
import { ModalProps } from '../modal/Modal';

export type MousePosition = { x: number; y: number };

export type DrawerOffsets = { 'slide-up': number[], 'slide-right': number[], 'slide-down': number[], 'slide-left': number[] };

export interface IModalContainer {
  maskHidden: boolean;
  drawerOffsets: DrawerOffsets;

  clear(closeByLocationChange?: boolean);

  mergeModals(modals: ModalProps[]);
}

export type ModalManagerType = {
  containerInstances: IModalContainer[];
  addInstance: (instance: IModalContainer) => void;
  removeInstance: (instance: IModalContainer) => void;
  getKey: () => string;
  clear: (closeByLocationChange?: boolean) => void;
  mousePositionEventBound: WeakSet<Document>;
  mousePosition?: MousePosition;
  defaultBodyStyle?: { overflow; paddingRight };
  root?: HTMLDivElement;
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

const ModalManager: ModalManagerType = {
  addInstance,
  removeInstance,
  getKey,
  mousePositionEventBound: new WeakSet<Document>(),
  containerInstances,
  clear,
};

export default ModalManager;
