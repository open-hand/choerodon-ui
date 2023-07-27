import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Output, Button, Row, Col } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

function handleOption({ record }) {
  return {
    disabled: record.index === 0,
  };
}

class App extends React.Component {
  flag = false;

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
      {
        name: 'lov2',
        type: 'string',
        lookupCode: 'SHI',
        defaultValue: ['QP', 'XH', 'HD'],
        multiple: true,
      },
    ],
    events: {
      update: handleDataSetChange,
      create({ dataSet, record }) {
        dataSet.addField('status', {
          name: 'status',
          computedProps: {
            lookupAxiosConfig: ({ record }) =>
              record && {
                url: record.get('sex')
                  ? '/common/code/HR.EMPLOYEE_GENDER/'
                  : '/common/code/SYS.USER_STATUS/',
                transformResponse(data) {
                  try {
                    const jsonData = JSON.parse(data);
                    console.log('transformResponse', jsonData);
                    return jsonData.rows || jsonData;
                  } catch (e) {
                    return data;
                  }
                },
              },
          },
        });
        record.init('status', 'ACTV');
      },
    },
  });

  changeLookupCode = () => {
    this.flag = !this.flag;
    this.ds
      .getField('sex')
      .set('lookupCode', this.flag ? 'SYS.USER_STATUS' : 'HR.EMPLOYEE_GENDER');
  };

  render() {
    if (!this.ds.current) {
      return null;
    }
    return (
      <Row gutter={10}>
        <p style={{ marginTop: 10 }}>绑定数据源，字段配置 lookupCode：</p>
        <Col span={6}>
          <Select
            dataSet={this.ds}
            name="sex"
            placeholder="请选择"
            onOption={handleOption}
            // trigger={['hover']} 修改触发方式
          />
        </Col>
        <Col span={6}>
          <Button onClick={this.changeLookupCode}>修改lookupCode</Button>
        </Col>
        <Col span={12}>
          {/* 下拉选择值关联展示 */}
          <Output dataSet={this.ds} name="status" placeholder="请选择" />
        </Col>
        <Col span={24}>
          <p style={{ marginTop: 10 }}>多选 tag 相关配置，支持更多展示:</p>
        </Col>
        <Col span={24}>
          <Select
            dataSet={this.ds}
            name="lov2"
            placeholder="请选择"
            maxTagCount={2}
            maxTagTextLength={2}
            maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
            // trigger={['hover']}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
