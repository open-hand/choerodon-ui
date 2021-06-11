import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Tree, Switch, Icon } from 'choerodon-ui';

const treeData = [
  {
    title: 'parent 1',
    key: '0-0',
    icon: <Icon type="airline_seat_flat-o" />,
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        icon: <Icon type="airline_seat_flat-o" />,
        children: [
          {
            title: 'leaf',
            key: '0-0-0-0',
            icon: <Icon type="airline_seat_flat-o" />,
          },
          {
            title: (
              <>
                <div>multiple line title</div>
                <div>multiple line title</div>
              </>
            ),
            key: '0-0-0-1',
            icon: <Icon type="airline_seat_flat-o" />,
          },
          {
            title: 'leaf',
            key: '0-0-0-2',
            icon: <Icon type="airline_seat_flat-o" />,
          },
        ],
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        icon: <Icon type="airline_seat_flat-o" />,
        children: [
          {
            title: 'leaf',
            key: '0-0-1-0',
            icon: <Icon type="airline_seat_flat-o" />,
          },
        ],
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        icon: <Icon type="airline_seat_flat-o" />,
        children: [
          {
            title: 'leaf',
            key: '0-0-2-0',
            icon: <Icon type="airline_seat_flat-o" />,
          },
          {
            title: 'leaf',
            key: '0-0-2-1',
            icon: <Icon type="airline_seat_flat-o" />,
            switcherIcon: <Icon type="airline_seat_flat_angled-o" />,
          },
        ],
      },
    ],
  },
  {
    title: 'parent 2',
    key: '0-1',
    icon: <Icon type="airline_seat_flat-o" />,
    children: [
      {
        title: 'parent 2-0',
        key: '0-1-0',
        icon: <Icon type="airline_seat_flat-o" />,
        children: [
          {
            title: 'leaf',
            key: '0-1-0-0',
            icon: <Icon type="airline_seat_flat-o" />,
          },
          {
            title: 'leaf',
            key: '0-1-0-1',
            icon: <Icon type="airline_seat_flat-o" />,
          },
        ],
      },
    ],
  },
];

const Demo = () => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(false);
  const [showLeafIcon, setShowLeafIcon] = useState(true);

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
        showLine={showLine}
        showIcon={showIcon}
        defaultExpandedKeys={['0-0-0']}
        onSelect={onSelect}
        treeData={treeData}
      />
    </div>
  );
};

ReactDOM.render(<Demo />, document.getElementById('container'));
