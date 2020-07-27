---
order: 3
title:
  zh-CN: 图片裁剪并上传
  en-US: image crop and upload
---

## zh-CN

图片裁剪并上传，不可以使用upload上传类型和上传前的钩子其他upload的配置可以正常使用。

## en-US

image crop and upload, you can't use the upload `beforeUpload`and `accept` of props , others can normal use .

```jsx
import { Icon, Modal,ImageCrop, Upload } from 'choerodon-ui';

class PicturesWall extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    fileList: [{
      uid: -1,
      name: 'xxx.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    }],
  };

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleChange = ({ fileList }) => this.setState({ fileList })

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="add" />
        <div className="c7n-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
      <ImageCrop grid aspect={12/13} serverCrop aspectControl>
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          requestFileKeys="imageCropArea"
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
      </ImageCrop>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<PicturesWall />, mountNode);

