const OLD_NODE_ENV = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
const choerodon = require('..');

describe('choerodon-ui', () => {
  afterAll(() => {
    process.env.NODE_ENV = OLD_NODE_ENV;
  });
  it('exports modules correctly', () => {
    expect(Object.keys(choerodon)).toMatchSnapshot();
  });

  it('should hint when import all components', () => {
    expect(warnSpy).toHaveBeenCalledWith(
      'You are using a whole package of choerodon-ui, please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.'
    );
    warnSpy.mockRestore();
  });
});
