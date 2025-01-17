import React, { FunctionComponent, useMemo, useState, useCallback, useContext, ReactNode } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { FieldType, SortOrder } from 'choerodon-ui/pro/lib/data-set/enum';
import pick from 'lodash/pick';
import Icon from 'choerodon-ui/lib/icon';
import Popover from 'choerodon-ui/lib/popover';
import Tag from 'choerodon-ui/lib/tag';
import { warning } from 'choerodon-ui/dataset/utils';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { SortRangeOption, CombineSortConfig } from '../interface';
import Select from '../../select';
import SelectBox from '../../select-box';
import Button from '../../button';
import { FuncType, ButtonColor } from '../../button/interface';
import { $l } from '../../locale-context';
import BoardContext from '../../board/BoardContext';
import { ViewMode } from '../../radio/enum';

const { Option } = SelectBox;

interface CombineSortProps {
  dataSet: DataSet,
  prefixCls?: string,
  /**
   * Table设置可排序的列字段
   */
  sortableFieldNames?: string[],
  /**
   * 组合排序配置
   */
  combineSortConfig?: CombineSortConfig;
}

/**
 * 默认前端组合排序
 * @param props 
 */
function defaultCombineSort(props: { dataSet: DataSet, sortInfo: Map<string, SortOrder> }) {
  const { dataSet, sortInfo } = props;
  dataSet.records = dataSet.records.sort((a, b) => {
    const sortKeys = [...sortInfo.keys()];
    for (let index = 0; index < sortKeys.length; index++) {
      const fieldName = sortKeys[index];
      const sortOrder = sortInfo.get(fieldName);
      const aValue = a.get(fieldName);
      const bValue = b.get(fieldName);
      if (typeof aValue === 'string' || typeof bValue === 'string') {
        if (aValue !== bValue) {
          return sortOrder === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      } else if (aValue !== bValue) {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (index + 1 === sortInfo.size) {
        return 0;
      }
    }
    return 0;
  });
}

const CombineSort: FunctionComponent<CombineSortProps> = function CombineSort(props) {
  const { dataSet, prefixCls, sortableFieldNames, combineSortConfig: sortConfig } = props;
  const {
    fields,
    props: {
      combineSort,
    },
  } = dataSet;

  const sortPrefixCls = `${prefixCls}-combine-sort`;
  const [visible, setVisible] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [sortRangeOption, setSortRangeOption] = useState<SortRangeOption>(() => {
    if (!sortConfig) {
      return SortRangeOption.allDataSort;
    }
    if (sortConfig.currentDataSort !== false && sortConfig.allDataSort !== false) {
      return typeof sortConfig.showSortOption === 'string' ? sortConfig.showSortOption : SortRangeOption.allDataSort;
    }
    return sortConfig.currentDataSort !== false ? SortRangeOption.currentDataSort : SortRangeOption.allDataSort;
  });
  const showSortOption = !sortConfig ||
    (!(sortConfig.currentDataSort === false && sortConfig.allDataSort === false) && sortConfig.showSortOption !== false);
  const currentDataSortFunc = sortConfig && typeof sortConfig.currentDataSort ==='function'
    ? sortConfig.currentDataSort
    : defaultCombineSort;

  const { customizedDS, saveCustomized, customizedCode, getConfig } = useContext(BoardContext);
  const customizedLoad = getConfig('customizedLoad');

  const sortFieldOptions = useMemo<DataSet>(() => {
    const sortFieldData: any[] = [];
    if (fields && sortableFieldNames && sortableFieldNames.length > 0) {
      fields.forEach(field => {
        if (sortableFieldNames.includes(field.name)) {
          sortFieldData.push({
            value: field.name,
            meaning: field.get('label') || field.name,
          });
        }
      });
    }
    return new DataSet({
      autoQuery: false,
      autoCreate: false,
      paging: false,
      fields: [
        { name: 'value', type: FieldType.string },
        { name: 'meaning', type: FieldType.string },
      ],
      data: sortFieldData,
    });
  }, [fields, sortableFieldNames]);

  const sortDS = useMemo<DataSet>(() => {
    const { combineSortFieldNames = new Map<string, SortOrder>() } = dataSet;
    const data: any[] = [];
    combineSortFieldNames.forEach((sortOrder, fieldName) => {
      const record = sortFieldOptions.find(record => record.get('value') === fieldName);
      if (record) {
        const field = dataSet.getField(fieldName);
        data.push({
          sortName: fieldName,
          order: sortOrder || (field && field.order) || SortOrder.asc,
        });
      }
    });
    return new DataSet({
      forceValidate: true,
      autoQuery: false,
      autoCreate: true,
      paging: false,
      fields: [
        { name: 'sortName', type: FieldType.string, options: sortFieldOptions },
        { name: 'order', type: FieldType.string, defaultValue: SortOrder.asc },
      ],
      data,
      events: {
        update: ({ dataSet }) => {
          if (customizedDS && customizedDS.current) {
            customizedDS.current.set('combineSort', dataSet.toData());
          }
        },
        remove: ({ dataSet }) => {
          if (customizedDS && customizedDS.current) {
            customizedDS.current.set('combineSort', dataSet.toData());
          }
        },
      },
    });
  }, [sortFieldOptions, dataSet, dataSet.combineSortFieldNames, visible]);

  // 加载 board 组件非初始列表视图下的多列排序数据及objectVersionNumber
  const loadDetail = useCallback(async () => {
    if (customizedDS && customizedDS.current && customizedDS.current.get('id') !== '__DEFAULT__') {
      const res = await customizedLoad(customizedCode!, 'Board', {
        type: 'detail',
        id: customizedDS!.current!.get('id'),
      });
      try {
        const dataJson: any = res.dataJson ? pick(JSON.parse(res.dataJson), ['columns', 'combineSort', 'defaultFlag', 'height', 'heightDiff', 'viewName']) : {};
        sortDS.loadData(dataJson.combineSort);
        customizedDS.current.set({objectVersionNumber: res.objectVersionNumber, dataJson});
      } catch (error) {
        warning(false, error.message);
      }
    }
  }, []);

  const optionsFilter = (record: Record) => {
    return sortDS.every(sortRecord => sortRecord.get('sortName') !== record.get('value'));
  }

  const onVisibleChange = (visible: boolean) => {
    if (waiting) {
      return;
    }
    if (!visible) {
      sortDS.reset();
    }
    setVisible(visible);
    if (visible) {
      loadDetail();
    }
  }

  const handleCancel = () => {
    sortDS.reset();
    setVisible(false);
  }

  const handleConfirm = () => {
    sortDS.validate().then(async result => {
      if (result) {
        setWaiting(true);
        const checkResult = await dataSet.modifiedCheck(undefined, dataSet, 'query').finally(() => {
          setWaiting(false);
        });
        if (!checkResult) {
          setVisible(false);
          return;
        }

        const records = sortDS.filter(r => r.get('sortName') && r.get('order'));
        const sortInfo: Map<string, SortOrder> = new Map();
        records.forEach(record => {
          sortInfo.set(record.get('sortName'), record.get('order'));
        });
        const isDefault = customizedDS && customizedDS.current ? customizedDS.current.get('id') === '__DEFAULT__' : true;
        if (customizedDS && customizedDS.current && !isDefault) {
          const res = await saveCustomized(customizedDS.current.toData());
          customizedDS.current.set('objectVersionNumber', res.objectVersionNumber);
        }
        if (sortRangeOption === SortRangeOption.currentDataSort) {
          runInAction(() => {
            dataSet.fields.forEach(current => {
              current.order = undefined;
            });
            dataSet.combineSort = true;
            dataSet.combineSortFieldNames = observable.map(sortInfo);
            sortInfo.forEach((sortOrder, fieldName) => {
              const field = dataSet.getField(fieldName);
              if (field) {
                field.order = sortOrder;
              }
            });
            currentDataSortFunc({ dataSet, sortInfo });
          });
        } else {
          dataSet.sort(sortInfo);
        }
        setVisible(false);
      }
    });
  }

  const onDragEnd = useCallback((result: DropResult) => {
    if (result.destination) {
      sortDS.move(result.source.index, result.destination.index);
    }
  }, [sortDS.data]);

  const SortDragItem: FunctionComponent<{record: Record, index: number}> = ({record, index}) => {
    const { key } = record;
    return (
      <Draggable
        draggableId={String(key)}
        index={record.index}
      >
        {(pro, snapshot) => (
          <span
            ref={pro.innerRef}
            {...pro.draggableProps}
            className={`${sortPrefixCls}-list-item${snapshot.isDragging ? ` ${sortPrefixCls}-list-item-dragging` : ''}`}
          >
            <span {...pro.dragHandleProps} className={`${sortPrefixCls}-list-item-drag`}>
              <Icon type="baseline-drag_indicator" />
            </span>
            <span className={`${sortPrefixCls}-list-item-index`}>
              <Tag>{index + 1}</Tag>
            </span>
            <Select
              placeholder={$l('Table', 'please_select_column')}
              className={`${sortPrefixCls}-list-item-sortName`}
              record={record}
              name="sortName"
              optionsFilter={optionsFilter}
              notFoundContent={$l('Table', 'no_save_filter')}
              clearButton={false}
            />
            <SelectBox
              record={record}
              name="order"
              className={`${sortPrefixCls}-list-item-sortOrder`}
            >
              <Option value={SortOrder.asc}>{$l('Table', 'ascending')}</Option>
              <Option value={SortOrder.desc}>{$l('Table', 'descending')}</Option>
            </SelectBox>
            <Button
              className={`${sortPrefixCls}-list-item-delete`}
              icon='delete_black-o'
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => sortDS.delete(record, false)}
            />
          </span>
        )}
      </Draggable>
    );
  }

  let sortOptionNode: ReactNode;
  if (showSortOption) {
    if (sortConfig && sortConfig.currentDataSort === false) {
      sortOptionNode = <Tag className={`${sortPrefixCls}-range-option`}>{$l('Table', 'all_data_sort')}</Tag>
    } else if (sortConfig && sortConfig.allDataSort === false) {
      sortOptionNode = <Tag className={`${sortPrefixCls}-range-option`}>{$l('Table', 'current_data_sort')}</Tag>
    } else {
      const options: any[] = [];
      if (!sortConfig || sortConfig.currentDataSort !== false) {
        options.push(<Option value={SortRangeOption.currentDataSort} key='currentDataSort'>{$l('Table', 'current_data_sort')}</Option>);
      }
      if (!sortConfig || sortConfig.allDataSort !== false) {
        options.push(<Option value={SortRangeOption.allDataSort} key='allDataSort'>{$l('Table', 'all_data_sort')}</Option>);
      }
      sortOptionNode = (
        <SelectBox
          className={`${sortPrefixCls}-range-option`}
          value={sortRangeOption}
          onChange={(val) => setSortRangeOption(val)}
          disabled={options.length <= 1}
          mode={ViewMode.button}
        >
          {options}
        </SelectBox>
      );
    }
  }

  const popupContent = useMemo(() => {
    return (
      <div className={`${sortPrefixCls}-content`}>
        <div className={`${sortPrefixCls}-body`}>
          <div className={`${sortPrefixCls}-list-container`}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="combine-sort"
                direction="vertical"
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${sortPrefixCls}-list`}
                  >
                    {sortDS.map((record, index) => {
                      const { key } = record;
                      return <SortDragItem key={key} record={record} index={index} />;
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className={`${sortPrefixCls}-add-button`}>
            <Button
              funcType={FuncType.link}
              icon="add"
              onClick={() => sortDS.create()}
              color={ButtonColor.primary}
              disabled={sortDS.length >= sortFieldOptions.length}
            >
              {$l('Table', 'add_sort')}
            </Button>
          </div>
        </div>
        <div className={`${sortPrefixCls}-footer`}>
          <Button onClick={handleCancel} icon='close'>{$l('Modal', 'cancel')}</Button>
          <Button onClick={handleConfirm} color={ButtonColor.primary} icon='done'>{$l('Modal', 'ok')}</Button>
        </div>
      </div>
    );
  }, [onDragEnd, sortFieldOptions.data, sortDS.data, sortConfig, sortRangeOption, setSortRangeOption, dataSet, setWaiting, setVisible]);

  const popupTitle = useMemo(() => {
    return (
      <div className={`${sortPrefixCls}-header-inner`}>
        <span className={`${sortPrefixCls}-header-inner-title`}>{$l('Table', 'custom_sort')}</span>
        {sortOptionNode}
      </div>
    );
  }, [sortConfig, sortRangeOption, setSortRangeOption]);

  if (!combineSort || !sortableFieldNames || sortableFieldNames.length === 0) {
    return null;
  }

  return (
    <Popover
      trigger="click"
      overlayClassName={`${sortPrefixCls}-popover`}
      title={popupTitle}
      content={popupContent}
      visible={visible}
      onVisibleChange={onVisibleChange}
      placement="bottomLeft"
    >
      <Button
        icon="paixu-xia"
        funcType={FuncType.link}
        color={ButtonColor.primary}
        className={`${sortPrefixCls}-trigger-button`}
      />
    </Popover>
  );
}

CombineSort.displayName = 'CombineSort';

export default observer(CombineSort);
