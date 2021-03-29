---
order: 4
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import React, { useCallback, useMemo, cloneElement, createContext, useContext } from 'react';
import {
  PerformanceTable,
  Button,
  CheckBox,
  DataSet,
  Output,
  Pagination,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getEditorByField } from 'choerodon-ui/pro/lib/table/utils';
import '../../../components-pro/performance-table/style/index.less';

const Store = createContext();

export const StoreProvider = props => {
  const { children } = props;

  const userDs = useMemo(() => new DataSet({
    primaryKey: 'userid',
    name: 'large-user',
    autoQuery: true,
    pageSize: 10,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
        unique: true, // 唯一索引或联合唯一索引组名 设置可编辑只有新增才能编辑,确保该字段或字段组唯一性
        help: '主键，区分用户',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        unique: 'uniqueGroup',
        max: 100,
        step: 1,
        help: '用户年龄，可以排序',
      },
      {
        name: 'numberMultiple',
        type: 'number',
        label: '数值多值',
        multiple: true,
        min: 10,
        max: 100,
        step: 0.5,
      },
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        label: '代码描述',
      },
      {
        name: 'code.v',
        type: 'number',
      },
      {
        name: 'code.d.v',
        type: 'number',
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        required: true,
      },
      {
        name: 'code_description',
        type: 'string',
        label: '代码描述',
      },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        required: true,
      },
      {
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'codeMultiple_code',
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      {
        name: 'accountMultiple',
        type: 'string',
        bind: 'account.multiple',
        label: '多值拼接',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      { name: 'account', type: 'object', ignore: 'always' },
      {
        name: 'enable',
        type: 'boolean',
        label: '是否开启',
        unique: 'uniqueGroup',
      },
      {
        name: 'frozen',
        type: 'boolean',
        label: '是否冻结',
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
      { name: 'date.endDate', type: 'time', range: true, label: '结束日期' },
    ],
  }), []);

  const value = {
    ...props,
    userDs,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};

const CheckCell = observer(({ rowIndex }) => {
  const { userDs } = useContext(Store);
  const currentRecord = userDs.get(rowIndex);

  const handleChange = useCallback(value => {
    if (value) {
      userDs.select(currentRecord);
    } else {
      userDs.unSelect(currentRecord);
    }
  }, [currentRecord]);

  return (
    <CheckBox
      key={rowIndex}
      value={currentRecord.get('userid')}
      checked={userDs.selected.some(select => select.get('userid') === currentRecord.get('userid'))}
      onChange={(value) => handleChange(value, rowIndex)}
    />
  );
});

const CheckHeaderCell = observer(() => {
  const { userDs } = useContext(Store);

  const handleCheckAllChange = useCallback(value => {
    if (value) {
      userDs.selectAll();
    } else {
      userDs.unSelectAll();
    }
  }, []);

  return (
    <CheckBox
      key='headerCell'
      checked={userDs.length > 0 && userDs.selected.length === userDs.length}
      indeterminate={userDs.selected.length !== userDs.length && Boolean(userDs.selected.length)}
      onChange={handleCheckAllChange}
    />
  );
});

/**
 * 单元格渲染器
 * @param rowData 数据
 * @param rowIndex 数据索引
 * @param dataIndex 字段索引
 * @param props 编辑器扩展属性
 * @param editor 自定义编辑器
 * @param editable 是否可编辑
 * @returns {*}
 * @constructor
 */
const RenderCell = observer(({ rowIndex, dataIndex, editor, editable = true, ...props }) => {
  const { userDs } = useContext(Store);

  if (userDs.length) {
    const currentRecord = userDs.get(rowIndex);
    const currentField = currentRecord.getField(dataIndex);
    const style = { width: '100%' };
    const cellProps = {
      style,
      key: `${currentRecord.index}-${dataIndex}`,
      record: currentRecord,
      name: dataIndex,
      ...props,
    };
    if (editable) {
      const newEditor = editor || getEditorByField(currentField);
      return cloneElement(newEditor, cellProps);
    }
    return <Output {...cellProps} />;
  }
  return null;
});

const LargeListsTable = observer(() => {
  const tableRef = React.createRef();

  const { userDs } = useContext(Store);

  const columns = useMemo(() => [
    {
      title: <CheckHeaderCell />,
      dataIndex: 'userid',
      key: 'select_box',
      width: 80,
      align: 'center',
      fixed: true,
      render: (props) => <CheckCell {...props} />,
    },
    {
      title: '编号',
      dataIndex: 'userid',
      key: 'userid',
      width: 70,
      fixed: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (props) => <RenderCell {...props} />,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 150,
      render: (props) => <RenderCell {...props} renderer={({ text }) => `${text}岁`} />,
    },
    {
      title: '性别',
      dataIndex: 'sex',
      key: 'sex',
      width: 100,
      render: (props) => <RenderCell {...props} />,
    },
    {
      title: '代码描述',
      dataIndex: 'code',
      key: 'code',
      width: 300,
      render: (props) => <RenderCell {...props} />,
    },
    {
      title: '代码',
      dataIndex: 'code_code',
      key: 'code_code',
      width: 300,
      render: (props) => <RenderCell {...props} />,
    },
    {
      title: '代码描述(下拉)',
      dataIndex: 'code_select',
      key: 'code_select',
      width: 300,
      render: (props) => <RenderCell {...props} />,
    },
  ], []);

  const dataSource = useMemo(() => userDs.toData(), [userDs.length]);

  return (
    <div>
      <PerformanceTable
        // virtualized
        columns={columns}
        height={400}
        rowHeight={33}
        data={dataSource}
        ref={tableRef}
        loading={userDs.status !== 'ready'}
      />
      <Pagination pageSizeOptions={['20', '50', '100', '200', '500']} dataSet={userDs} />
      <br />
      <Button
        onClick={() => {
          tableRef.current.scrollTop(0);
        }}
      >
        Scroll top
      </Button>
    </div>
  );
});


const App = props => (
  <StoreProvider {...props}>
    <LargeListsTable />
  </StoreProvider>
);

ReactDOM.render(<App />, mountNode);

````
