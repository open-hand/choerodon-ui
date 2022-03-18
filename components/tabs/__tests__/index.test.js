import React from 'react';
import { mount, shallow, render } from 'enzyme';
import Tabs from '..';


const { TabPane } = Tabs;

const tabsList = [];
for (let i = 0; i < 5; i++) {
  tabsList.push({
    tab: `title ${i}`,
  })
}

class Comp extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  render() {
    const { width, height } = this.state;
    return (
      <div style={{ width, height }}>
        <Tabs showMore type='editable-card'>
          {tabsList.map(x => <TabPane key={x.tab} tab={x.tab} />)}
        </Tabs>
      </div>
    );
  }
}


describe('Tabs', () => {
  describe('editable-card', () => {
    let handleEdit;
    let wrapper;

    beforeEach(() => {
      handleEdit = jest.fn();
      wrapper = mount(
        <Tabs type="editable-card" onEdit={handleEdit}>
          <TabPane tab="foo" key="1">
            foo
          </TabPane>
        </Tabs>,
      );
    });

    it('add card', () => {
      wrapper
        .find('.c7n-tabs-nav-add')
        .simulate('click');
      expect(handleEdit.mock.calls[0][1]).toBe('add');
    });

    it('remove card', () => {
      wrapper.find('.icon-close').simulate('click');
      expect(handleEdit).toHaveBeenCalledWith('1', 'remove');
    });
  });

  describe('tabPosition', () => {
    it('remove card', () => {
      const wrapper = mount(
        <Tabs tabPosition="left" tabBarExtraContent="xxx">
          <TabPane tab="foo" key="1">
            foo
          </TabPane>
        </Tabs>,
      );
      expect(wrapper).toMatchSnapshot();
    });
  });

  it('second-level property should work', () => {
    const wrapper = mount(
      <Tabs type='second-level'>
        <TabPane tab='title 1' />
        <TabPane tab='title 2' />
        <TabPane tab='title 3' />
      </Tabs>,
    )
    expect(wrapper).toMatchSnapshot()
  });

  // it('showMore property should work', () => {
  //   const wrapper = mount(
  //     <div className='testDom' style={{width: 100,height: 20}} />,
  //   )

  //   expect(wrapper.find('testDom').props.style.height).toBe(20);
  //   // expect(wrapper.getDOMNode()).toHaveProperty('style');
  // });

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 120,
        height: 120,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }
    });
  });

  it('test dom viewPort', () => {
    const setState = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    const useStateMock = (initState) => [initState, setState];
    useStateSpy.mockImplementation(useStateMock);

    const wrapper = mount(
      <Tabs showMore type='editable-card'>
        {tabsList.map(x => <TabPane key={x.tab} tab={x.tab} />)}
      </Tabs>,
    );
    React.useState('150');
    
    expect(wrapper).toMatchSnapshot()
  })
});
