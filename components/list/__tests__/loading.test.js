import React from 'react';
import { render } from 'enzyme';
import List from '..';
import Icon from '../../icon';

describe('List', () => {
  it('renders empty loading', () => {
    const loading = {
      spinning: true,
    };
    const wrapper = render(
      <List loading={loading} dataSource={[]} renderItem={() => <List.Item />} />,
    );
    expect(wrapper.find('.c7n-list-empty-text')).toHaveLength(0);
  });

  it('renders object loading', () => {
    const loading = {
      spinning: true,
    };
    const wrapper = render(
      <List loading={loading} dataSource={[1]} renderItem={() => <List.Item />} />,
    );
    expect(wrapper.find('.c7n-spin-spinning')).toHaveLength(1);
  });

  it('renders object loading with indicator', () => {
    const c7nIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

    const loading = {
      spinning: true,
      indicator: c7nIcon,
    };
    const wrapper = render(
      <List loading={loading} dataSource={[1]} renderItem={() => <List.Item />} />,
    );
    expect(wrapper.find('.icon-loading')).toHaveLength(1);
  });
});
