import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui/pro';

function dayRenderer(props, text, currentDate) {
  const dayInWeek = currentDate.get('d');
  if (dayInWeek === 0 || dayInWeek === 1) {
    props.style = { color: 'red' };
  }
  return <td {...props} />;
}

function cellRenderer(view) {
  if (view === 'date') {
    return dayRenderer;
  }
}

ReactDOM.render(
  <DatePicker placeholder="Select date" cellRenderer={cellRenderer} />,
  document.getElementById('container')
);
