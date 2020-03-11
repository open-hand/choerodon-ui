import React from 'react';
import { mount } from 'enzyme';
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

  it('should have a Tooltip inside', () => {
    const props1 = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: 'http://upload.com/',
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: false,
    };
    const wrapper = mount(<Upload {...props1} />);
    wrapper
      .find('.c7n-pro-btn-icon-only')
      .first()
      .simulate('click');
    expect(wrapper).toMatchSnapshot();
  });

  it('uplaod the file to the server', () => {
    const fileChange = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'details');
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain',
    });
    const props1 = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: 'http://upload.com/',
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: true,
      onFileChange: fileChange,
    };
    const wrapper = mount(<Upload {...props1} />);
    wrapper.find('input').simulate('change', {
      target: {
        files: [file],
      },
    });
    expect(fileChange).toHaveBeenCalled();
  });

  it('return when targetItem is null', () => {
    const fileList = [{ uid: 'file' }];
    const wrapper = mount(
      <Upload type="drag" fileList={fileList}>
        <button type="button">upload</button>
      </Upload>,
    ).instance();
    expect(wrapper.handleSuccess('', '', { uid: 'fileItem' })).toBe(undefined);
    expect(wrapper.handleProgress('', { uid: 'fileItem' })).toBe(undefined);
    expect(wrapper.handleError('', '', '', { uid: 'fileItem' })).toBe(undefined);
  });
});
