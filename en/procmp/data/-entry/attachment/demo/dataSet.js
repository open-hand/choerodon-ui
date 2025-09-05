import React from 'react';
import ReactDOM from 'react-dom';
import { Popover } from 'choerodon-ui';
import { Attachment, DataSet, Form, Button } from 'choerodon-ui/pro';

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
    label: '自定义下载模板按钮',
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
      <Attachment
        {...props}
        templateDownloadButtonRenderer={() => (
          <Popover title="模板标题" content="模板信息">
            <Button funcType="flat" style={{ marginLeft: 0 }}>
              下载模板
            </Button>
          </Popover>
        )}
      />
    </Form>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
