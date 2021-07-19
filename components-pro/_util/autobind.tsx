import createDefaultSetter from './createDefaultSetter';

let mapStore;

function bind(fn, context) {
  if (fn.bind) {
    return fn.bind(context);
  }
  return function __autobind__(...args) {
    return fn.apply(context, args);
  };
}

function getBoundSuper(obj, fn) {
  if (typeof WeakMap === 'undefined') {
    throw new Error(
      `Using @autobind on ${fn.name}() requires WeakMap support due to its use of super.${fn.name}()
      See https://github.com/jayphelps/core-decorators.js/issues/20`,
    );
  }

  if (!mapStore) {
    mapStore = new WeakMap();
  }

  if (mapStore.has(obj) === false) {
    mapStore.set(obj, new WeakMap());
  }

  const superStore = mapStore.get(obj);

  if (superStore.has(fn) === false) {
    superStore.set(fn, bind(fn, obj));
  }

  return superStore.get(fn);
}

/**
 * 绑定方法的this指向当前对象实例.
 *
 * @private
 * @param {Function} target 方法对象
 * @param {string} key 方法名.
 * @param {Object} descriptor 方法描述对象.
 * @returns {Object} 方法描述对象.
 */
export default function autobind(target, key, descriptor) {
  const { constructor } = target;
  const { value: fn, configurable, enumerable } = descriptor;
  return {
    configurable,
    enumerable,
    get() {
      // Class.prototype.key lookup
      // Someone accesses the property directly on the prototype on which it is
      // actually defined on, i.e. Class.prototype.hasOwnProperty(key)
      if (this === target) {
        return fn;
      }

      // Class.prototype.key lookup
      // Someone accesses the property directly on a prototype but it was found
      // up the chain, not defined directly on it
      // i.e. Class.prototype.hasOwnProperty(key) == false && key in Class.prototype
      if (
        this.constructor !== constructor &&
        Object.getPrototypeOf(this).constructor === constructor
      ) {
        return fn;
      }

      // Autobound method calling super.sameMethod() which is also autobound and so on.
      if (this.constructor !== constructor && key in this.constructor.prototype) {
        return getBoundSuper(this, fn);
      }

      const boundFn = bind(fn, this);
      Object.defineProperty(this, key, {
        configurable: true,
        writable: true,
        // NOT enumerable when it's a bound method
        enumerable: false,
        value: boundFn,
      });
      return boundFn;
    },
    set: createDefaultSetter(key),
  };
}
