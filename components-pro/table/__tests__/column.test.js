import React from 'react';
import { mount, render } from 'enzyme';
import mock from 'xhr-mock';
import Table from '..';
import { columnDSObj, aggregationDSObj, queryFieldDSObj } from './DataSetStore';
import { sleep } from './utils';
import { setup } from '../../../tests/utils';
import DataSet from '../../../components-dataset/data-set';
import Form from '../../form';
import Button from '../../button';

const { Column, FilterBar } = Table;

// 禁用Table中使用了useLayoutEffect, 在server端的警告
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.requireActual('react').useEffect,
}));

beforeEach(() => {
  setup();
});

afterEach(() => {
  mock.teardown();
});

describe("Table Column", () => {
  const columnDS = new DataSet(columnDSObj);
  const aggregationDS = new DataSet(aggregationDSObj);

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

  it("Columns test aggregation", async () => {
    await aggregationDS.ready();

    // Table-columns-aggregation-平铺模式下该值为true-校验不显示
    const wrapper = render(
      <Table
        dataSet={aggregationDS}
        aggregation={false}
      >
        <Column key="basic-group" header="基本组" align="left" aggregation>
          <Column key="name" name="name" />
          <Column key="age" name="age" />
        </Column>
      </Table>
    );
    expect(wrapper.find(".c7n-pro-table-cell-aggregation").length).toBe(0);

    // Table-columns-aggregation-该值为true-校验是聚合列
    const wrapper1 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation>
          <Column key="name" name="name" />
          <Column key="age" name="age" />
        </Column>
      </Table>
    );
    expect(wrapper1.find(".c7n-pro-table-cell-aggregation").length).toBeGreaterThan(0);

    // Table-columns-aggregation-该值为false-校验不是聚合列
    const wrapper2 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation={false}>
          <Column key="name" name="name" />
          <Column key="age" name="age" />
        </Column>
      </Table>
    );
    expect(wrapper2.find(".c7n-pro-table-cell-aggregation").length).toBe(0);
  });
  
  it("Columns test aggregationLimit", async () => {
    await aggregationDS.ready();

    // Table-columns-aggregationLimit-校验默认显示数目为4条
    const wrapper = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation>
          <Column key="userid" name="userid" />
          <Column key="name" name="name" />
          <Column key="age" name="age" />
          <Column key="startDate" name="startDate" />
          <Column key="endDate" name="endDate" />
        </Column>
      </Table>
    );
    expect(wrapper.find("button.c7n-pro-table-cell-expand-btn").length).toBeGreaterThan(0);
    const wrapper1 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation>
          <Column key="userid" name="userid" />
          <Column key="name" name="name" />
          <Column key="age" name="age" />
          <Column key="startDate" name="startDate" />
        </Column>
      </Table>
    );
    expect(wrapper1.find("button.c7n-pro-table-cell-expand-btn").length).toBe(0);

    // Table-columns-aggregationLimit-配置为3-条目数为5时-校验会有展开按钮来显示
    const wrapper2 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation aggregationLimit={3}>
          <Column key="userid" name="userid" />
          <Column key="name" name="name" />
          <Column key="age" name="age" />
          <Column key="startDate" name="startDate" />
          <Column key="endDate" name="endDate" />
        </Column>
      </Table>
    );
    expect(wrapper2.find("button.c7n-pro-table-cell-expand-btn").length).toBeGreaterThan(0);

    // Table-columns-aggregationLimit-配置为3-条目数为3时-校验不会有展开按钮来显示
    const wrapper3 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation aggregationLimit={3}>
          <Column key="userid" name="userid" />
          <Column key="name" name="name" />
          <Column key="age" name="age" />
        </Column>
      </Table>
    );
    expect(wrapper3.find("button.c7n-pro-table-cell-expand-btn").length).toBe(0);
  });

  it("Columns test aggregation expand", async () => {
    await aggregationDS.ready();

    // Table-columns-aggregationDefaultExpandedKeys-以string的形式指定默认展开的树节点
    // Table-columns-aggregationDefaultExpandedKeys-以number的形式指定默认展开的树节点
    const wrapper = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation aggregationDefaultExpandedKeys={['basic-subgroup-1']}>
          <Column header="基本组-分类1" key="basic-subgroup-1">
            <Column key="userid" name="userid" />
            <Column key="name" name="name" />
          </Column>
          <Column header="基本组-分类2" key="basic-subgroup-2">
            <Column key="age" name="age" />
            <Column key="startDate" name="startDate" />
            <Column key="endDate" name="endDate" />
          </Column>
        </Column>
      </Table>
    );
    expect(wrapper.find(".c7n-pro-table-cell-tree-node-content-wrapper-open")
      .first()
      .find(".c7n-pro-table-cell-tree-title")
      .text()
    ).toContain("基本组-分类1");
    expect(wrapper.find(".c7n-pro-table-cell-tree-node-content-wrapper-close")
      .first()
      .find(".c7n-pro-table-cell-tree-title")
      .text()
    ).toContain("基本组-分类2");

    // Table-columns-aggregationDefaultExpandAll-值为true-校验默认展开所有聚合列下的树节点
    const wrapper1 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation aggregationDefaultExpandAll>
          <Column header="基本组-分类1" key="basic-subgroup-1">
            <Column key="userid" name="userid" />
            <Column key="name" name="name" />
          </Column>
          <Column header="基本组-分类2" key="basic-subgroup-2">
            <Column key="age" name="age" />
            <Column key="startDate" name="startDate" />
            <Column key="endDate" name="endDate" />
          </Column>
        </Column>
      </Table>
    );
    expect(wrapper1.find(".c7n-pro-table-cell-tree-node-content-wrapper-close").length).toBe(0);

    // Table-columns-aggregationDefaultExpandAll-值为false-校验收起所有聚合列下的树节点
    const wrapper2 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column key="basic-group" header="基本组" align="left" aggregation aggregationDefaultExpandAll={false}>
          <Column header="基本组-分类1" key="basic-subgroup-1">
            <Column key="userid" name="userid" />
            <Column key="name" name="name" />
          </Column>
          <Column header="基本组-分类2" key="basic-subgroup-2">
            <Column key="age" name="age" />
            <Column key="startDate" name="startDate" />
            <Column key="endDate" name="endDate" />
          </Column>
        </Column>
      </Table>
    );
    expect(wrapper2.find(".c7n-pro-table-cell-tree-node-content-wrapper-open").length).toBe(0);

    // Table-columns-aggregationDefaultExpandAll-值为false-aggregationDefaultExpandedKeys传的有值-校验除了传值的树节点，其他树节点全部收起
    const wrapper3 = render(
      <Table
        dataSet={aggregationDS}
        aggregation
      >
        <Column
          key="basic-group"
          header="基本组"
          align="left"
          aggregation
          aggregationDefaultExpandAll={false}
          aggregationDefaultExpandedKeys={['basic-subgroup-1']}
        >
          <Column header="基本组-分类1" key="basic-subgroup-1">
            <Column key="userid" name="userid" />
            <Column key="name" name="name" />
          </Column>
          <Column header="基本组-分类2" key="basic-subgroup-2">
            <Column key="age" name="age" />
            <Column key="startDate" name="startDate" />
            <Column key="endDate" name="endDate" />
          </Column>
        </Column>
      </Table>
    );
    expect(wrapper3.find(".c7n-pro-table-cell-tree-node-content-wrapper-open")
      .first()
      .find(".c7n-pro-table-cell-tree-title")
      .text()
    ).toContain("基本组-分类1");
    expect(wrapper3.find(".c7n-pro-table-cell-tree-node-content-wrapper-close")
      .first()
      .find(".c7n-pro-table-cell-tree-title")
      .text()
    ).toContain("基本组-分类2");
  });
});

