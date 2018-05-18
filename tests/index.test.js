import pkg from '../package.json';

const testDist = process.env.LIB_DIR === 'dist';

describe('choerodon-ui dist files', () => {
  // https://github.com/ant-design/ant-design/issues/1638
  // https://github.com/ant-design/ant-design/issues/1968
  it('exports modules correctly', () => {
    const choerodon = testDist ? require('../dist/choerodon-ui') : require('../components'); // eslint-disable-line global-require
    expect(Object.keys(choerodon)).toMatchSnapshot();
  });

  // https://github.com/ant-design/ant-design/issues/1970
  // https://github.com/ant-design/ant-design/issues/1804
  if (testDist) {
    it('should have choerodon-ui.version', () => {
      const choerodon = require('../dist/choerodon-ui'); // eslint-disable-line global-require
      expect(choerodon.version).toBe(pkg.version);
    });
  }
});
