---
order: 6
title:
  zh-CN: 拖拽属性拓展示例
  en-US: draggable
---

## zh-CN

通过配置draggable属性实现Tree组件整体拖拽、单个树节点拖拽以及拖拽图标的控制。

## en-US

By configuring the dragable property, the Tree component as a whole is dragged, a single tree node is dragged, and the drag icon is controlled.

````jsx
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
      //console.log('node info:', node);
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
      icon: <div style={{width: '100%', height: '100%', lineHeight: '24px', textAlign: 'center', border: '1px solid green'}}>🌳</div>,
    },
  },
];

function nodeRenderer({ record }) {
  if(!record) return null;
  return record.get('text');
}

class App extends React.Component {
  state = {
    title: 'true',
    draggable: true,
  }

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
      unSelect: ({ record, dataSet }) => console.log('unSelect', record, dataSet),
    },
  });

  onDrop = info => {
    let flag;
    const data = this.ds.toData();
    data.map(item => {
      if (item.id === info.dragNode.record.get('id')) {
        if (info.dropToGap) {
          const pId = info.node.record.parent ? info.node.record.parent.get('id') : undefined;
          flag = item.parentId === pId;
          item.parentId = pId;
      	} else {
          const pId = info.node.record.get('id');
          flag = item.parentId === pId;
        	item.parentId = pId;
        }
      }
      return item;
    });
    if (flag) return;
    this.ds.loadData(data);
  };

  handleChange = (val) => {
    draggableValues.forEach((item) => {
      if (item.title === val) this.setState({draggable: item.value, title: item.title});
    });
  }

  render() {
    const { draggable, title } = this.state;
    return (
      <>
        <Form labelAlign="left">
          <SelectBox
            vertical
            label="draggable"
            value={title}
            onChange={title => {
            draggableValues.forEach(item => {
              if (item.title === title) this.setState({draggable: item.value, title: title})
            });
          }}>
            {draggableValues.map(({title}) => {
              return <Option key={title} value={title}>
              {title}
            </Option>;
            })}
          </SelectBox>
        </Form>
        <Tree
          showLine={{
            showLeafIcon: false
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

ReactDOM.render(
  <App />,
  mountNode
);
````