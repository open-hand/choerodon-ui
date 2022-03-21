import classNames from 'classnames';
import isPromise from 'is-promise';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import assignWith from 'lodash/assignWith';
import { global } from 'choerodon-ui/shared';
import { ChainsFunction } from 'choerodon-ui/shared/global';

if (!global.FUNCTION_CHAINS_MAP) {
  global.FUNCTION_CHAINS_MAP = new WeakMap<Function, ChainsFunction>();
}

const chainsMap: WeakMap<Function, ChainsFunction> = global.FUNCTION_CHAINS_MAP;

function merge<T>(prop: T | undefined, other: T | undefined): T | undefined {
  if (isNil(prop)) {
    return other;
  }
  if (isNil(other)) {
    return prop;
  }
  return {
    ...prop,
    ...other,
  };
}

function customizer(value: any, srcValue: any, key: string) {
  if (key === 'style' || key.endsWith('Style')) {
    return merge(value, srcValue);
  }
  if (key === 'className' || key.endsWith('ClassName')) {
    return classNames(value, srcValue);
  }
  if (key.endsWith('Props')) {
    return mergeProps(value, srcValue);
  }
  if (isFunction(value) && isFunction(srcValue)) {
    const chains = chainsMap.get(value);
    if (chains) {
      chains.fn = srcValue;
      return chains;
    }
    const newChains: Function = function (...args) {
      const $chains = chainsMap.get(value);
      const { fn } = $chains || {};
      if (fn) {
        const ret = fn(...args);
        if (isPromise(ret)) {
          return ret.then(result => {
            if (result !== false) {
              return value(...args);
            }
            return result;
          });
        }
        if (ret === false) {
          return false;
        }
      }
      return value(...args);
    };

    (newChains as ChainsFunction).fn = srcValue;
    chainsMap.set(value, newChains as ChainsFunction);
    return newChains;
  }
}

export default function mergeProps<P>(props: P | undefined, otherProps: P | undefined): P | undefined {
  if (isNil(props)) {
    return otherProps;
  }
  if (isNil(otherProps)) {
    return props;
  }
  return assignWith<P, P>(props, otherProps, customizer);
}
