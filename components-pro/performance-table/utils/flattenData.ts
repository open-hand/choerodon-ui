function flattenData(data: any[]) {
  const flattenItems = [];

  function loop(data, _parent) {
    if (!Array.isArray(data)) {
      return;
    }

    data.forEach(item => {
      item._parent = _parent;
      // @ts-ignore
      flattenItems.push({
        ...item,
      });
      if (item.children) {
        loop(item.children, item);
      }
    });
  }

  loop(data, null);
  return flattenItems;
}

export default flattenData;
