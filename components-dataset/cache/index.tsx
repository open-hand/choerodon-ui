import { AxiosPromise } from 'axios';
import { IReactionDisposer, reaction } from 'mobx';
import { getConfig } from '../configure';
import Yallist from './Yallist';
// 双向链表 -> 缓存更新性能优化

const MAX = Symbol('max'); // 最大值
const LENGTH = Symbol('length'); // 长度
const LENGTH_CALCULATOR = Symbol('lengthCalculator'); // 长度计算
const ALLOW_STALE = Symbol('allowStale'); // 允许过时
const MAX_AGE = Symbol('maxAge'); // 最大时效（缓存时长）
const DISPOSE = Symbol('dispose'); // 处置 处理
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet'); // 不可处理
const LIST = Symbol('list'); // 列表
const CACHE = Symbol('cache'); // 缓存
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet'); // 获取更新时效

const naiveLength = () => 1;

/**
 * 是否过时
 * @param self
 * @param hit
 */
function isStale(self, hit): boolean {
  if (!hit || (!hit.maxAge && !self[MAX_AGE])) return false;

  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
}

/**
 * 删除
 * @param self
 * @param node
 */
function del(self, node) {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);

    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LIST].removeNode(node);
  }
}

/**
 * 获取
 * @param self
 * @param key
 * @param doUse
 */
function get(self, key, doUse) {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE]) return undefined;
    } else if (doUse) {
      if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
      self[LIST].unshiftNode(node);
    }
    return hit.value;
  }
}

/**
 * 修整
 * @param self
 */
function trim(self) {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LIST].tail; self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
}

/**
 * 遍历步骤
 * @param self
 * @param fn
 * @param node
 * @param thisp
 */
function forEachStep(self, fn, node, thisp) {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE]) hit = undefined;
  }
  if (hit) fn.call(thisp, hit.value, hit.key, self);
}

/**
 * 构造 Entry 类
 */
class Entry<K, V> {
  key: K;

  value: V;

  length: number;

  now: number;

  maxAge: number;

  constructor(key: K, value: V, length: number, now: number, maxAge = 0) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge;
  }
}

/**
 * 声明缓存类型
 */
export type CacheOptions<K, V> = {
  max?: number;
  maxAge?: number;
  length?: (value: V, key: K) => number;
  stale?: boolean;
  dispose?: (key: K, value: V) => void;
  noDisposeOnSet?: boolean;
  updateAgeOnGet?: boolean;
};

/**
 * 导出 Cache 类
 */
export default class Cache<K, V> {
  constructor(options) {
    if (typeof options === 'number') options = { max: options };

    if (!options) options = {};

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number');
    this[MAX] = options.max || 0;

    const lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = typeof lc !== 'function' ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number');
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }

  // resize the cache when the max changes.
  set max(mL) {
    if (typeof mL !== 'number' || mL < 0) throw new TypeError('max must be a non-negative number');

    this[MAX] = mL || Infinity;
    trim(this);
  }

  get max() {
    return this[MAX];
  }

  set allowStale(allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }

  get allowStale() {
    return this[ALLOW_STALE];
  }

  set maxAge(mA) {
    if (typeof mA !== 'number') throw new TypeError('maxAge must be a non-negative number');

    this[MAX_AGE] = mA;
    trim(this);
  }

  get maxAge() {
    return this[MAX_AGE];
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator(lC) {
    if (typeof lC !== 'function') lC = naiveLength;

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }

  get lengthCalculator() {
    return this[LENGTH_CALCULATOR];
  }

  get length() {
    return this[LENGTH];
  }

  get itemCount() {
    return this[LIST].length;
  }

  rforEach(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LIST].tail; walker !== null;) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LIST].head; walker !== null;) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys(): K[] {
    return this[LIST].toArray().map(k => k.key);
  }

  values(): V[] {
    return this[LIST].toArray().map(k => k.value);
  }

  reset() {
    if (this[DISPOSE] && this[LIST] && this[LIST].length) {
      this[LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }

    this[CACHE] = new Map<K, V>(); // hash of items by key
    this[LIST] = new Yallist(); // list of items in order of use recency
    this[LENGTH] = 0; // length of items in the list
  }

  dump() {
    return this[LIST].map(hit =>
      isStale(this, hit)
        ? false
        : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0),
        },
    )
      .toArray()
      .filter(h => h);
  }

  dumpLru() {
    return this[LIST];
  }

  set(key: K, value: V, maxAge?: number) {
    maxAge = maxAge || this[MAX_AGE];

    if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false;
      }

      const node = this[CACHE].get(key);
      const item = node.value;

      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true;
    }

    const hit = new Entry<K, V>(key, value, len, now, maxAge);

    if (hit.length > this[MAX]) {
      if (this[DISPOSE]) this[DISPOSE](key, value);

      return false;
    }

    this[LENGTH] += hit.length;
    this[LIST].unshift(hit);
    this[CACHE].set(key, this[LIST].head);
    trim(this);
    return true;
  }

  has(key: K): boolean {
    if (!this[CACHE].has(key)) return false;
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit);
  }

  get(key: K): V {
    return get(this, key, true);
  }

  peek(key: K): V {
    return get(this, key, false);
  }

  pop(): V | null {
    const node = this[LIST].tail;
    if (!node) return null;

    del(this, node);
    return node.value;
  }

  del(key: K) {
    del(this, this[CACHE].get(key));
  }

  load(arr) {
    this.reset();

    const now = Date.now();
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
      // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune() {
    this[CACHE].forEach((_value, key) => get(this, key, false));
  }
}

export function refreshCacheOptions(cache: Cache<any, any>): IReactionDisposer {
  return reaction<CacheOptions<string, AxiosPromise>>(
    () => getConfig('lookupCache') || {},
    (lookupCache) => {
      if ('max' in lookupCache) {
        cache.max = lookupCache.max;
      }
      if ('maxAge' in lookupCache) {
        cache.maxAge = lookupCache.maxAge;
      }
      if ('stale' in lookupCache) {
        cache.allowStale = lookupCache.stale;
      }
      if ('length' in lookupCache) {
        cache.lengthCalculator = lookupCache.length;
      }
    },
  );
}
