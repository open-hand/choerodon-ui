import React from 'react';
import ReactDOM from 'react-dom';
import collect from 'bisheng/collect';

export default collect(async (nextProps) => {
  const { pathname } = nextProps.location;
  const [, demoId, ...pageDataPath] = pathname.replace('-cn', '').split('/');
  const demosFetcher = nextProps.utils.get(nextProps.data, [...pageDataPath, 'demo']);
  if (demosFetcher) {
    const demos = await demosFetcher();
    const demo = demos[demoId];
    if (demo) {
      return { demo };
    }
  }
  throw 404; // eslint-disable-line no-throw-literal
})(({ demo }) => demo.preview(React, ReactDOM));
