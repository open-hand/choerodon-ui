import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import toFragment from '../../util/Children/mapSelf';
import cx from 'classnames';
import TodayButton from '../calendar/TodayButton';
import OkButton from '../calendar/OkButton';
import TimePickerButton from '../calendar/TimePickerButton';

const CalendarFooter = createReactClass({
  onSelect(value) {
    this.props.onSelect(value);
  },

  getRootDOMNode() {
    return ReactDOM.findDOMNode(this);
  },

  render() {
    const props = this.props;
    const { value, prefixCls, showOk, timePicker, renderFooter } = props;
    let footerEl = null;
    const extraFooter = renderFooter();
    if (props.showToday || timePicker || extraFooter) {
      let nowEl;
      if (props.showToday) {
        nowEl = <TodayButton {...props} value={value} />;
      }
      let okBtn;
      if (showOk === true || showOk !== false && !!props.timePicker) {
        okBtn = <OkButton {...props} />;
      }
      let timePickerBtn;
      if (!!props.timePicker) {
        timePickerBtn = <TimePickerButton {...props} />;
      }

      let footerBtn;
      if (nowEl || timePickerBtn || okBtn) {
        footerBtn = (<span className={`${prefixCls}-footer-btn`}>
          {toFragment([nowEl, timePickerBtn, okBtn])}
        </span>);
      }
      const cls = cx({
        [`${prefixCls}-footer`]: true,
        [`${prefixCls}-footer-show-ok`]: okBtn,
      });
      footerEl = (
        <div className={cls}>
          {extraFooter}
          {footerBtn}
        </div>);
    }
    return footerEl;
  },
});

export default CalendarFooter;
