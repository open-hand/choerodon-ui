import React from 'react';
import { render, mount, shallow } from 'enzyme';
import { setup, teardown } from './mock';
import Upload from '..';
const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'http://upload.com',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
};
const setupByMount = () => {
  const wrapper = mount(<Upload {...props} />);
  return {
    wrapper,
    props,
  };
};

describe('Tree-pro', () => {
  beforeEach(() => {
    setup();
    jest.useFakeTimers();
  });

  afterEach(() => {
    teardown();
    jest.useRealTimers();
  });

  it('should have a Tooltip inside  ', () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('Tooltip').prop('title')).toBe('点击上传');
  });

  it('should have a Tooltip inside  ', () => {
    const props = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: '',
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: false,
    };
    const wrapper = mount(<Upload {...props} />);
    wrapper
      .find('.c7n-pro-btn-icon-only')
      .first()
      .simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});
