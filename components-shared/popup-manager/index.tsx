export type PopupManagerType = {
  container?: HTMLDivElement
  getKey: () => string;
}

/**
 * 记录ID生成器
 */
const PopupKeyGen: IterableIterator<string> = (function* (start: number) {
  while (true) {
    yield `popup-key-${start++}`;
  }
})(1);

function getKey(): string {
  return PopupKeyGen.next().value;
}


const PopupManager: PopupManagerType = {
  getKey,
};

export default PopupManager;
