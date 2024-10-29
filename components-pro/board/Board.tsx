import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import noop from 'lodash/noop';
import { DraggableProps, DroppableProps, DragDropContextProps } from 'react-beautiful-dnd';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { CardProps } from 'choerodon-ui/lib/card';
import BoardWithContext, { normalizeColumns } from './BoardWithContext';
import { ViewMode, ViewField } from './enum';
import DataSet from '../data-set';
import { TableProps } from '../table/Table';
import { FieldType } from '../data-set/enum';
import Record from '../data-set/Record';
import { DataSetComponentProps, DataSetProps } from '../data-set/interface';

export const VIEWLISTDS = '__VIEWLISTDS__';

export interface BoardCardProps extends Omit<CardProps, 'onHeadClick' | 'onClick'> {
  onHeadClick?: (e: MouseEvent, record: Record) => void;
  onClick?: (e: MouseEvent, record: Record) => void;
  cardWidth?: 4 | 6 | 8 | 12;
  contentRenderer?: (viewProps: any, dataSet: DataSet) => ReactElement;
}

export interface KanbanProps {
  isDragDropDisabled: boolean;
  allDsProps: DataSetProps;
  columnDsProps: DataSetProps;
  droppableProps: DroppableProps;
  draggableProps: DraggableProps;
  dragDropContext: DragDropContextProps;
  cardWidth?: 4 | 6 | 8 | 12;
}

export interface BoardProps extends DataSetComponentProps {
  customized?: BoardCustomized | null;
  customizable?: boolean;
  styleIsolation?: boolean;
  customizedCode: string;
  className?: string;
  dataSet: DataSet;
  // groupField?: string;
  tableProps: TableProps;
  cardProps?: BoardCardProps;
  kanbanProps?: KanbanProps;
  viewMode?: ViewMode;
  defaultViewMode: ViewMode;
  defaultViewProps?: {
    card?: any,
    kanban?: any,
    table?: any,
  } | any;
  queryFields?: { [key: string]: ReactElement<any> };
  onChange?: Function;
  onConfigChange?: (props: { config: any, currentViewDS: DataSet }) => void;
  renderCommand?: Function;
  commandsLimit?: number;
  renderButtons?: Function;
  autoQuery?: boolean;
  viewVisible?: {
    card?: boolean,
    kanban?: boolean,
    table?: boolean,
  } | boolean;
}

export interface BoardCustomized {
  defaultFlag?: boolean;
  dataJson?: object;
  viewType: ViewMode;
  viewName: string;
  id: string;
}

export const DEFAULTVIEW = {
  card: {
    [ViewField.viewName]: '初始卡片视图',
    [ViewField.viewMode]: ViewMode.card,
    [ViewField.id]: '__DEFAULT__',
  },
  kanban: {
    [ViewField.viewName]: '初始看板视图',
    [ViewField.viewMode]: ViewMode.kanban,
    [ViewField.id]: '__DEFAULT__',
  },
  table: {
    [ViewField.viewName]: '初始列表视图',
    [ViewField.viewMode]: ViewMode.table,
    [ViewField.id]: '__DEFAULT__',
  },
}

