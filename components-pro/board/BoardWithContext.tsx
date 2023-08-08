import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  ReactElement,
  isValidElement,
  cloneElement,
  Children,
  JSXElementConstructor,
} from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isBoolean from 'lodash/isBoolean';
import sortBy from 'lodash/sortBy';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import warning from 'choerodon-ui/lib/_util/warning';
import confirm from '../modal/confirm';
import { ViewField, ViewMode, ViewModeIcon } from './enum';
import DataSet from '../data-set';
import Record from '../data-set/Record';
import Table from '../table';
import Button from '../button';
import { ButtonColor, FuncType } from '../button/enum';
import Icon from '../icon';
import Dropdown from '../dropdown';
import Form from '../form';
import Select from '../select';
import TextField from '../text-field';
import ModalProvider from '../modal-provider';
import { ModalProps } from '../modal/Modal';
import { useModal } from '../modal-provider/ModalProvider';
import { BoardProps, BoardCustomized, DEFAULTVIEW } from './Board';
import KanbanContent from './KanbanContent';
import BoardContext, { BoardContextValue } from './BoardContext';
import { getColumnKey, getEditorByField, getPlaceholderByField } from '../table/utils';
import { $l } from '../locale-context';
import { FieldType, RecordStatus } from '../data-set/enum';
import Field from '../data-set/Field';
import { ButtonProps } from '../button/Button';
import CardContent from './CardContent';
import { ColumnLock, ColumnProps, TableQueryBarHookCustomProps } from '../table/interface';
import isFragment from '../_util/isFragment';
import Column from '../table/Column';

export const GROUPFIELD = '__GROUPFIELD__';


type ChildrenInfo = {
  hasAggregationColumn: boolean;
  isHideDisabled: boolean;
}

export function normalizeColumns(
  elements: ReactNode,
  tableAggregation?: boolean,
  customizedColumns?: { [key: string]: ColumnProps },
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
  columnSort = {
    left: 0,
    center: 0,
    right: 0,
  },
): [ColumnProps[], ColumnProps[], ColumnProps[], ChildrenInfo] {
  const columns: ColumnProps[] = [];
  const leftColumns: ColumnProps[] = [];
  const rightColumns: ColumnProps[] = [];
  let hasAggregationColumn = false;
  let isHideDisabled = false;
  const normalizeColumn = (element) => {
    if (isValidElement<any>(element)) {
      const { props, key, type } = element;
      if (isFragment(element)) {
        const { children } = props;
        if (children) {
          Children.forEach(children, normalizeColumn);
        }
      } else if ((type as typeof Column).__PRO_TABLE_COLUMN) {
        const column: any = {
          ...props,
        };
        if (key) {
          column.key = key;
        } else if (isNil(getColumnKey(column))) {
          column.key = `anonymous-${defaultKey[0]++}`;
        }
        const { children, aggregation } = column;
        if (!hasAggregationColumn && aggregation) {
          hasAggregationColumn = true;
        }
        if (tableAggregation || !aggregation) {
          if (!isHideDisabled && column.hideable === false) {
            isHideDisabled = true;
          }
          if (parent || !column.lock) {
            if (column.sort === undefined) {
              column.sort = columnSort.center;
            }
            columnSort.center++;
            columns.push(column);
          } else if (column.lock === true || column.lock === ColumnLock.left) {
            if (column.sort === undefined) {
              column.sort = columnSort.left;
            }
            columnSort.left++;
            leftColumns.push(column);
          } else {
            if (column.sort === undefined) {
              column.sort = columnSort.right;
            }
            columnSort.right++;
            rightColumns.push(column);
          }
        } else {
          const [leftNodes, nodes, rightNodes, {
            hasAggregationColumn: childrenHasAggregationColumn, isHideDisabled: childrenIsHideDisabled,
          }] = normalizeColumns(children, tableAggregation, customizedColumns, parent, defaultKey, parent ? undefined : columnSort);
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
          if (!isHideDisabled && childrenIsHideDisabled) {
            column.hideable = false;
            isHideDisabled = true;
          }
          if (parent) {
            parent.children = [...leftNodes, ...nodes, ...rightNodes];
          } else {
            leftColumns.push(...leftNodes);
            columns.push(...nodes);
            rightColumns.push(...rightNodes);
          }
        }
      }
    }
  };
  Children.forEach(elements, normalizeColumn);
  if (parent) {
    return [[], sortBy(columns, ({ sort }) => sort), [], { hasAggregationColumn, isHideDisabled }];
  }
  return [
    sortBy(leftColumns, ({ sort }) => sort),
    sortBy(columns, ({ sort }) => sort),
    sortBy(rightColumns, ({ sort }) => sort),
    { hasAggregationColumn, isHideDisabled },
  ];
}

