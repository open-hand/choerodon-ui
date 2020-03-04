import React from 'react';
import Pagination from '..';
import DataSet from '../../data-set';

export default class PaginationTest extends React.Component {
  ds = new DataSet({
    autoQuery: true,
    name: 'user',
    pageSize: 20,
  });

  render() {
    return <Pagination showPager {...this.props} dataSet={this.ds} />;
  }
}
