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

describe('Table Column props', () => {

  let tableDataSet;
  beforeEach(() => {
    tableDataSet = new DataSet({
      primaryKey: 'id',
      data: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Brown',
          age: 32,
        },
        {
          id: '2',
          firstName: 'Jim',
          lastName: 'Green',
          age: 42,
        },
      ],
      fields: [{
        name: 'firstName',
        type: 'string',
        label: 'First Name',
      }, {
        name: 'lastName',
        type: 'string',
        label: 'Last Name',
      }, {
        name: 'age',
        type: 'number',
        label: 'Age',
      }]
    })
  });

  function createTable(tableProps, columnProps = {}) {
    return (
      <Table
        columns={[
          {
            name: "firstName",
            ...columnProps,
          },
        ]}
        dataSet={tableDataSet}
        selectionMode='none'
        {...tableProps}
      />
    );
  }

  it('title Column header text can be set for verification', () => {
    const wrapper = mount(createTable({}, { title: "列头文字" }));
    expect(wrapper.find('th .c7n-pro-table-cell-inner').text()).toEqual('列头文字')
  });

  it('header Set column header', () => {
    const wrapper = mount(createTable({}, { title: "列头文字" }));
    expect(wrapper.find('th .c7n-pro-table-cell-inner').text()).toEqual('列头文字')
  });

  it('header Set column headers in custom form', () => {
    const wrapper = mount(createTable({}, { header: () => <div style={{ color: 'red' }}>Header</div> }));

    expect(wrapper.render()).toMatchSnapshot();
    expect(wrapper.find('th .c7n-pro-table-cell-inner div').html()).toEqual('<div style="color: red;">Header</div>')
  });

  it('Verify that the priority of title is higher than that of header', () => {
    const wrapper = mount(createTable({}, { title: "title 优先级高", header: <div>header 优先级高</div> }));
    expect(wrapper.find('th .c7n-pro-table-cell-inner').text()).toEqual('title 优先级高')

    // header 函数形式渲染的时候，优先级高于 title
    const wrapper1 = mount(createTable({}, { title: "title 优先级高", header: () => <div>header 优先级高</div> }));
    expect(wrapper1.find('th .c7n-pro-table-cell-inner').text()).toEqual('header 优先级高')
  });

  it('footer Set column foot', () => {
    const wrapper = mount(createTable({}, { footer: "设置列脚" }));
    expect(wrapper.find('tfoot .c7n-pro-table-cell-inner').text()).toEqual('设置列脚')
  });

  it('footer Custom settings footer', () => {
    const wrapper = mount(createTable({}, { footer: () => <div style={{ color: 'red' }}>自定义设置列脚</div> }));
    expect(wrapper.find('tfoot .c7n-pro-table-cell-inner div').html()).toEqual('<div style="color: red;">自定义设置列脚</div>')
  });

  it('render Render cells directly', () => {
    const wrapper = mount(createTable({}, { renderer: () => "renderer cell" }));
    expect(wrapper.find('tbody .c7n-pro-table-cell-inner span').forEach((node) => {
      expect(node.html()).toEqual("renderer cell");
    }))
  });

  it('render Custom rendering by taking data', () => {
    const wrapper = mount(createTable({}, { renderer: ({ value }) => <span style={{ color: "red" }}>{value}</span> }));
   
    expect(wrapper.find('tbody .c7n-pro-table-cell-inner span').forEach((node) => {
      const nodeValue = node.text();
      expect(node.html()).toEqual(`<span style="color: red;">${nodeValue}</span>`);
    }))
  });

  it('editor If set to true, the verification can be edited', () => {
    const wrapper = mount(createTable({}, { editor: true}));
    expect(wrapper.find('tbody .c7n-pro-table-cell-inner-editable').length).toEqual(tableDataSet.totalCount);
  });

  it('editor If set to false, the verification cannot be edited', () => {
    const wrapper = mount(createTable({}, { editor: false}));
    expect(wrapper.find('tbody .c7n-pro-table-cell-inner-editable').length).toEqual(0);
  });

  it('style configuration can be made for column cells and takes effect', () => {
    const wrapper = mount(createTable({}, { title: "姓名", style: {color: 'red'}}));
    // 正确渲染
    expect(wrapper.render()).toMatchSnapshot();
    const comps = wrapper.find('tbody td.c7n-pro-table-cell');
    expect(comps.length).toBeTruthy()
    expect(comps.forEach(node => {
      expect(node.prop('style')).toHaveProperty("color", "red");
    }))
  });

  it('className You can set the column cell style name', () => {
    const wrapper = mount(createTable({}, { title: "姓名", className: 'customClass'}));
    const comps = wrapper.find('tbody td').filterWhere((n) => n.prop('data-index') === 'firstName');
    expect(comps.length).toBeTruthy();
    expect(comps.forEach(node => {
      expect(node.hasClass('customClass')).toBeTruthy();
    }))
  });

  it('headerStyle The column header can be configured with the inner chain style and takes effect', () => {
    const wrapper = mount(createTable({}, { title: "姓名", headerStyle: { color: 'red' }}));
    const comps = wrapper.find('thead th').filterWhere((n) => n.prop('data-index') === 'firstName')
    expect(comps.length).toBeTruthy();
    expect(comps.forEach(node => {
      expect(node.prop('style')).toHaveProperty("color", "red");
    }))
  });

  it('headerClassName You can set the column header style name', () => {
    const wrapper = mount(createTable({}, { title: "姓名", headerClassName: "customHeaderClass"}));
    const comps = wrapper.find('thead th').filterWhere((n) => n.prop('data-index') === 'firstName');
    expect(comps.length).toBeTruthy();
    expect(comps.forEach(node => {
      expect(node.hasClass('customHeaderClass')).toBeTruthy();
    }))
  });

  it('footerStyle Internal chain style configuration can be carried out for column feet and takes effect', () => {
    const wrapper = mount(createTable({}, { title: "姓名", footer: "Footer", footerStyle: { color: 'red' }}));
    const comps = wrapper.find('tfoot th').filterWhere((n) => n.text() === "Footer");
    expect(comps.length).toBeTruthy();
    expect(comps.forEach(node => {
      expect(node.prop('style')).toHaveProperty("color", "red");
    }))
  });

  it('footerClassName You can set the column footer style name', () => {
    const wrapper = mount(createTable({}, { title: "姓名", footer: "Footer", footerClassName: "customFooterClass"}));
    const comps = wrapper.find('tfoot th').filterWhere((n) => n.text() === "Footer");
    expect(comps.length).toBeTruthy();
    expect(comps.forEach(node => {
      expect(node.hasClass('customFooterClass')).toBeTruthy();
    }));
  });

  it('help You can give an information prompt to the column header field', () => {
    const wrapper = mount(createTable({}, { title: "姓名", help: '提示信息'}));
    // 元素正确渲染
    expect(wrapper.render()).toMatchSnapshot();
    const comps = wrapper.find('thead th').filterWhere((n) => n.prop('data-index') === 'firstName');
    expect(comps.length).toBeTruthy();
    expect(comps.find('span.c7n-pro-table-help-icon')).toHaveLength(1);
  });

  it('showHelp The default display mode of verification is tooltip', () => {
    // tooltip has delay
    jest.useFakeTimers();
    const wrapper = mount(createTable({}, { title: "姓名", help: '提示信息'}));
    wrapper.find('.c7n-pro-table-help-icon').simulate('mouseenter');
    jest.runAllTimers();
    wrapper.update()
    const popupComps = document.body.querySelectorAll('.c7n-pro-popup');
    // 默认情况下存在 popup
    expect(popupComps.length).toBeTruthy();
  });

  it('showHelp tooltip The verification prompt is displayed in the form of tooltip', () => {
    // tooltip has delay
    jest.useFakeTimers();
    const wrapper = mount(createTable({}, { title: "姓名", help: '提示信息', showHelp: 'tooltip'}));
    wrapper.find('.c7n-pro-table-help-icon').simulate('mouseenter');
    jest.runAllTimers();
    wrapper.update()
    const popupComps = document.body.querySelectorAll('.c7n-pro-popup');
    // 即存在 popup
    expect(popupComps.length).toBeTruthy();
  });
});