/**
 * 处理分组字段下拉数据,仅单选快码
 * @param dataSet 
 */
function processGroupData(dataSet: DataSet): object[] {
  const data: object[] = [];
  dataSet.fields.forEach((field) => {
    const type = field.get('type');
    const multiple = field.get('multiple');
    if (
      !multiple && (
        field.get('lookupCode') ||
        isString(field.get('lookupUrl')) ||
        (type !== FieldType.object && (field.get('lovCode') || field.getLookup() || field.get('options')))
      )
    ) {
      data.push({
        value: field.get('name'),
        meaning: field.get('label'),
      });
    }
  });
  return data;
}

const ModalContent = ({ modal, prefixCls, groupDataSet }: any) => (
  <div className={`${prefixCls}-board-modal-content`}>
    <div>
      选择一个字段，数据将按照此字段中的字段值分组显示在看板中，支持字段类型：单选、下拉单选
    </div>
    <Form dataSet={groupDataSet}>
      <TextField
        label="视图名称"
        name={ViewField.viewName}
      />
      <Select
        name="groupField"
        label="选择分组字段"
        onChange={(value) => {
          if (value) {
            modal.update({
              okProps: { disabled: false },
            });
          }
        }}
      />
    </Form>
  </div>
)

export interface BoardWithContextProps extends BoardProps {
  customizedDS: DataSet;
  setCustomized: (customized: BoardCustomized | undefined | null) => void;
}

export interface viewProps {
  viewId: string;
  viewName?: ReactNode;
  viewMode: ViewMode;
  groupField?: Field;
  viewProps?: object;
}

