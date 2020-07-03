import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, Button, Form, Output } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  showUploadBtn: false,
  showPreviewImage: true,
};

class Demo extends React.Component {
  upload;

  saveUpload = (node) => (this.upload = node);

  handleBtnClick = () => {
    this.upload.startUpload();
  };

  render() {
    return (
      <Form header="文件管理">
        <Output
          label="选择Logo"
          renderer={() => <Upload ref={this.saveUpload} {...props} />}
        />
        <Button
          style={{ marginBottom: 10 }}
          color="primary"
          onClick={this.handleBtnClick}
        >
          提交
        </Button>
      </Form>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