describe("Table query", () => {
  const queryFieldDS = new DataSet(queryFieldDSObj);

  // Table-queryFields-校验会根据queryDataSet中定义的fieId类型自动匹配组件
  it("queryFields render correct", async () => {
    await queryFieldDS.ready();

    const wrapper = render(
      <Table
        dataSet={queryFieldDS}
      >
        <Column name="age"/>
      </Table>
    );

    expect(wrapper.find(".c7n-pro-table-query-bar")
      .first()
      .find(".c7n-pro-input-number-wrapper")
      .length
    ).toBeGreaterThan(0);

    // Table-queryFieldsLimit-校验默认值为1
    // children: 查询字段、查询按钮、展开按钮
    expect(wrapper.find(".c7n-pro-table-query-bar").children()).toHaveLength(3);

    // Table-queryFieldsLimit-设置为3-共有5个头部查询字段-校验头部显示3个查询条件框-剩余的查询条件在弹出框中显示
    const wrapper1 = mount(
      <Table
        dataSet={queryFieldDS}
        queryFieldsLimit={3}
      >
        <Column name="age" />
      </Table>
    );
    expect(wrapper1.find(".c7n-pro-table-query-bar").children()).toHaveLength(5);

    wrapper1.find(".c7n-pro-table-query-bar").first().find("button.c7n-pro-btn-wrapper").last().simulate("click");
    await sleep(500);
    expect(document.getElementsByClassName("c7n-pro-modal-body").item(0).getElementsByTagName("tr").length).toEqual(2);
  });

  // Table-queryBar-校验可选值为钩子类型的查询条
  it('queryBar prop sets a custom value', async () => {
    await queryFieldDS.ready();

    const QueryBar = (props) => {
      const { queryFields, queryDataSet, queryFieldsLimit, dataSet, buttons, defaultShowMore = true } = props;
      const [showMore, setShowMore] = React.useState(defaultShowMore);
      const toggleShowMore = React.useCallback(() => setShowMore(!showMore), [showMore]);
      const handleQuery = React.useCallback(() => queryDataSet.query(), [queryDataSet]);
      const handleReset = React.useCallback(() => queryDataSet.reset(), [queryDataSet]);
      if (queryDataSet) {
        return (
          <>
            <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
              {showMore ? queryFields : queryFields.slice(0, queryFieldsLimit)}
              <div newLine>
                <Button
                  dataSet={null}
                  onClick={handleQuery}
                >
                  查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
                <Button onClick={toggleShowMore}>显示更多</Button>
                {buttons}
              </div>
            </Form>
            <FilterBar {...props} buttons={[]} />
          </>
        );
      }
      return null;
    };

    const wrapper = render(
      <Table
        dataSet={queryFieldDS}
        queryBar={props => <QueryBar {...props} />}
        queryBarProps={{ defaultShowMore: false }}
        queryFieldsLimit={3}
      >
        <Column name="age"/>
      </Table>
    );

    expect(wrapper.find('.c7n-pro-form-wrapper.c7n-pro-form')).not.toBeNull();
  });

  // Table-queryBar-filterBar-校验是无边框可动态配置筛选条，还可以为: professionalBar、advancedBar、normal、bar、comboBar、none
  it('queryBar prop sets enumeration values', async () => {
    await queryFieldDS.ready();

    const wrapper = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="filterBar"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper.find('.c7n-pro-table-dynamic-filter-bar')).not.toBeNull();

    const wrapper1 = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="professionalBar"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper1.find('.c7n-pro-table-professional-query-bar')).not.toBeNull();

    const wrapper2 = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="advancedBar"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper2.find('.c7n-pro-table-advanced-query-bar')).not.toBeNull();

    const wrapper3 = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="normal"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper3.find('.c7n-pro-table-query-bar')).not.toBeNull();

    const wrapper4 = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="bar"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper4.find('.c7n-pro-table-filter-select-wrapper')).not.toBeNull();

    const wrapper5 = render(
      <Table
        dataSet={queryFieldDS}
        queryBar="comboBar"
        queryBarProps={{ 
          title: '燕千云',
          fold: true,
          buttonArea: ()=>(
            <Button>默认按钮</Button>
          ),
          searchable: true,
        }}
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper5.find('.c7n-pro-table-combo-toolbar')).not.toBeNull();

    const wrapper6 = mount(
      <Table
        dataSet={queryFieldDS}
        queryBar="none"
      >
        <Column name="age"/>
      </Table>
    );
    expect(wrapper6.find('.c7n-pro-table-wrapper').render().children()).toHaveLength(3);
  });
});
