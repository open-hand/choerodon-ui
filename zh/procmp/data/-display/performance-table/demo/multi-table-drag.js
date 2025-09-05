import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';
import { DragDropContext } from 'react-beautiful-dnd';

const Table = () => {
  const [sourceData, setSourceData] = React.useState(fakeData.slice(0, 10));
  const [targetData, setTargetData] = React.useState(fakeData.slice(10, 20));

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      resizable: true,
      fixed: true,
    },
    {
      title: '姓',
      dataIndex: 'lastName',
      key: 'lastName',
      width: 150,
    },
    {
      title: '名',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 350,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 300,
    },
    {
      title: '街道',
      dataIndex: 'street',
      key: 'street',
      width: 300,
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 500,
    },
  ];

  const handleDragEnd = React.useCallback(
    (result) => {
      const {
        source: { index: sIndex, droppableId: sDroppableId },
        destination: { index: dIndex, droppableId: dDroppableId },
      } = result;
      if (sDroppableId === dDroppableId) {
        let setData;
        if (sDroppableId === 'source') {
          setData = setSourceData;
        }
        if (sDroppableId === 'target') {
          setData = setTargetData;
        }
        setData((data) => {
          const temp = [...data];
          const dragData = temp.splice(sIndex, 1)[0];
          temp.splice(dIndex, 0, dragData);
          return temp;
        });
      } else if (sDroppableId === 'source') {
        const tempSourceData = [...sourceData];
        const tempTargetData = [...targetData];
        const dragData = tempSourceData.splice(sIndex, 1)[0];
        tempTargetData.splice(dIndex, 0, dragData);
        setSourceData(tempSourceData);
        setTargetData(tempTargetData);
      } else {
        const tempSourceData = [...sourceData];
        const tempTargetData = [...targetData];
        const dragData = tempTargetData.splice(sIndex, 1)[0];
        tempSourceData.splice(dIndex, 0, dragData);
        setSourceData(tempSourceData);
        setTargetData(tempTargetData);
      }
    },
    [sourceData, targetData, setSourceData, setTargetData],
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '49%' }}>
            <PerformanceTable
              shouldUpdateScroll={false}
              rowDraggable
              rowKey="id"
              columns={columns}
              height={400}
              data={sourceData}
              customDragDropContenxt
              id="source"
            />
          </div>
          <div style={{ width: '49%' }}>
            <PerformanceTable
              shouldUpdateScroll={false}
              rowDraggable
              rowKey="id"
              columns={columns}
              height={400}
              data={targetData}
              customDragDropContenxt
              id="target"
            />
          </div>
        </div>
      </DragDropContext>
    </>
  );
};

ReactDOM.render(<Table />, document.getElementById('container'));