const Board: FunctionComponent<BoardProps> = function Board(props) {
  const { getConfig, getCustomizable } = useContext(ConfigContext);
  const { defaultViewMode, defaultViewProps, tableProps, viewVisible, dataSet, customizedCode, customizable = customizedCode ? getCustomizable('Board') : undefined } = props;
  const $customizable = customizedCode ? customizable : false;
  const [loaded, setLoaded] = useState<boolean>(!$customizable);
  const [customized, setCustomized] = useState<BoardCustomized | undefined | null>();
  const customizedDS = useMemo(() => new DataSet({
    autoLocateFirst: false,
    paging: false,
    fields: [
      {
        name: ViewField.viewProps,
        type: FieldType.json,
      },
      {
        name: ViewField.viewName,
        type: FieldType.string,
      },
      {
        name: ViewField.viewMode,
        type: FieldType.string,
        transformResponse(value) {
          return value.split('_VIEW')[0].toLocaleLowerCase();
        },
        transformRequest(value) {
          return value.concat('_VIEW').toLocaleUpperCase();
        },
      },
      {
        name: ViewField.id,
      },
      {
        name: ViewField.activeKey,
      },
      {
        name: ViewField.groupField,
        bind: `${ViewField.viewProps}.${ViewField.groupField}`,
      },
      {
        name: ViewField.viewHeight,
        bind: `${ViewField.viewProps}.${ViewField.viewHeight}`,
      },
      {
        name: ViewField.cardWidth,
        bind: `${ViewField.viewProps}.${ViewField.cardWidth}`,
      },
      {
        name: ViewField.cardLayout,
        bind: `${ViewField.viewProps}.${ViewField.cardLayout}`,
      },
      {
        name: ViewField.commandsLimit,
        bind: `${ViewField.viewProps}.${ViewField.commandsLimit}`,
      },
      {
        name: ViewField.buttonPosition,
        bind: `${ViewField.viewProps}.${ViewField.buttonPosition}`,
      },
      {
        name: ViewField.buttonSecPosition,
        bind: `${ViewField.viewProps}.${ViewField.buttonSecPosition}`,
      },
      {
        name: ViewField.buttonDisplay,
        bind: `${ViewField.viewProps}.${ViewField.buttonDisplay}`,
      },
      {
        name: ViewField.cardLayoutData,
        bind: `${ViewField.viewProps}.${ViewField.cardLayoutData}`,
      },
      {
        name: ViewField.showLabel,
        bind: `${ViewField.viewProps}.${ViewField.showLabel}`,
      },
      {
        name: ViewField.displayFields,
        bind: `${ViewField.viewProps}.${ViewField.displayFields}`,
      },
      {
        name: ViewField.combineSort,
        bind: `${ViewField.viewProps}.${ViewField.combineSort}`,
      },
      {
        name: ViewField.sort,
        bind: `${ViewField.viewProps}.${ViewField.sort}`,
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const activeRecord = dataSet.find(record => record.get(ViewField.activeKey));
        if (activeRecord && viewVisible) {
          const viewType = activeRecord.get(ViewField.viewMode);
          if (viewVisible[viewType] !== false) {
            dataSet.current = dataSet.find(record => record.get(ViewField.activeKey));
          } else {
            dataSet.current = dataSet.find(record => record.get(ViewField.id) === '__DEFAULT__');
          }
        } else {
          dataSet.current = dataSet.find(record => record.get(ViewField.id) === '__DEFAULT__');
        }
      },
    },
  }), [customizedCode]);

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

  /**
   * 加载当前默认个性化视图数据(单个)
   */
  const loadCustomized = useCallback(async () => {
    if (customizedCode) {
      setLoaded(false);
      const customizedLoad = getConfig('customizedLoad');
      try {
        const res = await customizedLoad(customizedCode, 'Board', {
          type: 'default',
        });
        const remoteCustomized: BoardCustomized[] | undefined | null = res ? [res] : [];
        const viewProps = {
          card: {
            [ViewField.cardWidth]: 6,
            [ViewField.displayFields]: displayFields.map(field => field.name).filter(Boolean).slice(0, 3),
            [ViewField.showLabel]: 1,
            [ViewField.cardLayout]: 'form',
            [ViewField.buttonDisplay]: 'limit',
            [ViewField.buttonPosition]: 'top',
            [ViewField.buttonSecPosition]: 'right',
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
        if (remoteCustomized && remoteCustomized.length) {
          remoteCustomized.push(defaultView);
          customizedDS.loadData(remoteCustomized);
        } else {
          customizedDS.loadData([defaultView]);
        }
        dataSet.setState(VIEWLISTDS, customizedDS);
      } finally {
        setLoaded(true);
      }
    }
  }, [customizedCode]);

  useEffect(() => {
    if ($customizable) {
      loadCustomized();
    }
  }, [$customizable, loadCustomized]);

  return loaded ? (
    <BoardWithContext
      {...props}
      customizedDS={customizedDS}
      customized={customized}
      customizedCode={customizedCode}
      setCustomized={setCustomized}
      customizable={$customizable}
    />
  ) : null;
};

Board.displayName = 'Board';

Board.defaultProps = {
  onChange: noop,
  viewMode: ViewMode.table,
  queryFields: {},
  autoQuery: false,
  viewVisible: true,
  commandsLimit: 1,
  defaultViewMode: ViewMode.table,
  defaultViewProps: {},
};
export type ForwardBoardType = typeof Board

export default Board as ForwardBoardType;
