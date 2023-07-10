import React, { FunctionComponent, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import Icon from '../../../icon';
import TabsContext from '../../TabsContext';
import ItemTitle from './ItemTitle';

export interface ItemProps {
  record: Record;
  index: number;
  defaultKey?: string | undefined;
  records: Record[];
  suffix: (record: Record, index, records: Record[]) => ReactNode;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

const Item: FunctionComponent<ItemProps> = function Item(props) {
  const { prefixCls, tabDraggable, defaultChangeable } = useContext(TabsContext);
  const selfPrefixCls = `${prefixCls}-customization-group-item`;
  const { suffix, record, index, records, provided, snapshot, defaultKey } = props;
  const sort = record.get('sort');
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);
  const { isDragging } = snapshot;

  useEffect(() => {
    setIsHover(false);
  }, [sort]);

  function getIcon() {
    if (tabDraggable) {
      const iconProps = { ...provided.dragHandleProps, style: { cursor: 'move' } };
      return (
        <Icon className={`${selfPrefixCls}-drag-icon`} type="baseline-drag_indicator"  {...iconProps} />
      );
    }
  }

  const divProps = tabDraggable ? {
    ref: provided.innerRef,
    ...provided.draggableProps,
    className: classNames({ [`${selfPrefixCls}-dragging`]: isDragging }),
  } : {};

  return (
    <div {...divProps}>
      <div
        className={classNames(selfPrefixCls, { [`${selfPrefixCls}-hover`]: isHover })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`${selfPrefixCls}-content`}>
          {getIcon()}
          <div className={`${selfPrefixCls}-title`}>
            <span className={`${selfPrefixCls}-title-text`}>
              <ItemTitle
                record={record}
                provided={tabDraggable ? provided : undefined}
              />
              {
                defaultChangeable && defaultKey === record.get('key') && (
                  <span className={`${selfPrefixCls}-title-default`}>{$l('Tabs', 'default')}</span>
                )
              }
            </span>
          </div>
          {suffix(record, index, records)}
        </div>
      </div>
    </div>
  );
};

Item.displayName = 'Item';

export default observer(Item);
