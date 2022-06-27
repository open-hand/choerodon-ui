import Pagination from '../rc-components/pagination/locale/en_US';
import DatePicker from '../date-picker/locale/en_US';
import TimePicker from '../time-picker/locale/en_US';
import Calendar from '../calendar/locale/en_US';
import Cascader from '../rc-components/cascader/locale/en_US';

export default {
  locale: 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  Cascader,
  Table: {
    filterTitle: 'Filter menu',
    filterConfirm: 'OK',
    filterReset: 'Reset',
    emptyText: 'No data',
    selectAll: 'Select current page',
    selectInvert: 'Invert current page',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Cancel',
  },
  Transfer: {
    titles: ['', ''],
    notFoundContent: 'Not Found',
    searchPlaceholder: 'Search here',
    itemUnit: 'item',
    itemsUnit: 'items',
  },
  Select: {
    notFoundContent: 'Not Found',
    selectAll: 'Select All',
    selectNone: 'None',
    filterPlaceholder: 'Input for filter',
  },
  Upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    confirmRemove: 'Are you sure to delete the file?',
    confirmReUpload: 'Are you sure to reupload?',
    reUpload: 'Upload again',
  },
  Collapse: {
    fold: 'Fold',
    unfold: 'Unfold',
  },
  imageCrop: {
    editImage: 'Edit image',
    avatarUploadError: 'Avatar upload error',
    avatarServerError: 'Upload server error',
    avatarUpload: 'Picture upload',
    avatarReminder: `Here you can crop, rotate, and click "Save" Complete the avatar modification`,
    preview: 'Preview',
    reUpload: 'Upload again',
    imageTooLarge:'The picture is too large, please upload again',
    imageUploadError:'Image upload error',
    imageDragHere:'Please drag the picture here',
    pleaseUpload: 'Please upload, less than',
    uploadType:`and the type of picture is `,
    picture: '',
    cancelButton:'Cancel',
    saveButton:'Save',
    changeAvatar:'Modify avatar',
  },
  PerformanceTable: {
    emptyMessage: 'No data found',
    loading: 'Loading...',
  },
  Notification: {
    total: 'A total of',
    message: 'messages',
    closeAll: 'Close all',
  },
};
