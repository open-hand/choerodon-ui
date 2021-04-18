import React, {
  useCallback,
  useMemo,
  cloneElement,
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
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

const Store = createContext();

export const StoreProvider = (props) => {
  const { children } = props;

  const userDs = useMemo(
    () =>
      new DataSet({
        primaryKey: 'userid',
        name: 'large-user',
        queryUrl:
          'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/mock-user',
        dataKey: 'rows',
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
            lovCode: 'TODO.USER',
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
            lovCode: 'TODO.USER',
            required: true,
          },
          {
            name: 'codeMultiple',
            type: 'object',
            label: '代码描述（多值）',
            lovCode: 'TODO.USER',
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
            lookupAxiosConfig: () => {
              return {
                url:
                  'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/EMPLOYEE_GENDER',
                method: 'post',
              };
            },
            required: true,
          },
          {
            name: 'sexMultiple',
            type: 'string',
            label: '性别（多值）',
            lookupAxiosConfig: () => {
              return {
                url:
                  'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/EMPLOYEE_GENDER',
                method: 'post',
              };
            },
            multiple: true,
          },
          {
            name: 'accountMultiple',
            type: 'string',
            bind: 'account.multiple',
            label: '多值拼接',
            lookupAxiosConfig: () => {
              return {
                url:
                  'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/EMPLOYEE_GENDER',
                method: 'post',
              };
            },
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
          {
            name: 'date.endDate',
            type: 'time',
            range: true,
            label: '结束日期',
          },
        ],
      }),
    [],
  );

  const value = {
    ...props,
    userDs,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};

const CheckCell = observer(({ rowIndex }) => {
  const { userDs } = useContext(Store);
  const currentRecord = userDs.get(rowIndex);

  const handleChange = useCallback(
    (value) => {
      if (value) {
        userDs.select(currentRecord);
      } else {
        userDs.unSelect(currentRecord);
      }
    },
    [currentRecord],
  );

  return (
    <CheckBox
      key={rowIndex}
      value={currentRecord.get('userid')}
      checked={userDs.selected.some(
        (select) => select.get('userid') === currentRecord.get('userid'),
      )}
      onChange={(value) => handleChange(value)}
    />
  );
});

const CheckHeaderCell = observer(() => {
  const { userDs } = useContext(Store);

  const handleCheckAllChange = useCallback((value) => {
    if (value) {
      userDs.selectAll();
    } else {
      userDs.unSelectAll();
    }
  }, []);

  return (
    <CheckBox
      key="headerCell"
      checked={userDs.length > 0 && userDs.selected.length === userDs.length}
      indeterminate={
        userDs.selected.length !== userDs.length &&
        Boolean(userDs.selected.length)
      }
      onChange={handleCheckAllChange}
    />
  );
});

function useClickOut(onClickOut) {
  const ref = useRef();
  const handleClick = useCallback(
    (e) => {
      if (document) {
        const isInModal =
          document.querySelector('.c7n-pro-modal') &&
          document.querySelector('.c7n-pro-modal').contains(e.target);
        if (ref.current && !ref.current.contains(e.target) && !isInModal) {
          onClickOut(e);
        }
      }
    },
    [onClickOut],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return ref;
}

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
const RenderCell = observer(
  ({ rowIndex, dataIndex, editor, editable = true, ...props }) => {
    const { userDs } = useContext(Store);
    const [editing, setEditing] = useState(false);
    const editorRef = useRef(null);
    const editingRef = useRef(editing);

    const handleEditorBlur = () => {
      if (editingRef.current && editorRef.current && containerRef.current) {
        containerRef.current.blur();
      }
      hideEditor();
    };

    const containerRef = useClickOut(handleEditorBlur);

    editingRef.current = editing;

    useEffect(() => {
      if (editing && editorRef.current) {
        // @ts-ignore
        editorRef.current.focus();
      }
    });

    const hideEditor = () => {
      if (editing) {
        setEditing(false);
      }
    };

    const showEditor = () => {
      if (!editing) {
        setEditing(true);
      }
    };

    const handleFocus = () => {
      showEditor();
    };

    const shouldProcessData = (field) => {
      const lookupCode = field.get('lookupCode');
      const lookupUrl = field.get('lookupUrl');
      const lovCode = field.get('lovCode');
      const { type } = field;
      return !!(
        lookupCode ||
        isString(lookupUrl) ||
        (type !== 'object' && (lovCode || field.options)) ||
        lovCode
      );
    };

    const getCellRenderer = (newEditor, currentField) => {
      return editable && editing ? (
        <div
          className={classNames(styles.editor, {
            [styles.hidden]: !editing,
          })}
        >
          {newEditor}
        </div>
      ) : (
        <div
          className={classNames(styles.text, {
            [styles.hidden]: editing,
            [styles.required]: currentField.required,
            [styles.invalid]: !currentField.valid,
          })}
        >
          {newEditor}
        </div>
      );
    };

    if (userDs.length) {
      const currentRecord = userDs.get(rowIndex);
      const currentField = currentRecord.getField(dataIndex);
      const cellProps = {
        key: `${currentRecord.index}-${dataIndex}`,
        record: currentRecord,
        name: dataIndex,
        onBlur: handleEditorBlur,
        ref: editorRef,
        ...props,
      };

      let newEditor;
      if (editable && editing) {
        if (containerRef.current) {
          cellProps.style = {
            width: containerRef.current.getBoundingClientRect().width,
            height: containerRef.current.getBoundingClientRect().height,
            ...cellProps.style,
          };
        }
        // @ts-ignore
        newEditor = cloneElement(
          editor || getEditorByField(currentField),
          cellProps,
        );
      } else {
        const sampleInner =
          typeof props.renderer === 'function'
            ? props.renderer({ text: currentRecord.get(dataIndex) })
            : currentRecord.get(dataIndex);
        newEditor = shouldProcessData(currentField) ? (
          <Output {...cellProps} />
        ) : (
          sampleInner
        );
      }

      return (
        <div
          ref={containerRef}
          tabIndex={editable ? 0 : -1}
          className={styles.container}
          onFocus={handleFocus}
        >
          {getCellRenderer(newEditor, currentField)}
        </div>
      );
    }
    return null;
  },
);

const LargeListTable = observer(() => {
  const tableRef = React.createRef();

  const { userDs } = useContext(Store);

  const columns = useMemo(
    () => [
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
        render: (props) => (
          <RenderCell
            {...props}
            renderer={({ text }) => {
              return text ? `${text}岁` : '';
            }}
          />
        ),
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
    ],
    [],
  );

  const dataSource = useMemo(() => userDs.toData(), [userDs.length]);

  return (
    <PageHeaderWrapper title="PerformanceTable">
      <PerformanceTable
        // virtualized
        ref={tableRef}
        columns={columns}
        height={400}
        rowHeight={39}
        headerHeight={39}
        data={dataSource}
        rowClassName={styles.tableRowWrap}
        loading={userDs.status !== 'ready'}
      />
      <Pagination
        pageSizeOptions={['20', '50', '100', '200', '500']}
        dataSet={userDs}
      />
      <br />
      <Button
        onClick={() => {
          userDs.create({}, 0);
          tableRef.current.scrollTop(0);
        }}
      >
        Scroll top
      </Button>
    </PageHeaderWrapper>
  );
});

const App = (props) => (
  <StoreProvider {...props}>
    <LargeListTable />
  </StoreProvider>
);

ReactDOM.render(<App />, document.getElementById('container'));

// RenderCell.less
//
// .container {
//   width: 100%;
//   cursor: pointer;
//   outline: none;
// }
//
// .hidden {
//   display: none !important;
// }
//
// .disabled {
//   cursor: auto;
//
// .text:hover {
//     border-color: transparent;
//   }
// }
//
// .editor {
//
// }
//
// .text {
//   padding: 0 0.05rem 0 0.05rem;
//   display: flex;
//   align-items: center;
//   border: 0.01rem solid rgba(0, 0, 0, 0.2);
//   border-radius: 4px;
//   line-height: 0.34rem;
//   height: 0.36rem;
// }
//
// .required {
//   background-color: #feffe6;
// }
//
// .invalid {
//   background-color: #fcebeb;
//   border: 0.01rem solid #d50000;
//
//   span {
//     display: none;
//   }
// }
//
// .tableRowWrap {
//   :global {
//     .c7n-performance-table-cell-content {
//       padding: 0.01rem 0.16rem;
//     }
//   }
// }
