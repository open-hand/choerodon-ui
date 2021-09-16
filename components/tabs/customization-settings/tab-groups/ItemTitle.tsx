import React, { FunctionComponent, isValidElement, useCallback } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import ObserverTextField from 'choerodon-ui/pro/lib/text-field/TextField';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { getHeader } from '../../utils';

export interface ItemTitleProps {
  record: Record;
  provided: DraggableProvided;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = observer(function ItemTitle(props) {
  const { record, provided } = props;
  const editing = record.getState('editing');
  const handleEditBlur = useCallback(() => {
    record.setState('editing', false);
  }, []);
  const handleHeaderChange = useCallback((value) => {
    record.set('title', value);
  }, [record]);
  const title = record.get('title');
  const header = getHeader({ tab: record.get('tab'), title });

  return (
    <>
      {
        editing ? (
          <ObserverTextField
            onBlur={handleEditBlur}
            value={isValidElement(header) ? title : header}
            onChange={handleHeaderChange}
            autoFocus
          />
        ) : (
          <span {...provided.dragHandleProps} style={{ cursor: 'move' }}>
            {toJS(header)}
          </span>
        )
      }
    </>
  );
});

ItemTitle.displayName = 'ItemTitle';

export default ItemTitle;
