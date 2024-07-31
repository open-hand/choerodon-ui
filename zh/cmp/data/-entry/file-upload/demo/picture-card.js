import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, Icon, Modal } from 'choerodon-ui';

class PicturesWall extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [
      {
        uid: -1,
        name: 'image1.png',
        status: 'done',
        url:
          'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      },
    ],
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
      previewTitle: file.name,
    });
  };

  handleChange = ({ fileList }) => this.setState({ fileList });

  render() {
    const { previewVisible, previewImage, previewTitle, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="add" />
        <div className="c7n-upload-text">Upload</div>
      </div>
    );
    // showReUploadIcon: Upload 组件文件上传失败后是否显示重新上传按钮。当 listType 为 picture-card: true 为 icon, text 为文字形式; 其他 listType 都为文字形式
    return (
      <div className="clearfix">
        <Upload
          action="//jsonplaceholder.typicode.com/posts/"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          showUploadList={{
            showRemoveIcon: true,
            showPreviewIcon: true,
            showDownloadIcon: true,
            showReUploadIcon: 'text',
            removePopConfirmTitle: '是否要删除？',
            reUploadText: '重新上传？',
            reUploadPopConfirmTitle: '是否要重新上传？',
          }}
          pictureCardShowName
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img
            alt="example"
            style={{ width: '100%', marginTop: 8 }}
            src={previewImage}
          />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<PicturesWall />, document.getElementById('container'));
