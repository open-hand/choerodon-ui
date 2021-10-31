import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

const template = {
  creationDate: '2021-09-03 15:57:39',
  createdBy: 25,
  lastUpdateDate: '2021-09-03 15:57:39',
  lastUpdatedBy: 25,
  objectVersionNumber: 1,
  _token:
    'WBNovgcQn7gFNmRPkVWyZmLRG8f1OgTzE8WjA98WlgfrUKjSG3s3RLLZhwBO8UAWlQzWLwBYxJunxnQZtDZ+zFLAISGdg3N0ifurKcejVmoU2QjFc3ACLhKba+Lk8NegCuDKN+6jgKCQ+1CaHjsgcX92opAi3CgKfvJFRk323VA=',
  businessObjectRelationId: '=L8-NXHp_X9x3I6IzxjuscBXkDK-SxU15OW9FONvtouE==',
  businessObjectId: '=ByrKpV7mRrCOXs_A34jIAg7-NJT3OEKaTPvdD8nKgJw==',
  relateBusinessObjectCode: 'heto_contract_trading',
  parentBusinessObjectFieldCode: 'partner',
  relateType: 'LINK',
  orderSeq: '1',
  tenantId: 0,
  relateBusinessObjectFieldCode: null,
  relBusinessObjectName: '交易方',
  relBusinessObjectFieldName: '交易方',
  businessObjectRelationFieldList: [],
  businessObjectRelationList: null,
  relBusinessObjectFieldId: null,
  componentType: null,
};
const fieldTemplate = {
  creationDate: null,
  createdBy: null,
  lastUpdateDate: null,
  lastUpdatedBy: null,
  objectVersionNumber: 1,
  _token:
    'WBNovgcQn7gFNmRPkVWyZmLRG8f1OgTzE8WjA98WlgfrUKjSG3s3RLLZhwBO8UAWlQzWLwBYxJunxnQZtDZ+zPyI8LzB6FeaLBT8GKF09Qpf5LAY3mdvVkgS+bHL2/zvS0NbAkXENtbm6U3k8ClBzhpCDIrrHvoldyLfhaYcx1GZkwCE36qMrTka9tXVb5xt',
  businessObjectRelationFieldId:
    '=BrMInoE3beHbz4Td5n2MFtpAYfAAmRhArZ9toMUEd2g==',
  businessObjectRelationId: '=L8-NXHp_X9x3I6IzxjuscBXkDK-SxU15OW9FONvtouE==',
  businessObjectCode: 'heto_contract_trading',
  businessObjectFieldCode: 'createdBy',
  aliasName: '创建人2',
  displayName: null,
  tenantId: 0,
  businessObjectFieldName: '创建人',
  componentType: 'NUMBER_FIELD',
  businessObjectFieldId: 221555985198661630,
  businessObjectName: '交易方',
};

const App = () => {
  const [editable, setEditable] = React.useState(false);
  const data = React.useMemo(() => {
    // 创建模型
    const list = [];
    for (let i = 0; i < 3; i++) {
      const child = [];
      const _data1 = { ...template };
      Object.assign(_data1, {
        relBusinessObjectId: i,
        id: i,
      });
      // 创建字段
      for (let j = 0; j < 100; j++) {
        const _data2 = { ...fieldTemplate };
        Object.assign(_data2, { parentId: i });
        Object.assign(_data2, { id: `${i}-${j}` });
        child.push(_data2);
      }
      _data1.businessObjectRelationFieldList = child;
      list.push(_data1);
    }
    return list;
  }, []);

  const rightFieldInformationDs = React.useMemo(
    () =>
      new DataSet({
        primaryKey: 'id',
        autoQuery: false,
        childrenField: 'businessObjectRelationFieldList',
        expandField: 'expand',
        paging: false,
        autoLocateFirst: false,
        data,
        fields: [
          { name: 'id', type: 'string' },
          { name: 'parentId', type: 'string', parentFieldName: 'id' },
          {
            name: 'businessObjectFieldName',
            type: 'string',
            label: '字段名称',
          },
          {
            name: 'displayName',
            type: 'string',
            label: '字段显示名称',
          },
          {
            name: 'aliasName',
            type: 'string',
            label: '字段编码',
          },
          {
            name: 'componentType',
            type: 'string',
            label: '字段类型',
          },
        ],
      }),
    [],
  );

  const columns = React.useMemo(
    () => [
      {
        name: 'businessObjectFieldName',
        tooltip: 'overflow',
      },
      {
        name: 'displayName',
        tooltip: 'overflow',
      },
      {
        name: 'aliasName',
        tooltip: 'overflow',
      },
      {
        width: 100,
        name: 'componentType',
        tooltip: 'overflow',
        editor: true,
      },
    ],
    [],
  );

  return (
    <>
      <Button onClick={() => console.log(rightFieldInformationDs.toJSONData())}>
        toJSONData
      </Button>
      <Table
        mode="tree"
        selectionMode="treebox"
        dataSet={rightFieldInformationDs}
        columns={columns}
        style={{ height: 300 }}
        defaultRowExpanded
      />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
