/* eslint-disable camelcase */
import { Lang } from './enum';
import zh_CN from './zh_CN';

export interface Locale {
  lang: Lang;
  DataSet: {
    unsaved_data_confirm: string;
    invalid_query_dataset: string;
    delete_selected_row_confirm: string;
    delete_all_row_confirm: string;
    query_failure: string;
    submit_success: string;
    submit_failure: string;
    cannot_add_record_when_head_no_current: string;
  };
  Validator: {
    bad_input: string;
    pattern_mismatch: string;
    range_overflow: string;
    range_underflow: string;
    step_mismatch: string;
    step_mismatch_between: string;
    too_long: string;
    too_short: string;
    type_mismatch: string;
    type_mismatch_email: string;
    type_mismatch_url: string;
    type_mismatch_date: string;
    type_mismatch_color: string;
    value_missing: string;
    value_missing_no_label: string;
    unique: string;
    unknown: string;
  };
}

export default zh_CN;
