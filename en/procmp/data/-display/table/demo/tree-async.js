import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button, Icon, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import axios from 'axios';
import classNames from 'classnames';

const { Column } = Table;

function iconRenderer({ record, text }) {
  return [
    <Icon key="icon" type={record.get('icon')} />,
    <span key="text">{text}</span>,
  ];
}

function expandedRowRenderer({ record }) {
  return (
    <p style={{ display: 'none' }}>
      功能代码：{record.get('functionCode')} 入口页面：{record.get('url')}
    </p>
  );
}

// icon 渲染问题， 首先判断record的值和自定义状态来判断出叶节点和父节点进行不同的渲染
function expandicon({
  prefixCls,
  expanded,
  expandable,
  needIndentSpaced,
  record,
  onExpand,
}) {
  if (record.get('parentId')) {
    // 子结点渲染
    return <span style={{ paddingLeft: '0.18rem' }} />;
  }

  if (record.getState('loadding') === true) {
    // 自定义状态渲染
    return <Spin tip="loading" delay={200} size="small" />;
  }

  const iconPrefixCls = `${prefixCls}-expand-icon`;
  const classString = classNames(iconPrefixCls, {
    [`${iconPrefixCls}-expanded`]: expanded,
  });
  return (
    <Icon
      type="baseline-arrow_right"
      className={classString}
      onClick={onExpand}
      tabIndex={expandable ? 0 : -1}
    />
  );
}

@observer
class AddChildButton extends React.Component {
  render() {
    const { dataSet, ...otherProps } = this.props;
    const { current } = dataSet;
    return <Button {...otherProps} disabled={!current || !current.get('id')} />;
  }
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree-async.mock',
    submitUrl: '/tree-async.mock',
    autoQuery: true,
    parentField: 'parentId',
    idField: 'id',
    expandField: 'expand',
    checkField: 'ischecked',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'text', type: 'string', label: '功能名称' },
      { name: 'url', type: 'string', label: '入口页面' },
      { name: 'expand', type: 'boolean', label: '是否展开' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', order: 'asc' },
      { name: 'parentId', type: 'number', parentFieldName: 'id' },
    ],
    events: {
      indexchange: ({ current }) => console.log('current user', current),
      submit: ({ data }) => console.log('submit tree data', data),
    },
  });

  handleCreateChild = () => {
    console.log(this.ds.current.get('id'));
    this.ds.create({ parentId: this.ds.current.get('id') });
  };

  // 点击展开
  handleExpand = (expanded, record) => {
    const that = this;
    const thisParentId = record.get('id');
    // 判断节点是否异步加载子结点
    if (expanded && !record.children) {
      record.setState('loadding', true);
      axios
        .get('/tree-async.mock')
        .then((res) => {
          const data = this.ds.toData();
          let remianData = [];
          // 如果想全部子结点更新可以使用下面的方法
          if (record.children) {
            remianData = data.filter((recorditem) => {
              return record.children.every((item) => {
                if (thisParentId === item.get('parentId')) {
                  return recorditem.id !== item.get('id');
                }
                return true;
              });
            });
          } else {
            remianData = data;
          }
          // 获取子结点数据，绑定父节点
          const recordsChildren = res.data.rows.map((item) => {
            item.parentId = thisParentId;
            item.id = Math.random() * 100;
            return item;
          });
          record.setState('loadding', false);
          // 生成完成的dataSet数据注意会触发loading event
          that.ds.loadData([...remianData, ...recordsChildren]);
        })
        .catch((err) => {
          console.log(err);
          record.setState('loadding', false);
        });
    }
  };

  buttons = [
    'save',
    'delete',
    'remove',
    'query',
    <AddChildButton
      key="add-child"
      dataSet={this.ds}
      onClick={this.handleCreateChild}
    >
      添加子节点
    </AddChildButton>,
  ];
  // expandIcon 渲染图标
  // expandedRowRenderer 这里保证可以触发节点的onExpand 事件

  render() {
    return (
      <Table
        className="tree-table-demo"
        mode="tree"
        onExpand={this.handleExpand}
        buttons={this.buttons}
        dataSet={this.ds}
        rowHeight={40}
        expandIcon={expandicon}
        expandedRowRenderer={expandedRowRenderer}
      >
        <Column name="text" renderer={iconRenderer} width={250} />
        <Column name="url" />
        <Column name="ischecked" />
        <Column name="expand" />
        <Column header="权限设置" width={150} align="center" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
