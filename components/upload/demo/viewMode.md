---
order: 8
title:
  zh-CN: 展示模式
  en-US: View Mode
---

## zh-CN

通过 `viewMode` 设置上传列表的展示模式，通过 `listType` 设置上传列表样式。

## en-US

Set the display mode of upload list by `viewMode`, and set the style of upload list by `listType`.

````jsx
import { Upload, Icon, Modal, Select, Button } from 'choerodon-ui';

const { Option } = Select;

class ViewModeUpload extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    viewMode: 'popup',
    listType: 'picture-card',
    fileList: [{
      uid: -1,
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    }, {
      uid: -2,
      name: 'document.pdf',
      status: 'done',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'application/pdf',
    }],
  };

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
      previewTitle: file.name,
    });
  }

  handleChange = ({ fileList }) => this.setState({ fileList })

  handleViewModeChange = viewMode => this.setState({ viewMode })

  handleListTypeChange = listType => this.setState({ listType })

  render() {
    const { previewVisible, previewImage, previewTitle, viewMode, listType, fileList } = this.state;
    const uploadButton = (
      <Button>
        <Icon type="file_upload" /> Click to Upload
      </Button>
    );

    return (
      <div>
        <div className="upload-view-mode-options">
          <span>viewMode: </span>
          <Select value={viewMode} style={{ width: 120 }} onChange={this.handleViewModeChange}>
            <Option value="list">list</Option>
            <Option value="popup">popup</Option>
          </Select>
          <span className="upload-view-mode-label">listType: </span>
          <Select value={listType} style={{ width: 140 }} onChange={this.handleListTypeChange}>
            <Option value="text">text</Option>
            <Option value="picture">picture</Option>
            <Option value="picture-card">picture-card</Option>
          </Select>
        </div>
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          viewMode={viewMode}
          listType={listType}
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
          {fileList.length >= 30 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} className="modal-preview-image" />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<ViewModeUpload />, mountNode);
````
