import React from 'react';
import Modal from '..';

describe('modal triggers callbacks correctly', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    errorSpy.mockReset();
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  const _pro = className => {
    return document.body.querySelectorAll(className);
  };

  function open (args) {
    Modal.open({
      title: 'Modal Test',
      destroyOnClose: true,
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      ...args,
    });
  }

  it('should not render title when title not defined', () => {
    // first modal
    Modal.confirm({
      children: 'test descriptions',
    });
    expect(_pro('.c7n-pro-modal-footer')).toHaveLength(1);
    expect(document.querySelector('.c7n-pro-confirm-title')).toBe(null);
  });

  it('should allow Modal without onCancel been set', () => {
    // second modal
    const key = Modal.key();
    open({
      key,
    });
    _pro('.c7n-pro-modal-footer')[1]
      .querySelector('.c7n-pro-btn-default')
      .click();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should allow Modal.comfirm without onOk been set', () => {
    // third modal
    const key = Modal.key();
    open({
      key,
    });
    _pro('.c7n-pro-modal-footer')[2]
      .querySelector('.c7n-pro-btn-primary')
      .click();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('trigger onCancel once when click on cancel button', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    const key = Modal.key();
    // forth modal
    open({
      key,
      onCancel,
      onOk,
    });
    _pro('.c7n-pro-modal-footer')[3]
      .querySelector('.c7n-pro-btn-default')
      .click();
    expect(onCancel.mock.calls.length).toBe(1);
    expect(onOk.mock.calls.length).toBe(0);
  });

  it('trigger onOk once when click on ok button', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    const key = Modal.key();
    // fifth modal
    open({
      key,
      onCancel,
      onOk,
    });
    _pro('.c7n-pro-modal-footer')[4]
      .querySelector('.c7n-pro-btn-primary')
      .click();
    expect(onCancel.mock.calls.length).toBe(0);
    expect(onOk.mock.calls.length).toBe(1);
  });

  it('only ok when the okCancel false', () => {
    open({ okCancel: false });
    expect(_pro('.c7n-pro-modal-footer')[5].querySelectorAll('.c7n-pro-btn')).toHaveLength(1);
    expect(
      _pro('.c7n-pro-modal-footer')[5].querySelectorAll('.c7n-pro-btn')[0].innerHTML,
    ).toContain('确定');
  });

  it('should render info modal correctly ', () => {
    ['success', 'warning', 'error'].forEach(type => {
      Modal[type]({
        title: 'title',
        children: 'content',
      });
      expect(_pro(`.c7n-pro-confirm-${type}`)).toHaveLength(1);
    });
  });

  it('should has maskClassName when set maskClassName', () => {
    ['success', 'warning', 'error', 'open', 'confirm', 'info'].forEach(type => {
      const maskClassName = 'maskClassName'

      Modal[type]({
        title: 'title',
        children: 'content',
        maskClassName,
      });
      expect(_pro(`.c7n-pro-mask.c7n-pro-mask-wrapper.${maskClassName}`)).toHaveLength(1);
    });
  });

  it('should has maskStyle when set maskStyle', () => {
    ['success', 'warning', 'error', 'open', 'confirm', 'info'].forEach(type => {
      const maskStyle = {
        background: 'red',
      }

      Modal[type]({
        title: 'title',
        children: 'content',
        maskStyle,
      });
      expect(_pro(`.c7n-pro-mask.c7n-pro-mask-wrapper`)).toHaveLength(1);
      expect(_pro(`.c7n-pro-mask.c7n-pro-mask-wrapper`)[0].style.background).toBe('red');
    });
  });

  it('should not render mask when set mask to false', () => {
    ['success', 'warning', 'error', 'open', 'confirm', 'info'].forEach(type => {
      const mask = false
      Modal[type]({
        title: 'title',
        children: 'content',
        mask,
      });
      jest.runAllTimers();
      expect(_pro(`.c7n-pro-mask.c7n-pro-mask-wrapper`)).toHaveLength(0);
    });

  });

});
