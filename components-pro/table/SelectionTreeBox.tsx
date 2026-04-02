import React, { FunctionComponent, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { stopPropagation } from 'choerodon-ui/lib/_util/EventManager';
import { SELECTION_KEY } from './TableStore';
import ObserverCheckBox from '../check-box/CheckBox';
import Record from '../data-set/Record';

export interface SelectionTreeBoxProps {
  record: Record;
}

const SelectionTreeBox: FunctionComponent<SelectionTreeBoxProps> = function SelectionTreeBox(props) {
  const { record } = props;
  const handleChange = useCallback(() => {
    const { dataSet } = record;
    if (dataSet) {
      if (record.isSelected) {
        dataSet.treeUnSelect(record);
      } else {
        dataSet.treeSelect(record);
      }
    }
  }, [record]);
  return (
    <ObserverCheckBox
      checked={record.isSelected}
      onChange={handleChange}
      onClick={stopPropagation}
      disabled={!record.selectable}
      data-selection-key={SELECTION_KEY}
      indeterminate={record.isSelectionIndeterminate}
      value
    />
  );
};

SelectionTreeBox.displayName = 'SelectionTreeBox';

export default observer(SelectionTreeBox);
