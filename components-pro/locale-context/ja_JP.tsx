import { Lang } from './enum';
import { Locale } from './locale';

const locale: Locale = {
  lang: Lang.ja_JP,
  Table: {
    show_cached_seletion: '選択したすべてのレコードを表示',
    hide_cached_seletion: '選択したすべてのレコードを非表示にする',
    edit_button: '編集',
    create_button: '追加',
    save_button: 'セーブ',
    cancel_button: 'キャンセル',
    delete_button: '削除',
    remove_button: '削除',
    reset_button: 'リセット',
    query_button: 'クエリ',
    expand_button: '展開',
    collapse_button: '折り畳み',
    export_button: '書き出す',
    advanced_search: '高度な検索',
    dirty_info: '表示条件が変更されました',
    restore: '復元',
    empty_data: 'データがまだありません',
    choose_export_columns: 'エクスポートする列を選択してください',
    column_name: '列名',
    filter_bar_placeholder: 'フィルターテーブル',
    advanced_query: '高度なクエリ',
    advanced_query_conditions: '高度なクエリ条件',
  },
  Pagination: {
    page: 'ページ',
    jump_to: 'ジャンプする',
    records_per_page: 'ページあたりの行数:',
  },
  Upload: {
    file_selection: 'ファイルを選択',
    click_to_upload: 'クリックアップロード',
    upload_success: 'アップロード成功',
    upload_failure: 'アップロードに失敗しました',
    no_file: 'ファイルなし',
    upload_path_unset: 'アップロードパスが設定されていません',
    not_acceptable_prompt: 'アップロードタイプのファイルが一致しません。予想:',
    file_list_max_length: 'ファイル数が上限を超えています',
  },
  Modal: {
    ok: 'OK',
    cancel: 'キャンセル',
  },
  DataSet: {
    unsaved_data_confirm: '未保存のデータがあります。続行しますか？ ',
    invalid_query_dataset: 'クエリ条件セットがパスしません',
    delete_selected_row_confirm: '選択した行を削除してもよろしいですか？ ',
    delete_all_row_confirm: '本当にすべての行を削除しますか？ ',
    query_failure: 'クエリに失敗しました',
    submit_success: '送信に成功しました',
    submit_failure: '送信に失敗しました',
    cannot_add_record_when_head_no_current:
      'ヘッダーが選択されていません。新しい行レコードを作成できません',
  },
  DatePicker: {
    value_missing_no_label: '日付を選択してください。',
    value_missing: '{label}を選択してください。',
    type_mismatch: '有効な日付を入力してください。',
    ok: 'OK',
    today: '今日',
    now: 'この瞬間',
    this_week: '今週',
  },
  EmailField: {
    value_missing_no_label: 'メールアドレスを入力してください',
    value_missing: '{label}を入力してください。',
    type_mismatch: '有効なメールアドレスを入力してください',
  },
  IntlField: {
    modal_title: '多言語情報を入力してください',
  },
  NumberField: {
    value_missing_no_label: '数字を入力してください',
    value_missing: '{label}を入力してください。',
  },
  Radio: {
    value_missing_no_label: '選択してください。',
    value_missing: '{label}を選択してください。',
  },
  SelectBox: {
    value_missing_no_label: '選択してください。',
    value_missing: '{label}を選択してください。',
  },
  Select: {
    value_missing_no_label: '選択してください。',
    value_missing: '{label}を選択してください。',
    no_matching_results: '一致結果はありません。',
    select_all: 'すべて選択',
    unselect_all: 'いや',
  },
  Lov: {
    choose: '選択してください',
  },
  Transfer: {
    items: 'アイテム',
  },
  UrlField: {
    value_missing_no_label: 'urlを入力してください。',
    value_missing: '{label}を入力してください。',
    type_mismatch: '有効なurlを入力してください。',
  },
  ColorPicker: {
    value_missing_no_label: '色を選択してください',
    value_missing: '{label}を選択してください。',
    type_mismatch: '有効な色を選択してください。',
  },
  Validator: {
    bad_input: '数字を入力してください。',
    pattern_mismatch: '有効な値を入力してください。',
    range_overflow: '{label}は{max}以下でなければなりません。',
    range_underflow: '{label}は{min}以上でなければなりません。',
    step_mismatch: '有効な値を入力してください。 最も近い有効な値は{0}です。',
    step_mismatch_between:
      '有効な値を入力してください。 最も近い有効な2つの値は、それぞれ{0}と{1}です。',
    too_long:
      'コンテンツを{maxlength}以下の文字に減らしてください（現在は{length}文字を使用しています）。',
    too_short:
      'コンテンツを{minlength}以上の文字に増やしてください（現在は{length}文字を使用しています）。',
    type_mismatch: 'タイプに一致する有効な値を入力してください。',
    value_missing_no_label: 'このフィールドに入力してください。',
    value_missing: '{label}を入力してください。',
    unique: 'このフィールドの値は一意ではありません。再入力してください。',
    unknown: '不明なエラー。',
  },
  Icon: {
    icons: 'アイコン',
    whatsNew: '追加',
    direction: '方向性',
    suggestion: 'プロンプト提案',
    edit: 'クラスの編集',
    data: 'データクラス',
    other: 'Webサイト全般',
    series: 'セット',
  },
};

export default locale;
