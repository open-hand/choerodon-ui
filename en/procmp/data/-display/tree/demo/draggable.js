import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Tree, SelectBox, Form } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const draggableValues = [
  {
    title: 'true',
    value: true,
  },
  {
    title: 'false',
    value: false,
  },
  {
    title: "(node) => node.title !== '组织架构'",
    value: (node) => {
      console.log('node info:', node);
      return node.title !== '组织架构';
    },
  },
  {
    title: '{nodeDraggable: true, icon: true}',
    value: {
      // boolean or node => boolean, same to draggable
      nodeDraggable: true,
      // boolean or ReactNode
      icon: true,
    },
  },
  {
    title: '{nodeDraggable: true, icon: ReactNode}',
    value: {
      // boolean or node => boolean, same to draggable
      nodeDraggable: true,
      // boolean or ReactNode
      icon: (
        <div
          style={{
            width: '100%',
            height: '100%',
            lineHeight: '24px',
            textAlign: 'center',
            border: '1px solid green',
          }}
        >
          🌳
        </div>
      ),
    },
  },
];

function nodeRenderer({ record }) {
  if (!record) return null;
  return record.get('text');
}

function arraymove(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
  return arr;
}

class App extends React.Component {
  state = {
    title: 'true',
    draggable: true,
  };

  ds = new DataSet({
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
      unSelect: ({ record, dataSet }) =>
        console.log('unSelect', record, dataSet),
    },
  });

  onDrop = (info) => {
    const data = this.ds.toData();
    let dropIndex = 0;
    let dragIndex = 0;
    data.map((item, index) => {
      if (item.id === info.node.record.get('id')) {
        dropIndex = index;
      }
      if (item.id === info.dragNode.record.get('id')) {
        dragIndex = index;
        if (info.dropToGap) {
          const pId = info.node.record.parent
            ? info.node.record.parent.get('id')
            : undefined;
          item.parentId = pId;
        } else {
          const pId = info.node.record.get('id');
          item.parentId = pId;
        }
      }
      return item;
    });

    const dt = arraymove(
      data,
      dragIndex,
      info.dropPosition === -1 || dragIndex < dropIndex
        ? dropIndex
        : dropIndex + 1,
    );

    this.ds.loadData(dt);
  };

  handleChange = (val) => {
    draggableValues.forEach((item) => {
      if (item.title === val)
        this.setState({ draggable: item.value, title: item.title });
    });
  };

  render() {
    const { draggable, title } = this.state;
    return (
      <>
        <Form labelAlign="left">
          <SelectBox
            vertical
            label="draggable"
            value={title}
            onChange={(title) => {
              draggableValues.forEach((item) => {
                if (item.title === title)
                  this.setState({ draggable: item.value, title: title });
              });
            }}
          >
            {draggableValues.map(({ title }) => {
              return (
                <Option key={title} value={title}>
                  {title}
                </Option>
              );
            })}
          </SelectBox>
        </Form>
        <Tree
          showLine={{
            showLeafIcon: false,
          }}
          showIcon={false}
          dataSet={this.ds}
          checkable
          renderer={nodeRenderer}
          draggable={draggable}
          onDrop={this.onDrop}
        />
      </>
    );
  }
}
ReactDOM.render(<App />, document.getElementById('container'));