const BoardWithContext: FunctionComponent<BoardWithContextProps> = function Board(props) {
  const { getConfig, getProPrefixCls } = useContext(ConfigContext);
  const [hidden, setHidden] = useState<boolean>(true);
  const { defaultViewProps, defaultViewMode, onChange, onConfigChange, renderButtons, viewVisible, autoQuery, kanbanProps, cardProps, renderCommand, commandsLimit, customizedDS, queryFields, dataSet, tableProps, customizable, customizedCode } = props;
  const prefixCls = getProPrefixCls('board');

  const saveCustomized = useCallback(async (newCustomized: BoardCustomized) => {
    if (customizable && customizedCode) {
      const customizedSave = getConfig('customizedSave');
      const res = await customizedSave(customizedCode, newCustomized, 'Board');
      return res;
    }
  }, [customizable, customizedCode]);
  const customizedLoad = getConfig('customizedLoad');

  const viewTypeVisible = useMemo(() => {
    if (isBoolean(viewVisible)) {
      return {
        card: viewVisible,
        kanban: viewVisible,
        table: viewVisible,
      }
    } 
    if (isObject(viewVisible)) {
      return {
        card: isBoolean(viewVisible.card) ? viewVisible.card : true,
        kanban: isBoolean(viewVisible.kanban) ? viewVisible.kanban : true,
        table: isBoolean(viewVisible.table) ? viewVisible.table : true,
      }
    }
    return {
      card: true,
      kanban: true,
      table: true,
    }
  }, [viewVisible]);


  const viewHeight = useMemo(() => customizedDS && customizedDS.current ? customizedDS.current.get(ViewField.viewHeight) : undefined, [customizedDS.current]);
  const currentDisplayFields = useMemo(() => customizedDS && customizedDS.current ? customizedDS.current.get(ViewField.displayFields) : undefined, [customizedDS.current]);

  const [searchText, setSearchText] = useState('');
  const modal = useModal();
  const TableRef = useRef(null);
  const DropdownRef = useRef(null);
  const SwitchBtnRef = useRef(null);

  const optionDS = useMemo(() => new DataSet({
    data: processGroupData(dataSet),
    paging: false,
    primaryKey: 'value',
  }), [dataSet]);

  const displayFields = useMemo(() => {
    if (tableProps && tableProps.columns) {
      return tableProps.columns;
    }
    if (tableProps && tableProps.children) {
      const { children, aggregation } = tableProps;
      const generatedColumns = normalizeColumns(children, aggregation);
      return generatedColumns[0].concat(generatedColumns[1], generatedColumns[2]);
    }
    return [];
  }, [tableProps]);

  const command = useMemo(() => {
    if (displayFields && displayFields.length) {
      const commandCol = displayFields.find(col => col.command);
      return commandCol ? commandCol.command : undefined;
    }
  }, [displayFields]);

  const groupDataSet = useMemo(() => new DataSet({
    paging: false,
    primaryKey: 'groupField',
    autoCreate: true,
    fields: [
      { name: ViewField.groupField, required: true, type: FieldType.object, options: optionDS },
      { name: ViewField.viewName, type: FieldType.string, defaultValue: '看板视图' },
    ],
  }), [dataSet]);

  /**
   * 处理面板显隐
   */
  const handleClickOut = useCallback((e) => {
    if (DropdownRef.current
      && SwitchBtnRef.current
      // @ts-ignore
      && !(DropdownRef.current.contains(e.target)
        // @ts-ignore
        || SwitchBtnRef.current.element.contains(e.target))) {
      setHidden(true);
    }
  }, [DropdownRef]);

  useEffect(() => {
    document.addEventListener('click', handleClickOut);
    return () => document.removeEventListener('click', handleClickOut);
  }, [DropdownRef]);

  /**
   * 新建视图 | 加载视图列表数据
   */
  const loadListData = useCallback(async (record: Record) => {
    try {
      let detailRes;
      if (record.get(ViewField.id) || record.get('menuId') || record.get(ViewField.id) === '__DEFAULT__') {
        detailRes = record.toData();
      } else {
        detailRes = await saveCustomized(record.toData());
      }
      const res = await customizedLoad(customizedCode, 'Board', {
        type: 'list',
      });
      const mergeRes = res.map(r => {
        if (r.id === detailRes[ViewField.id]) {
          return detailRes;
        }
        return r;
      });
      const viewProps = {
        card: {
          [ViewField.cardWidth]: 6,
          [ViewField.displayFields]: displayFields.map(field => field.name).filter(Boolean).slice(0, 3),
          [ViewField.showLabel]: 1,
        },
        table: {},
        kanban: {
          [ViewField.cardWidth]: 6,
          [ViewField.displayFields]: displayFields.map(field => field.name).filter(Boolean).slice(0, 3),
          [ViewField.showLabel]: 1,
        },
      };
      const defaultView = {
        code: customizedCode,
        ...DEFAULTVIEW[defaultViewMode],
        [ViewField.viewProps]: {
          ...viewProps[defaultViewMode],
          ...defaultViewProps[defaultViewMode],
        },
      };
      customizedDS.loadData([...mergeRes, defaultView]);
    } catch (error) {
      warning(false, error.message);
    }
  }, [customizedCode]);

  /**
   * 渲染查询条字段组件
   */
  const getQueryFields = useCallback((): ReactElement<any>[] => {
    const { queryDataSet } = dataSet;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields, current, props: { fields: propFields = [] } } = queryDataSet;
      const cloneFields: Map<string, Field> = fields.toJS();
      const tlsKey = getConfig('tlsKey');
      const processField = (field, name) => {
        if (!field.get('bind', current) && !name.includes(tlsKey)) {
          const element: ReactNode = queryFields![name];
          let filterBarProps = {};
          const inValidElement = getEditorByField(field, current, true);
          const placeholder = isValidElement(element) && element.props.placeholder ? element.props.placeholder : getPlaceholderByField(field, current);
          filterBarProps = {
            placeholder,
            border: false,
            clearButton: true,
          };
          const elementType = inValidElement.type as JSXElementConstructor<any>;
          if ((!isValidElement(element) || element.props.suffix === undefined) && ['Currency', 'ObserverNumberField', 'EmailField', 'UrlField', 'ObserverTextField'].indexOf(elementType.name) !== -1) {
            Object.assign(filterBarProps, { suffix: <Icon type="search" /> });
          }
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
            isFlat: true,
            ...filterBarProps,
          };
          result.push(
            isValidElement(element)
              ? cloneElement(element, props)
              : cloneElement(inValidElement, {
                ...props,
                ...(isObject(element) ? element : {}),
              }),
          );
        }
      };
      propFields.forEach(({ name }) => {
        if (name) {
          const field = cloneFields.get(name);
          if (field) {
            cloneFields.delete(name);
            processField(field, name);
          }
        }
      });
      cloneFields.forEach((field, name) => {
        processField(field, name);
      });
    }
    return result;
  }, []);

  /**
   * 新增看板视图弹窗
   */
  const addBoardView = useCallback(() => {
    setHidden(true);
    const modalProps: ModalProps = {
      title: '看板视图',
      autoCenter: true,
      style: {
        width: 595,
      },
      children: <ModalContent groupDataSet={groupDataSet} prefixCls={prefixCls} />,
      okProps: { disabled: true },
      onClose: () => { groupDataSet.reset(); return true },
      onOk: () => {
        const groupField = groupDataSet!.current!.get('groupField').value;
        customizedDS.create({
          [ViewField.viewMode]: ViewMode.kanban,
          [ViewField.viewName]: groupDataSet!.current!.get(ViewField.viewName),
          [ViewField.viewProps]: {
            [ViewField.groupField]: groupField,
            [ViewField.cardWidth]: 6,
            [ViewField.displayFields]: displayFields.map(field => field.name).filter(Boolean).slice(0, 3),
            [ViewField.showLabel]: 1,
          },
          [ViewField.activeKey]: 1,
        }, 0);
        loadListData(customizedDS.current!);
        // if (isFunction(onChange)) {
        //   onChange({ record: customizedDS.current, dataSet });
        // }
        return true;
      },
    };
    modal.open(modalProps);
  }, [modal, saveCustomized])

  /**
   * 渲染视图切换面板
   */
  const renderSwitcherBoard = useCallback((): ReactNode => {
    return (
      <div className={`${prefixCls}-switch-board`} ref={DropdownRef}>
        <div className={`${prefixCls}-switch-board-search`}>
          <TextField
            style={{ width: '100%' }}
            value={searchText}
            onClick={(e) => {
              e.preventDefault();
              e.currentTarget.focus();
            }}
            onChange={(v) => {
              setSearchText(v);
            }}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchText(e.target.value);
            }}
            prefix={<Icon type="search" />}
            placeholder={$l('Table', 'enter_text_filter')}
            clearButton
          />
        </div>
        {customizedDS && customizedDS.length ? customizedDS.map((record) => {
          const viewMode = record.get(ViewField.viewMode);
          if (viewTypeVisible[viewMode] === false && !(record.get(ViewField.id) === '__DEFAULT__' || !record.get(ViewField.id))) {
            return null;
          }
          const itemCls = classnames(
            `${prefixCls}-view-item`,
            {
              [`${prefixCls}-view-item-active`]: record.isCurrent,
            },
          );
          return (
            <div
              key={record.id}
              hidden={searchText ? !record.get(ViewField.viewName).includes(searchText) : false}
              className={itemCls}
              onClick={async () => {
                if (record.get(ViewField.activeKey) === 1) {
                  setHidden(true);
                } else {
                  customizedDS!.current!.set(ViewField.activeKey, 0);
                  record.set(ViewField.activeKey, 1);
                  customizedDS.current = record;
                  // if (isFunction(onChange)) {
                  //   onChange({ record, dataSet });
                  // }
                  setHidden(true);
                  try {
                    // 调用 detail 查询详情，切换视图，后端直接将其置为 default
                    if (record.get(ViewField.id) === '__DEFAULT__' || !record.get(ViewField.id)) {
                      // 切换的为前端内置视图，frontFlag 标记前端配置，后端将其他视图 defaultFlag 置为 0
                      saveCustomized({ ...record.toJSONData(), id: undefined, frontFlag: 1 });
                    } else {
                      const res = await customizedLoad(customizedCode!, 'Board', {
                        type: 'detail',
                        [ViewField.id]: record.get(ViewField.id),
                      });
                      record.commit(res, customizedDS);
                    }
                  } catch (e) {
                    record.status = RecordStatus.sync;
                  }
                }
              }}
            >
              <Icon type={ViewModeIcon[record.get(ViewField.viewMode)]} />
              {record.get(ViewField.viewName)}
              {record.get(ViewField.id) !== '__DEFAULT__' ?
                <Icon
                  className={`${prefixCls}-delete`}
                  type="delete_black-o"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setHidden(true);
                    if (await confirm('确认删除') !== 'cancel') {
                      runInAction(() => {
                        record.status = RecordStatus.delete;
                        try {
                          saveCustomized(record.toJSONData());
                          if (record.isCurrent) {
                            customizedDS.current = customizedDS.find(record => record.get(ViewField.id) === '__DEFAULT__');
                          }
                        } catch (e) {
                          record.status = RecordStatus.sync;
                        }
                      })
                    }
                  }}
                /> 
                : null}
            </div>
          );
        }) : null}
        <div className={`${prefixCls}-switch-board-footer`}>
          <div>添加视图</div>
          <div className={`${prefixCls}-view-add`}>
            <div
              hidden={!viewTypeVisible.table}
              onClick={() => {
                customizedDS!.create({
                  [ViewField.viewMode]: ViewMode.table,
                  [ViewField.viewName]: '列表视图',
                  [ViewField.viewProps]: {},
                  [ViewField.activeKey]: 1,
                }, 0);
                try {
                  // saveCustomized(customizedDS.current!.toData());
                  loadListData(customizedDS.current!);
                  // if (isFunction(onChange)) {
                  //   onChange({ record: customizedDS.current, dataSet });
                  // }
                } catch (e) {
                  // record.status = RecordStatus.sync;
                }
                setHidden(true);
              }}
            >
              <Icon type="biaoge-o" />
              列表
            </div>
            <div
              hidden={!viewTypeVisible.card}
              onClick={() => {
                customizedDS.create({
                  [ViewField.viewMode]: ViewMode.card,
                  [ViewField.viewName]: '卡片视图',
                  [ViewField.viewProps]: {
                    [ViewField.cardWidth]: 6,
                    [ViewField.displayFields]: displayFields.map(field => field.name).filter(Boolean).slice(0, 3),
                    [ViewField.showLabel]: 1,
                  },
                  [ViewField.activeKey]: 1,
                }, 0);
                try {
                  // saveCustomized(customizedDS.current!.toData());
                  loadListData(customizedDS.current!);
                  // if (isFunction(onChange)) {
                  //   onChange({ record: customizedDS.current, dataSet, currentViewDS:  });
                  // }
                } catch (e) {
                  // record.status = RecordStatus.sync;
                }
                setHidden(true);
              }}
            >
              <Icon type="kapian" />
              卡片
            </div>
            <div hidden={!viewTypeVisible.kanban} onClick={addBoardView}>
              <Icon type="kanban" />
              看板
            </div>
          </div>
        </div>
      </div>
    );
  }, [customizedDS, searchText, viewTypeVisible])

  const renderSwitcherIcon = useCallback((): ReactElement<ButtonProps> => {
    const viewType = customizedDS.current && customizedDS.current.get(ViewField.viewMode);
    return (
      <Dropdown
        overlay={() => renderSwitcherBoard()}
        hidden={hidden}
      >
        <Button
          color={ButtonColor.primary}
          funcType={FuncType.flat}
          onClick={async () => {
            // 初次点击查询视图列表，=1 避免每次点击查询，保存具体配置或刷新重新查询 list 接口
            if (hidden && customizedDS.length <= 2) {
              loadListData(customizedDS.current!);
              customizedDS.setState('__ISCHANGE__', true);
            }
            setHidden(!hidden)
          }}
          ref={SwitchBtnRef}
        >
          <Icon type={ViewModeIcon[viewType] || "biaoge-o"} />
          <Icon type={hidden ? "baseline-arrow_drop_down" : "baseline-arrow_drop_up"} />
        </Button>
      </Dropdown>
    );
  }, [hidden, searchText, viewTypeVisible]);

  const tableDataSet = useMemo(() => {
    const isDefault = customizedDS.current ? customizedDS.current.get(ViewField.id) === '__DEFAULT__' : true;
    const defaultSortParams = (dataSet.combineSort && customizedDS.current) ? customizedDS.current.get(ViewField.combineSort) || [] : [];
    const orgFields = dataSet.props.fields ? dataSet.props.fields : [];
    const orderFields = orgFields.map((field) => {
      const orderField = defaultSortParams.find(of => of.sortName === field.name);
      const newField = { ...field };
      if (orderField) {
        newField.order = orderField.order;
      }
      return newField;
    });
    return isDefault? dataSet : new DataSet({
      ...dataSet.props,
      fields: orderFields,
      autoQuery,
    });
  }, [customizedDS.current]);

  const tableDataSetName = useMemo(() => {
    if (customizedDS.current && customizedDS.current.get(ViewField.viewMode) === ViewMode.table) {
      const changed = customizedDS.getState('__ISCHANGE__');
      if (isFunction(onChange) && tableDataSet && changed) {
        onChange({ record: customizedDS.current, dataSet, currentViewDS: tableDataSet });
      }
    }
  }, [tableDataSet]);


  const renderContent = useCallback((): ReactNode => {
    const viewMode = customizedDS.current ? customizedDS.current.get(ViewField.viewMode) : ViewMode.table;
    const isDefault = customizedDS.current ? customizedDS.current.get(ViewField.id) === '__DEFAULT__' : true;
    const noSwitcher = !viewVisible || (viewTypeVisible.card === false && viewTypeVisible.kanban === false && viewTypeVisible.table === false);
    const { buttonsLimit, buttons, queryBarProps, queryFieldsLimit, searchCode, dynamicFilterBar } = tableProps;
    const tableQueryBarProps = { ...getConfig('queryBarProps'), queryFieldsLimit, dynamicFilterBar, searchCode, ...queryBarProps } as TableQueryBarHookCustomProps;

    const displayedButtonsLimit = buttonsLimit && (noSwitcher ? buttonsLimit : buttonsLimit + 1);
    const tableBtns = buttons ? [...buttons] : [];
    let btnRenderer = tableBtns;
    if (viewMode === ViewMode.table) {
      if (isFunction(renderButtons)) {
        btnRenderer = renderButtons({ viewMode, dataSet: isDefault? dataSet : tableDataSet, buttons: tableBtns})
      }
      const btns = noSwitcher ? btnRenderer : [renderSwitcherIcon(), ...btnRenderer];
      dataSet.setState('__CURRENTVIEWDS__', tableDataSet);
      // handleChange tableDataSet
      if (tableDataSet) {
        dataSet.setState('__tempChange__', tableDataSetName);
      }
      return (
        <Table
          {...tableProps}
          customizable={isDefault ? false : customizable}
          customizedCode={customizedCode}
          boardCustomized={{
            customizedBtn: true,
            customizedDS,
          }}
          dataSet={isDefault? dataSet : tableDataSet}
          buttons={btns}
          buttonsLimit={displayedButtonsLimit}
          ref={TableRef}
        />
      );
    } 
    if (viewMode === ViewMode.card) {
      return (
        <CardContent
          cardProps={cardProps}
          key="cardContent"
          tableBtns={tableBtns}
          buttonsLimit={buttonsLimit}
          queryBarProps={tableQueryBarProps}
          buttons={noSwitcher ? [] : [renderSwitcherIcon()]}
        />
      );
    }
    return (
      <KanbanContent
        key="kanbanContent"
        dataSet={dataSet}
        queryBarProps={tableQueryBarProps}
        tableBtns={tableBtns}
        buttonsLimit={buttonsLimit}
        buttons={noSwitcher ? [] : [renderSwitcherIcon()]}
        kanbanProps={kanbanProps}
      />
    );
  }, [tableProps.buttonsLimit, customizedDS.current, viewHeight, currentDisplayFields, hidden, searchText, tableProps, viewTypeVisible]);


  const value: BoardContextValue = {
    // defaultActiveKey: propDefaultActiveKey,
    // actuallyDefaultActiveKey,
    // propActiveKey,
    prefixCls,
    getConfig,
    getProPrefixCls,
    customizedCode,
    // customizable,
    // customized,
    saveCustomized,
    // activeKey,
    // changeActiveKey,
    autoQuery,
    command,
    renderCommand,
    commandsLimit,
    renderButtons,
    customizedDS,
    displayFields,
    optionDS,
    dataSet,
    queryFields: getQueryFields(),
    viewTypeVisible,
    onConfigChange,
    onChange,
  };

  return (
    <BoardContext.Provider value={value}>
      {
        customizable ? (
          <ModalProvider>
            {renderContent()}
          </ModalProvider>
        ) : (
          <ModalProvider>
            {renderContent()}
          </ModalProvider>
        )
      }
    </BoardContext.Provider>
  );
};

BoardWithContext.displayName = 'BoardWithContext';

export default observer(BoardWithContext);
