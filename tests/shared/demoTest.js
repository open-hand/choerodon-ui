import glob from 'glob';
import { render } from 'enzyme';
import MockDate from 'mockdate';
import moment from 'moment';

export default function demoTest(component, options = {}) {
  const regex = /-pro$/;
  const dirname =
    regex.test(component) > 0
      ? `./components-pro/${component.replace(/-pro/gi, '')}`
      : `./components/${component}`;
  const files = glob.sync(`${dirname}/demo/*.md`);
  files.forEach(file => {
    let testMethod = options.skip === true ? test.skip : test;
    if (Array.isArray(options.skip) && options.skip.some(c => file.includes(c))) {
      testMethod = test.skip;
    }
    testMethod(`renders ${file} correctly`, () => {
      MockDate.set(moment('2016-11-22'));
      const demo = require(`../.${file}`).default; // eslint-disable-line global-require, import/no-dynamic-require
      const wrapper = render(demo);
      expect(wrapper).toMatchSnapshot();
      MockDate.reset();
    });
  });
}
