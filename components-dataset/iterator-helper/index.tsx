export function iteratorSome<T>(iterator: IterableIterator<T>, callbackfn: (value: T, index: number) => boolean): boolean {
  let result;
  let index = 0;
  while (true) {
    result = iterator.next();
    if (result.done) {
      return false;
    }
    if (callbackfn(result.value, index)) {
      return true;
    }
    index += 1;
  }
}

export function iteratorEvery<T>(iterator: IterableIterator<T>, callbackfn: (value: T, index: number) => boolean): boolean {
  let result;
  let index = 0;
  while (true) {
    result = iterator.next();
    if (result.done) {
      return true;
    }
    if (!callbackfn(result.value, index)) {
      return false;
    }
    index += 1;
  }
}

export function iteratorFind<T>(iterator: IterableIterator<T>, callbackfn: (value: T, index: number) => unknown): T | undefined {
  let result;
  let index = 0;
  while (true) {
    result = iterator.next();
    if (result.done) {
      return undefined;
    }
    if (callbackfn(result.value, index)) {
      return result.value;
    }
    index += 1;
  }
}

export function iteratorFindIndex<T>(iterator: IterableIterator<T>, callbackfn: (value: T, index: number) => boolean): number {
  let result;
  let index = 0;
  while (true) {
    result = iterator.next();
    if (result.done) {
      return -1;
    }
    if (callbackfn(result.value, index)) {
      return index;
    }
    index += 1;
  }
}

export function iteratorFilterToArray<T>(iterator: IterableIterator<T>, callbackfn: (value: T, index: number) => unknown): T[] {
  let result;
  let index = 0;
  const ret: T[] = [];
  while (true) {
    result = iterator.next();
    if (result.done) {
      return ret;
    }
    if (callbackfn(result.value, index)) {
      ret.push(result.value);
    }
    index += 1;
  }
}

export function iteratorReduce<T, U>(iterator: IterableIterator<T>, callbackfn: (previousValue: U, value: T, index: number) => U, initialValue: U): U {
  let result;
  let index = 0;
  while (true) {
    result = iterator.next();
    if (result.done) {
      return initialValue;
    }
    initialValue = callbackfn(initialValue, result.value, index);
    index += 1;
  }
}

export function iteratorSliceToArray<T>(iterator: IterableIterator<T>, start = 0, end = Infinity): T[] {
  const ret: T[] = [];
  let index = 0;
  while (true) {
    const result = iterator.next();
    if (result.done || index > end) {
      return ret;
    }
    if (index >= start) {
      ret.push(result.value);
    }
    index++;
  }
}

export default {
  iteratorSome,
  iteratorEvery,
  iteratorFind,
  iteratorFindIndex,
  iteratorFilterToArray,
  iteratorReduce,
  iteratorSliceToArray,
};
