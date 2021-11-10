import React, { FunctionComponent, isValidElement, useCallback } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import ObserverTextField from 'choerodon-ui/pro/lib/text-field/TextField';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { getHeader } from '../../utils';

export interface ItemTitleProps {
  record: Record;
  provided: DraggableProvided | undefined;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = function ItemTitle(props) {
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
  const spanProps = provided ? {
    ...provided.dragHandleProps,
    style: { cursor: 'move' },
  } : {};
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
          <span {...spanProps}>
            {toJS(header)}
          </span>
        )
      }
    </>
  );
};

ItemTitle.displayName = 'ItemTitle';

export default observer(ItemTitle);
