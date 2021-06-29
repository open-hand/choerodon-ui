---
order: 4
title:
  zh-CN: 连接线
  en-US: Line
---

## zh-CN

连接线。

## en-US

Line.

````jsx
import { useState, useMemo } from 'react';
import { Tree, Switch, Icon, DataSet } from 'choerodon-ui/pro';

function nodeRenderer({ record }) {
  return record.get('text');
}

const Demo = () => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(false);
  const [showLeafIcon, setShowLeafIcon] = useState(true);
  const ds = useMemo(() => {
    return new DataSet({
      primaryKey: 'id',
      queryUrl: '/tree.mock',
      autoQuery: true,
      parentField: 'parentId',
      expandField: 'expand',
      idField: 'id',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'expand', type: 'boolean' },
        { name: 'parentId', type: 'number' },
      ],
      events: {
        select: ({ record, dataSet }) => console.log('select', record, dataSet),
        unSelect: ({ record, dataSet }) => console.log('unSelect', record, dataSet),
      },
    });
  }, []);

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const onSetLeafIcon = (checked) => {
    setShowLeafIcon(checked);
    setShowLine({
      showLeafIcon: checked,
    });
  };

  const onSetShowLine = (checked) => {
    setShowLine(
      checked
        ? {
          showLeafIcon,
        }
        : false,
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
        }}
      >
        showLine: <Switch checked={!!showLine} onChange={onSetShowLine} />
        <br />
        <br />
        showIcon: <Switch checked={showIcon} onChange={setShowIcon} />
        <br />
        <br />
        showLeafIcon: <Switch checked={showLeafIcon} onChange={onSetLeafIcon} />
      </div>
      <Tree
        dataSet={ds}
        showLine={showLine}
        showIcon={showIcon}
        icon={(props) => <Icon type={props.data.record.get('icon') || 'airline_seat_flat-o'} />}
        onSelect={onSelect}
        renderer={nodeRenderer}
      />
    </div>
  );
};

ReactDOM.render(<Demo />, mountNode);
````
