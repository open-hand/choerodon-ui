import React from 'react';
import ReactDOM from 'react-dom';
import { Attachment, DataSet, Form } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'attachment',
            type: 'attachment',
            label: <span>技术附件</span>,
            max: 9,
            required: true,
            template: {
              attachmentUUID: '4c74a34a-fa37-4e92-be9d-5cf726fb1472',
            },
          },
        ],
      }),
    [],
  );
  const props = {
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    name: 'attachment',
    labelLayout: 'float',
    showValidation: 'newLine',
    viewMode: 'popup',
  };

  React.useEffect(() => {
    ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
    setTimeout(() => {
      ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
    }, 0);
    setTimeout(() => {
      ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
    }, 0);
  }, []);

  return (
    <Form dataSet={ds}>
      <Attachment {...props} />
    </Form>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
