import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';
import { DragDropContext } from 'react-beautiful-dnd';

const { Column } = Table;

const RenderLeftTable = ({ dataSet }) => {
  return (
    <Table
      name="table"
      id="source"
      dataSet={dataSet}
      rowDraggable
      customDragDropContenxt
    >
      <Column name="userid" />
      <Column name="name" />
    </Table>
  );
};

const RenderRightTable = ({ dataSet }) => {
  return (
    <Table
      name="table"
      id="target"
      dataSet={dataSet}
      rowDraggable
      customDragDropContenxt
    >
      <Column name="userid" />
      <Column name="name" />
    </Table>
  );
};

class App extends React.Component {
  sourceDs = new DataSet({
    primaryKey: 'userid',
    data: [
      { userid: '1', name: '彭霞' },
      { userid: '2', name: '孔秀兰' },
      { userid: '3', name: '孟艳' },
      { userid: '4', name: '邱芳' },
    ],
    paging: false,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        required: true,
      },
    ],
  });

  targetDs = new DataSet({
    primaryKey: 'userid',
    data: [
      { userid: '5', name: '张三' },
      { userid: '6', name: '李四' },
    ],
    paging: false,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        required: true,
      },
    ],
  });

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    if (source.droppableId === 'source') {
      const dragRecord = this.sourceDs.records.find(
        (x) => String(x.key) === draggableId,
      );
      if (source.droppableId !== destination.droppableId) {
        this.sourceDs.remove(dragRecord, true);
        this.targetDs.create(dragRecord.toData(), destination.index);
      } else {
        this.sourceDs.remove(dragRecord, true);
        this.sourceDs.splice(destination.index, 0, dragRecord);
        this.sourceDs.locate(destination.index);
      }
    } else {
      const dragRecord = this.targetDs.records.find(
        (x) => String(x.key) === draggableId,
      );
      if (source.droppableId !== destination.droppableId) {
        this.targetDs.remove(dragRecord, true);
        this.sourceDs.create(dragRecord.toData(), destination.index);
      } else {
        this.targetDs.remove(dragRecord, true);
        this.targetDs.splice(destination.index, 0, dragRecord);
        this.targetDs.locate(destination.index);
      }
    }
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '49%' }}>
            <RenderLeftTable dataSet={this.sourceDs} />
          </div>

          <div style={{ width: '49%' }}>
            <RenderRightTable dataSet={this.targetDs} />
          </div>
        </div>
      </DragDropContext>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
