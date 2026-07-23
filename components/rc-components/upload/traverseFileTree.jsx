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
        const entries = [];
        const readAllEntries = () => {
          dirReader.readEntries((currentEntries) => {
            if (!currentEntries.length) {
              Promise.all(entries.map(entrieItem =>
                _traverseFileTree(entrieItem, `${path}${item.name}/`)
              )).then(resolve);
              return;
            }
            entries.push(...currentEntries);
            readAllEntries();
          });
        };
        readAllEntries();
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
