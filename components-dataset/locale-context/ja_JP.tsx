import { Lang } from './enum';
import { Locale } from './locale';

const locale: Locale = {
  lang: Lang.ja_JP,
  DataSet: {
    unsaved_data_confirm: '未保存のデータがあります。続行しますか？ ',
    invalid_query_dataset: 'クエリ条件データセットの検証に失敗しました',
    delete_selected_row_confirm: '選択した行を削除してもよろしいですか？ ',
    delete_all_row_confirm: '本当にすべての行を削除しますか？ ',
    query_failure: 'クエリに失敗しました',
    submit_success: '送信に成功しました',
    submit_failure: '送信に失敗しました',
    cannot_add_record_when_head_no_current:
      'ヘッダーが選択されていません。新しい行レコードを作成できません',
    data_length_too_short: '少なくとも{length}のデータを保持してください',
    data_length_too_long: '{length}までデータを保持してください',
  },
  Validator: {
    bad_input: '数字を入力してください。',
    pattern_mismatch: '有効な値を入力してください。',
    range_overflow: '{label}は{max}以下でなければなりません。',
    range_underflow: '{label}は{min}以上でなければなりません。',
    range_overflow_excl: '{label}は{maxExcl}より小さくなければなりません。',
    range_underflow_excl: '{label}は{minExcl}より大きくなければなりません。',
    step_mismatch: '有効な値を入力してください。 最も近い有効な値は{0}です。',
    step_mismatch_between:
      '有効な値を入力してください。 最も近い有効な2つの値は、それぞれ{0}と{1}です。',
    too_long:
      'コンテンツを{maxlength}以下の文字に減らしてください（現在は{length}文字を使用しています）。',
    too_short:
      'コンテンツを{minlength}以上の文字に増やしてください（現在は{length}文字を使用しています）。',
    type_mismatch: 'タイプに一致する有効な値を入力してください。',
    type_mismatch_email: '有効なメールアドレスを入力してください。',
    type_mismatch_url: '有効なurlを入力してください。',
    type_mismatch_date: '有効な日付を入力してください。',
    type_mismatch_color: '有効な色を選択してください。',
    value_missing_no_label: 'このフィールドに入力してください。',
    value_missing: '{label}を入力してください。',
    unique: 'このフィールドの値は一意ではありません。再入力してください。',
    unknown: '不明なエラー。',
  },
  Attachment: {
    file_max_size: 'ファイルサイズは次を超えることはできません：{size}',
    file_type_mismatch: 'ファイルタイプの不一致、正しいタイプ：{types}',
  },
};

export default locale;
