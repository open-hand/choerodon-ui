import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { Attachment, useModal, Form, Output, Button } from 'choerodon-ui/pro';

const attachmentUUID1 = '4c74a34a-fa37-4e92-be9d-5cf726fb1472';
// const attachmentUUID2 = '88888888-fa37-4e92-be9d-5cf726fb1472';
const Children = ({ attRef }) => {
  const [value, setValue] = React.useState(attachmentUUID1);
  const [count, setCount] = React.useState(0);

  const handleTempAttachmentsChange = React.useCallback(
    (atts = []) => {
      setCount(atts.length);
    },
    [setCount],
  );

  const attProps = {
    label: '附件临时删除',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 9,
    value,
    onChange: setValue,
    removeImmediately: false,
    onTempRemovedAttachmentsChange: handleTempAttachmentsChange,
  };

  const removeFunc = React.useCallback(() => {
    if (attRef?.current?.tempRemovedAttachments?.length > 0) {
      attRef?.current?.remove();
    }
  }, [attRef]);

  const resetFunc = React.useCallback(() => {
    if (attRef?.current?.tempRemovedAttachments?.length > 0) {
      attRef?.current?.reset();
    }
  }, [attRef]);

  return (
    <Form>
      <Attachment {...attProps} ref={attRef} />
      <Output label="临时删除附件数" value={count} />
      <Button disabled={count === 0} onClick={removeFunc}>
        remove
      </Button>
      <Button disabled={count === 0} onClick={resetFunc}>
        reset
      </Button>
    </Form>
  );
};

const App = () => {
  const modal = useModal();
  const attRef = React.useRef();

  const handleOk = React.useCallback(() => {
    if (attRef?.current?.tempRemovedAttachments?.length > 0) {
      const { remove } = attRef.current;
      remove();
    }
  }, [modal, attRef]);

  const handleCancel = React.useCallback(() => {
    if (attRef?.current?.tempRemovedAttachments?.length > 0) {
      const { reset } = attRef.current;
      reset();
    }
  }, [modal, attRef]);
  return (
    <>
      <Button
        onClick={() => {
          modal.open({
            title: '临时删除附件',
            children: <Children attRef={attRef} />,
            onOk: handleOk,
            onCancel: handleCancel,
          });
        }}
      >
        Attachment In Modal
      </Button>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
