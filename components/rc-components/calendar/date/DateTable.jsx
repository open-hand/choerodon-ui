import React, { Component } from 'react';
import DateTHead from './DateTHead';
import DateTBody from './DateTBody';

export default
class DateTable extends Component {
  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    return (<table className = {`${prefixCls}-table`} cellSpacing="0" role="grid">
      <DateTHead {...props}/>
      <DateTBody {...props}/>
    </table>);
  }
}
