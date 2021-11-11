import { get, isObservableObject, remove, runInAction, set } from 'mobx';

export function mobxGet(obj: object, key: string): any {
  if (isObservableObject(obj)) {
    return get(obj, key);
  }
  return obj[key];
}

export function mobxSet(obj: object, key: string, value: any): void {
  if (isObservableObject(obj)) {
    runInAction(() => {
      set(obj, key, value);
    });
  } else {
    obj[key] = value;
  }
}

export function mobxRemove(obj: object, key: string): void {
  if (isObservableObject(obj)) {
    runInAction(() => {
      remove(obj, key);
    });
  } else {
    delete obj[key];
  }
}

export default {
  mobxGet,
  mobxSet,
  mobxRemove,
};
