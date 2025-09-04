const traverseFileTree = (files, callback, isAccepted) => {
  const dataTransfer = new DataTransfer();

  const _traverseFileTree = (item, path = '') => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          if (isAccepted(file)) {
            dataTransfer.items.add(file);
          }
          resolve();
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries((entries) => {
          // 遍历所有子项，等待全部完成
          Promise.all(entries.map(entrieItem =>
            _traverseFileTree(entrieItem, `${path}${item.name}/`)
          )).then(resolve);
        });
      } else {
        resolve();
      }
    });
  };

  Promise.all(
    Array.from(files).map(file => _traverseFileTree(file.webkitGetAsEntry()))
  ).then(() => {
    callback(dataTransfer.files);
  });
};

export default traverseFileTree;
