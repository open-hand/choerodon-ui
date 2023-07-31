import React, { cloneElement, FunctionComponent, MouseEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import merge from 'lodash/merge';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ModalChildrenProps } from 'choerodon-ui/pro/lib/modal/interface';
import Button from 'choerodon-ui/pro/lib/button';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import TabGroups from './tab-groups';
import TabsContext from '../TabsContext';
import { GroupPanelMap, TabsCustomized } from '../Tabs';
import { getDefaultActiveKey, normalizePanes } from '../utils';
import { TabPaneProps } from '../TabPane';

function processPaneToData(pane: TabPaneProps, key: string, group?: string) {
  const { tab, title, sort, showCount, disabled } = pane;
  return {
    key,
    tab,
    title,
    sort,
    showCount,
    group,
    disabled,
  };
}

function normalizePanesToData(pair: [Map<string, TabPaneProps>, Map<string, GroupPanelMap>]): object[] {
  const [totalPanelsMap, groupPanelMap] = pair;
  const data: object[] = [];
  if (groupPanelMap.size > 0) {
    groupPanelMap.forEach((paneMap, key) => (
      paneMap.panelsMap.forEach((pane, paneKey) => data.push(processPaneToData(pane, paneKey, key)))
    ));
  } else {
    totalPanelsMap.forEach((pane, paneKey) => data.push(processPaneToData(pane, paneKey)));
  }
  return data;
}

export interface CustomizationSettingsProps {
  modal?: ModalChildrenProps;
}

const CustomizationSettings: FunctionComponent<CustomizationSettingsProps> = function CustomizationSettings(props) {
  const { modal } = props;
  const { customized, saveCustomized, totalPanelsMap, groupedPanelsMap, defaultActiveKey, actuallyDefaultActiveKey, propActiveKey, children, restoreDefault } = useContext(TabsContext);
  const oldCustomized: TabsCustomized = useMemo(() => customized ? merge<Partial<TabsCustomized>, TabsCustomized>({}, customized) : { panes: {} }, [customized]);
  const tempCustomized = useRef<TabsCustomized>(oldCustomized);
  const [customizedPanes, setCustomizedPanes] = useState<[Map<string, TabPaneProps>, Map<string, GroupPanelMap>]>(() => [totalPanelsMap, groupedPanelsMap]);
  const [defaultKey, setDefaultKey] = useState<string | undefined>(actuallyDefaultActiveKey);
  const panesDataSet = useMemo(() => new DataSet({
    data: normalizePanesToData(customizedPanes),
    paging: false,
    primaryKey: 'key',
    fields: [
      { name: 'group', group: true },
    ],
    events: {
      update({ record, name, value }) {
        const { current } = tempCustomized;
        const { key } = record;
        if (!current.panes[key]) {
          current.panes[key] = {};
        }
        current.panes[key][name] = value;
      },
    },
  }), [customizedPanes, tempCustomized]);
  const handleRestorePanes = useCallback((e: MouseEvent<any>) => {
    e.stopPropagation();
    const [newTotalPanelsMap, newGroupedPanelsMap] = normalizePanes(children);
    setCustomizedPanes([newTotalPanelsMap, newGroupedPanelsMap]);
    setDefaultKey(getDefaultActiveKey(newTotalPanelsMap, newGroupedPanelsMap, { activeKey: propActiveKey, defaultActiveKey }));
    tempCustomized.current = { panes: {} };
  }, [defaultActiveKey, propActiveKey, tempCustomized, children]);
  const handleDefaultKeyChange = useCallback((key: string) => {
    tempCustomized.current.defaultActiveKey = key;
    setDefaultKey(key);
  }, [tempCustomized]);
  const handleOk = useCallback(() => {
    saveCustomized(tempCustomized.current);
    if (modal) {
      modal.close();
    }
  }, [saveCustomized, tempCustomized, modal]);
  useEffect(() => {
    if (modal) {
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <>
            {cloneElement<ButtonProps>(okBtn, { onClick: handleOk })}
            {cancelBtn}
            <Button hidden={!restoreDefault} funcType={FuncType.link} color={ButtonColor.primary} onClick={handleRestorePanes} style={{ float: 'right' }}>
              {$l('Tabs', 'restore_default')}
            </Button>
          </>
        ),
      });
    }
  }, [modal]);
  return (
    <TabGroups dataSet={panesDataSet} defaultKey={defaultKey} onDefaultKeyChange={handleDefaultKeyChange} />
  );
};

CustomizationSettings.displayName = 'CustomizationSettings';

export default observer(CustomizationSettings);
