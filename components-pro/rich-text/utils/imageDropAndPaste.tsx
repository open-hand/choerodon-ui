import { transformZoomData } from "choerodon-ui/shared/util";

class ImageData {

  constructor(dataUrl, type) {
    // @ts-ignore
    this.dataUrl = dataUrl;
    // @ts-ignore
    this.type = type;
  }

  /* minify the image
  */
  minify(options = {}) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const maxWidth = options.maxWidth || 800;
      // @ts-ignore
      const maxHeight = options.maxHeight || 800;
      // @ts-ignore
      const quality = options.quality || .8;
      // @ts-ignore
      if (!this.dataUrl) {
        return reject({ message: '[error] QuillImageDropAndPaste: Fail to minify the image, dataUrl should not be empty.' });
      }
      const image = new Image();
      image.onload = () => {
        const width = image.width;
        const height = image.height;
        if (width > height) {
          if (width > maxWidth) {
            image.height = height * maxWidth / width;
            image.width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            image.width = width * maxHeight / height;
            image.height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext('2d');
        // @ts-ignore
        ctx.drawImage(image, 0, 0, image.width, image.height);
        // @ts-ignore
        const canvasType = this.type || 'image/png';
        const canvasDataUrl = canvas.toDataURL(canvasType, quality);
        resolve(new ImageData(canvasDataUrl, canvasType));
      };
      // @ts-ignore
      image.src = this.dataUrl;
    });

  }

  /* convert blob to file
  */
  toFile(filename) {
    if (!window.File) {
      console.error('[error] QuillImageDropAndPaste: Your browser didnot support File API.');
      return null;
    }
    // @ts-ignore
    return new File([this.toBlob()], filename, { type: this.type });
  }

  /* convert dataURL to blob
  */
  toBlob() {
    // @ts-ignore
    const base64 = this.dataUrl.replace(/^[^,]+,/, '');
    const buff = this.binaryStringToArrayBuffer(atob(base64));
    // @ts-ignore
    return this.createBlob([buff], { type: this.type });
  }

  /* generate array buffer from binary string
  */
  binaryStringToArrayBuffer(binary) {
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const arr = new Uint8Array(buffer);
    let i = -1;
    while (++i < len) arr[i] = binary.charCodeAt(i);
    return buffer;
  }

  /* create blob
  */
  createBlob(parts = [], properties = {}) {
    if (typeof properties === 'string') properties = { type: properties };
    try {
      return new Blob(parts, properties);
    } catch (e) {
      if (e.name !== 'TypeError') throw e;
      // @ts-ignore
      const Builder = typeof BlobBuilder !== 'undefined'
        // @ts-ignore
        ? BlobBuilder : typeof MSBlobBuilder !== 'undefined'
          // @ts-ignore
          ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined'
            // @ts-ignore
            ? MozBlobBuilder : WebKitBlobBuilder;
      const builder = new Builder();
      for (let i = 0; i < parts.length; i++) builder.append(parts[i]);
      // @ts-ignore
      return builder.getBlob(properties.type);
    }
  }
}

class ImageDropAndPaste {

  constructor(quill, options = {}) {
    // @ts-ignore
    this.quill = quill;
    // @ts-ignore
    this.options = options;
    this.handleDrop = this.handleDrop.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    // @ts-ignore
    this.quill.root.addEventListener('drop', this.handleDrop, false);
    // @ts-ignore
    this.quill.root.addEventListener('paste', this.handlePaste, false);
  }

  /* handle image drop event
  */
  handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      if (document.caretRangeFromPoint) {
        const selection = document.getSelection();
        const range = document.caretRangeFromPoint(transformZoomData(e.clientX), transformZoomData(e.clientY));
        if (selection && range) {
          selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
        }
      }
      this.readFiles(e.dataTransfer.files, (dataUrl, type) => {
        type = type || 'image/png';
        // @ts-ignore
        if (typeof this.options.handler === 'function') {
          // @ts-ignore
          this.options.handler.call(this, dataUrl, type, new ImageData(dataUrl, type));
        } else {
          this.insert.call(this, dataUrl, type);
        }
      }, e);
    }
  }

  /* handle image paste event
  */
  handlePaste(e) {
    if (e.clipboardData && e.clipboardData.items && e.clipboardData.items.length) {
      this.readFiles(e.clipboardData.items, (dataUrl, type) => {
        type = type || 'image/png';
        // @ts-ignore
        if (typeof this.options.handler === 'function') {
          // @ts-ignore
          this.options.handler.call(this, dataUrl, type, new ImageData(dataUrl, type));
        } else {
          this.insert(dataUrl);
        }
      }, e);
    }
  }

  /* read the files
  */
  readFiles(files, callback, e) {
    [].forEach.call(files, file => {
      var type = file.type;
      if (!type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i)) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (e) => {
        // @ts-ignore
        callback(e.target.result, type);
      };
      const blob = file.getAsFile ? file.getAsFile() : file;
      if (blob instanceof Blob) reader.readAsDataURL(blob);
    });
  }

  /* insert into the editor
  */
  insert(dataUrl) {
    // @ts-ignore
    const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
    // @ts-ignore
    this.quill.insertEmbed(index, 'image', dataUrl, 'user');
  }

}

// @ts-ignore
ImageDropAndPaste.ImageData = ImageData;

export default ImageDropAndPaste;
