import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'choerodon-ui';
import { Form, TimePicker, DateTimePicker, SelectBox } from 'choerodon-ui/pro';
import moment from 'moment';

const { Option } = SelectBox;
const App = () => {
  const [value, setValue] = React.useState(() => moment());
  const [isGMT, setIsGMT] = React.useState(true);
  // const timeZone = React.useMemo(() => {}, [isGMT]);

  React.useEffect(() => {
    configure({
      formatter: {
        timeZone: isGMT
          ? ' ([GTM]+8)'
          : (moment) => (
              <span key="timeZone" style={{ color: 'gray' }}>
                {' '}
                {moment.format('Z')}
              </span>
            ),
      },
    });
  }, [isGMT]);
  return (
    <Form>
      <SelectBox value={isGMT} onChange={setIsGMT}>
        <Option value>GMT</Option>
        <Option value={false}>UTC</Option>
      </SelectBox>
      <DateTimePicker value={value} onChange={setValue} />
      <TimePicker value={value} onChange={setValue} timeZone="ZZ" />
    </Form>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
