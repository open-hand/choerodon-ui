import React from 'react';
import { mount } from 'enzyme';
import mock from 'xhr-mock';
import Table from '..';
import { columnDSObj } from './DataSetStore';
import { setup } from '../../../tests/utils';
import DataSet from '../../../components-dataset/data-set';

const { Column } = Table;

beforeEach(() => {
  setup();
});

afterEach(() => {
  mock.teardown();
});

describe("Table Column", () => {
  const columnDS = new DataSet(columnDSObj);

  it("Columns render correctly and width correctly", async () => {
    await columnDS.ready();

    const wrapper = mount(
      <Table
        dataSet={columnDS}
      >
        <Column key='1-0' name="name" editor width={100} />
        <Column key='2-0' header="组合">
          <Column key='2-1' name="name" editor width={150} />
          <Column key='2-2' name="age" editor width={100} />
        </Column>
        <Column key='3-0' header="组合3">
          <Column key='3-1' header="组合2">
            <Column key='3-1-1' name="sex" editor />
            <Column key='3-1-2' name="date.startDate" editor />
          </Column>
          <Column key='3-2' name="sexMultiple" editor />
        </Column>
      </Table>
    );
    expect(wrapper.find('col.c7n-pro-table-col').at(1).getDOMNode().getAttribute('style')).toContain('width: 1rem;');
    expect(wrapper.find('col.c7n-pro-table-col').at(2).getDOMNode().getAttribute('style')).toContain('width: 1.5rem;');
    expect(wrapper.find('col.c7n-pro-table-col').at(3).getDOMNode().getAttribute('style')).toContain('width: 1rem;');
    expect(wrapper.render()).toMatchSnapshot();
  });

  it("Columns test defaultWidth and minWidth", async () => {
    // 模拟不了横向滚动条，所以暂时测试不了 defaultWidth
    await columnDS.ready();

    const wrapper = mount(
      <Table
        dataSet={columnDS}
        style={{ width: '2rem' }}
      >
        <Column key='1-0' name="name" editor />
        <Column key='2-0' name="sex" editor defaultWidth={200} minWidth={80} />
        <Column key='3-0' header="组合">
          <Column key='3-1' name="name" editor />
          <Column key='3-2' name="age" editor />
        </Column>
      </Table>
    );
    expect(wrapper.find('col.c7n-pro-table-col').at(1).getDOMNode().getAttribute('style')).toContain('min-width: 0.5rem;');
    expect(wrapper.find('col.c7n-pro-table-col').at(2).getDOMNode().getAttribute('style')).toContain('min-width: 0.8rem;');

    // aggregation mode
    const wrapper1 = mount(
      <Table
        dataSet={columnDS}
        style={{ width: '3rem' }}
        aggregation={true}
      >
        <Column key='1-0' name="name" editor />
        <Column key='2-0' header="组合" aggregation={true} defaultWidth={200} minWidth={80}>
          <Column key='2-1' name="name" editor />
          <Column key='2-2' name="age" editor />
        </Column>
        <Column key='3-0' header="组合3" aggregation={true}>
          <Column key='3-1' header="组合2">
            <Column key='3-1-1' name="sex" editor />
            <Column key='3-1-2' name="date.startDate" editor />
          </Column>
          <Column key='3-2' name="sexMultiple" editor />
        </Column>
      </Table>
    );
    expect(wrapper1.find('col.c7n-pro-table-col').at(2).getDOMNode().getAttribute('style')).toContain('min-width: 0.8rem;');
    expect(wrapper1.find('col.c7n-pro-table-col').at(3).getDOMNode().getAttribute('style')).toContain('min-width: 0.5rem;');
  });
});
