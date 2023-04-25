import { ReactElement, ReactNode } from 'react';
import noop from 'lodash/noop';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { BoardCustomized } from './Board';
import { cardCommandsProps } from './CardCommand';
import { Commands } from '../table/Table';
import DataSet from '../data-set';

export interface BoardContextValue {
  prefixCls?: string | undefined;
  defaultActiveKey?: string | undefined;
  actuallyDefaultActiveKey?: string | undefined;
  propActiveKey?: string | undefined;
  keyboard?: boolean | undefined;
  autoQuery?: boolean | undefined;
  // customizable?: boolean | undefined;
  // customized?: TabsCustomized | undefined | null;
  getConfig: Function;
  getProPrefixCls: Function;
  saveCustomized: (customized: BoardCustomized) => void | any;
  displayFields?: any,
  activeKey?: string | undefined;
  customizedCode?: string;
  changeActiveKey?: (activeKey: string) => void;
  children?: ReactNode;
  defaultChangeable?: boolean | undefined;
  rippleDisabled?: boolean | undefined;
  optionDS?: DataSet,
  customizedDS?: DataSet,
  dataSet?: DataSet,
  queryFields: ReactElement<any>[];
  command?: Commands[] | ((props: cardCommandsProps) => Commands[]);
  renderCommand?: Function;
  renderButtons?: Function;
  onConfigChange?: (props: { config: any, currentViewDS: DataSet }) => void;
  onChange?: Function;
  viewTypeVisible?: boolean | object;
}

const BoardContext = getContext<BoardContextValue>(Symbols.BoardContext, {
  changeActiveKey: noop,
  queryFields: [],
  saveCustomized: noop,
  getConfig: noop,
  getProPrefixCls: noop,
});

export default BoardContext;
