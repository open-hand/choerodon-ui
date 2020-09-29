import React from 'react';
import { mount } from 'enzyme';
import Skeleton from '../index';
import mountTest from '../../../tests/shared/mountTest';
import { TextArea,Button, DataSet } from '../../index';
import {Avatar,Row, Col} from '../../../components'


describe('Skeleton', () => {

  function handleDataSetChange({ record }) {
     return {record}
  }
  function sleep(d){
    for(let t = Date.now();Date.now() - t <= d;);
  }
  class SkeletonTest extends React.Component {
      ds = new DataSet({
        autoQuery: true,
        queryUrl: '/tree.mock',
        fields: [
          {
            name: 'text',
            type: 'string',
            defaultValue: 'textarea',
          },
        ],
        events: {
          update: handleDataSetChange,
          beforeLoad:() => sleep(5000),
        },
      });

      render() {
        return (
          <div className="article">
          <Skeleton dataSet={this.ds} skeletonTitle={false}  active avatar paragraph={{ rows: 4 }}>
                <Avatar style={{verticalAlign: 'top'}}    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                <TextArea cols={60} rows={6}  dataSet={this.ds} name="text" resize="both" />
          </Skeleton>
          <Row>
            <Col span={24}>
            <Button onClick={() => this.ds.query() } >Show Skeleton </Button>
            </Col>
          </Row>
          </div>
        )
      }
  }

  mountTest(Skeleton);

  it('should show skeleton when dataSet status is loading ', () => {
    const wapper = mount(<SkeletonTest/>)
    expect(wapper.find('.c7n-skeleton-content').length).toBe(1)
  });


});
