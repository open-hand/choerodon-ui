---
order: 3
title:
  zh-CN: 可拖拽照片墙
  en-US: Pictures Wall
---

## zh-CN

用户可以上传图片并在列表中显示缩略图，可拖拽照片墙。当上传照片数到达限制后，上传按钮消失。

## en-US

After users upload picture, the thumbnail will be shown in list. The upload button will disappear when count meets limitation.

````jsx
import { Upload, Icon, Modal } from 'choerodon-ui';

class PicturesWall extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [{
      uid: -1,
      name: 'xxx.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },{
      uid: -2,
      name: 'xxx.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },{
      uid: -3,
      name: 'xxx.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    }, {
      uid: -4,
      name: 'test.jpg',
      status: 'done',
      url: 'https://s1.ax1x.com/2020/07/05/Up8j76.jpg',
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
  
  render() {
    const { previewVisible, previewImage, previewTitle, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="add" />
        <div className="c7n-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          dragUploadList
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} className="modal-preview-image"/>
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<PicturesWall />, mountNode);
````

````css
/* you can make up upload button and sample style by using stylesheets */
.c7n-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.c7n-upload-select-picture-card .c7n-upload-text {
  margin-top: 8px;
  color: #666;
}

.modal-preview-image {
  margin-top: 8px;
}
````
