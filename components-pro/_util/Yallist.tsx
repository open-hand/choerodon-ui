class Node {
  list: Yallist | null;

  value: any;

  prev: Node | null;

  next: Node | null;

  constructor(value: any, prev: Node | null, next: Node | null, list: Yallist) {
    if (!(this instanceof Node)) {
      return new Node(value, prev, next, list);
    }

    this.list = list;
    this.value = value;

    if (prev) {
      prev.next = this;
      this.prev = prev;
    } else {
      this.prev = null;
    }

    if (next) {
      next.prev = this;
      this.next = next;
    } else {
      this.next = null;
    }
  }
}

function insert(self, node, value) {
  const inserted =
    node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;

  return inserted;
}

function push(self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}

function unshift(self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}

export default class Yallist {
  static Node = Node;

  static create = Yallist;

  tail: Node | null;

  head: Node | null;

  length: number;

  constructor(...args) {
    if (!(this instanceof Yallist)) {
      return new Yallist(...args);
    }

    this.tail = null;
    this.head = null;
    this.length = 0;
    const list = args[0];
    if (list && typeof list.forEach === 'function') {
      list.forEach(function(item) {
        this.push(item);
      });
    } else if (args.length > 0) {
      this.push(...args);
    }
  }

  removeNode(node: Node) {
    if (node.list !== this) {
      throw new Error('removing node which does not belong to this list');
    }

    const { next, prev } = node;

    if (next) {
      next.prev = prev;
    }

    if (prev) {
      prev.next = next;
    }

    if (node === this.head) {
      this.head = next;
    }
    if (node === this.tail) {
      this.tail = prev;
    }

    node.list.length--;
    node.next = null;
    node.prev = null;
    node.list = null;

    return next;
  }

  unshiftNode(node: Node) {
    if (node === this.head) {
      return;
    }

    if (node.list) {
      node.list.removeNode(node);
    }

    const { head } = this;
    node.list = this;
    node.next = head;
    if (head) {
      head.prev = node;
    }

    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.length++;
  }

  pushNode(node: Node) {
    if (node === this.tail) {
      return;
    }

    if (node.list) {
      node.list.removeNode(node);
    }

    const { tail } = this;
    node.list = this;
    node.prev = tail;
    if (tail) {
      tail.next = node;
    }

    this.tail = node;
    if (!this.head) {
      this.head = node;
    }
    this.length++;
  }

  push(...args) {
    args.forEach(item => push(this, item));
    return this.length;
  }

  unshift(...args) {
    args.forEach(item => unshift(this, item));
    return this.length;
  }

  pop() {
    if (!this.tail) {
      return undefined;
    }

    const { value } = this.tail;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return value;
  }

  shift() {
    if (!this.head) {
      return undefined;
    }

    const { value } = this.head;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  forEach(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this.head, i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.next;
    }
  }

  forEachReverse(fn, thisp) {
    thisp = thisp || this;
    for (let walker = this.tail, i = this.length - 1; walker !== null; i--) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.prev;
    }
  }

  get(n) {
    let i = 0;
    let walker = this.head;
    for (; walker !== null && i < n; i++) {
      walker = walker.next;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  }

  getReverse(n) {
    let i = 0;
    let walker = this.tail;
    for (; walker !== null && i < n; i++) {
      // abort out of the list early if we hit a cycle
      walker = walker.prev;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  }

  map(fn, thisp) {
    thisp = thisp || this;
    const res = new Yallist();
    for (let walker = this.head; walker !== null; ) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.next;
    }
    return res;
  }

  mapReverse(fn, thisp) {
    thisp = thisp || this;
    const res = new Yallist();
    for (let walker = this.tail; walker !== null; ) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.prev;
    }
    return res;
  }

  reduce(...args) {
    const fn = args[0];
    let acc;
    let walker = this.head;
    if (args.length > 1) {
      acc = args[1];
    } else if (this.head) {
      walker = this.head.next;
      acc = this.head.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    for (let i = 0; walker !== null; i++) {
      acc = fn(acc, walker.value, i);
      walker = walker.next;
    }

    return acc;
  }

  reduceReverse(...args) {
    const fn = args[0];
    let acc;
    let walker = this.tail;
    if (args.length > 1) {
      acc = args[1];
    } else if (this.tail) {
      walker = this.tail.prev;
      acc = this.tail.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    for (let i = this.length - 1; walker !== null; i--) {
      acc = fn(acc, walker.value, i);
      walker = walker.prev;
    }

    return acc;
  }

  toArray() {
    const arr = new Array(this.length);
    for (let i = 0, walker = this.head; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.next;
    }
    return arr;
  }

  toArrayReverse() {
    const arr = new Array(this.length);
    for (let i = 0, walker = this.tail; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.prev;
    }
    return arr;
  }

  slice(from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    const ret = new Yallist();
    if (to < from || to < 0) {
      return ret;
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    let i = 0;
    let walker = this.head;
    for (; walker !== null && i < from; i++) {
      walker = walker.next;
    }
    for (; walker !== null && i < to; i++, walker = walker.next) {
      ret.push(walker.value);
    }
    return ret;
  }

  sliceReverse(from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    const ret = new Yallist();
    if (to < from || to < 0) {
      return ret;
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    let i = this.length;
    let walker = this.tail;
    for (; walker !== null && i > to; i--) {
      walker = walker.prev;
    }
    for (; walker !== null && i > from; i--, walker = walker.prev) {
      ret.push(walker.value);
    }
    return ret;
  }

  splice(start, deleteCount, ...nodes) {
    if (start > this.length) {
      start = this.length - 1;
    }
    if (start < 0) {
      start = this.length + start;
    }
    let walker = this.head;
    for (let i = 0; walker !== null && i < start; i++) {
      walker = walker.next;
    }

    const ret: any[] = [];
    for (let i = 0; walker && i < deleteCount; i++) {
      ret.push(walker.value);
      walker = this.removeNode(walker);
    }
    if (walker === null) {
      walker = this.tail;
    }

    if (walker !== this.head && walker !== this.tail && walker !== null) {
      walker = walker.prev;
    }
    nodes.forEach(item => {
      walker = insert(this, walker, item);
    });
    return ret;
  }

  reverse() {
    const { head, tail } = this;
    for (let walker = head; walker !== null; walker = walker.prev) {
      const { prev } = walker;
      walker.prev = walker.next;
      walker.next = prev;
    }
    this.head = tail;
    this.tail = head;
    return this;
  }
}

try {
  Yallist.prototype[Symbol.iterator] = function*() {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value;
    }
  };
  // eslint-disable-next-line no-empty
} catch (er) {}
