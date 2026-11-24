import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Lov } from 'choerodon-ui/pro';

const dataSet = new DataSet({
  autoCreate: true,
  fields: [
    {
      name: 'duplicateValue',
      type: 'object',
      label: 'Duplicate value',
      lovCode: 'LOV_DUPLICATE_VALUE',
      multiple: true,
      lovDefineAxiosConfig: {
        adapter: async (config) => ({
          config,
          status: 200,
          statusText: 'OK',
          headers: {},
          data: {
            code: 'LOV_DUPLICATE_VALUE',
            title: 'Duplicate values',
            textField: 'description',
            valueField: 'code',
            width: 560,
            lovPageSize: '2',
            delayLoad: 'N',
            needQueryParam: 'N',
            editableFlag: 'Y',
            canPopup: 'Y',
            lovItems: ['code', 'description'].map((name, index) => ({
              display: name,
              gridFieldName: name,
              gridFieldWidth: 220,
              gridField: 'Y',
              conditionField: 'N',
              gridFieldSequence: index + 1,
            })),
          },
        }),
      },
      lovQueryAxiosConfig: (_code, _lovConfig, props) => {
        const { page = 1, pagesize = 2 } = props.params || {};
        return {
          url: `/common/lov/dataset/LOV_DUPLICATE_VALUE/${pagesize}/${page}`,
          adapter: async (config) => ({
            config,
            status: 200,
            statusText: 'OK',
            headers: {},
            data: {
              rows:
                page === 1
                  ? [
                      { code: 'DUPLICATE', description: 'Page 1 record A' },
                      { code: 'DUPLICATE', description: 'Page 1 record B' },
                    ]
                  : [
                      { code: 'DUPLICATE', description: 'Page 2 record A' },
                      { code: 'UNIQUE_PAGE_2', description: 'Page 2 record B' },
                    ],
              success: true,
              total: 4,
            },
          }),
        };
      },
    },
  ],
});

function App() {
  return [
    <Lov
      duplicateKey={{ disable: true, showWarning: true }}
      key="modal"
      dataSet={dataSet}
      name="duplicateValue"
      viewMode="modal"
      placeholder="Open to see duplicate values on page 1"
    />,
    <Lov
      duplicateKey={{ disable: true, showWarning: true }}
      key="popup"
      dataSet={dataSet}
      name="duplicateValue"
      placeholder="Open to see duplicate values on page 1"
      viewMode="popup"
    />,
  ];
}

ReactDOM.render(<App />, document.getElementById('container'));
