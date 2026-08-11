import Pagination from '../rc-components/pagination/locale/ja_JP';
import DatePicker from '../date-picker/locale/ja_JP';
import TimePicker from '../time-picker/locale/ja_JP';
import Calendar from '../calendar/locale/ja_JP';
import Cascader from '../rc-components/cascader/locale/ja_JP';

export default {
  locale: 'ja',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  Cascader,
  Table: {
    filterTitle: 'メニューをフィルター',
    filterConfirm: 'OK',
    filterReset: 'リセット',
    emptyText: 'データがありません',
    selectAll: 'すべてを選択',
    selectInvert: '選択を反転',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'キャンセル',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'キャンセル',
  },
  Transfer: {
    notFoundContent: '結果はありません',
    searchPlaceholder: 'ここを検索',
    itemUnit: 'アイテム',
    itemsUnit: 'アイテム',
  },
  Select: {
    notFoundContent: '結果はありません',
  },
  Upload: {
    uploading: 'アップロード中...',
    removeFile: 'ファイルを削除',
    uploadError: 'アップロードエラー',
    previewFile: 'ファイルをプレビュー',
    confirmRemove: '削除を確認しますか？',
    confirmReUpload: '再アップロードしてもよろしいですか？',
    reUpload: '再アップロード',
    batchMaxFileCount: '今回は {count} 個のファイルが選択され、1 回のアップロードの上限である {max} 個を超えています。圧縮するか、分割してアップロードすることをお勧めします。続行すると、先頭の {max} 個のファイルのみアップロードされます。',
  },
  Collapse: {
    fold: '折る',
    unfold: '展開する',
  },
  imageCrop: {
    displayInActualSize: '実際のサイズで表示',
    aspectInputTitle: '裁断領域の幅高さ比、幅／高さ',
  },
  Notification: {
    total: '合計',
    message: 'つのメッセージ',
    closeAll: 'すべて閉じる',
  },
};
