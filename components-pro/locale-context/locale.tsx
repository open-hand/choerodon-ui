import { Lang } from './enum';
import zh_CN from './zh_CN';

export interface Locale {
  lang: Lang;
  Table: {
    show_cached_seletion;
    hide_cached_seletion;
    edit_button;
    create_button;
    save_button;
    cancel_button;
    delete_button;
    remove_button;
    reset_button;
    query_button;
    expand_button;
    collapse_button;
    export_button;
    advanced_search;
    dirty_info;
    restore;
    empty_data;
    choose_export_columns;
    column_name;
    filter_bar_placeholder;
  };
  Pagination: {
    records_per_page;
  };
  Upload: {
    file_selection;
    click_to_upload;
    upload_success;
    upload_failure;
    no_file;
    upload_path_unset;
    not_acceptable_prompt;
    file_list_max_length;
  },
  Modal: {
    ok;
    cancel;
    confirm_modal_title;
    success_modal_title;
    error_modal_title;
    warning_modal_title;
  },
  DataSet: {
    unsaved_data_confirm;
    invalid_query_dataset;
    delete_selected_row_confirm;
    delete_all_row_confirm;
    query_failure;
    submit_success;
    submit_failure;
    cannot_add_record_when_head_no_current;
  },
  DatePicker: {
    value_missing;
    value_missing_with_label;
    ok;
    today;
    now;
    this_week;
  },
  EmailField: {
    value_missing;
    value_missing_with_label;
    type_mismatch;
  },
  IntlField: {
    modal_title;
  },
  NumberField: {
    value_missing;
    value_missing_with_label;
  },
  Radio: {
    value_missing;
    value_missing_with_label;
  },
  SelectBox: {
    value_missing;
    value_missing_with_label;
  },
  Select: {
    value_missing;
    value_missing_with_label;
  },
  Transfer: {
    items;
  },
  UrlField: {
    value_missing;
    value_missing_with_label;
    type_mismatch;
  },
  ColorPicker: {
    value_missing;
    value_missing_with_label;
    type_mismatch;
  },
  Validator: {
    bad_input;
    pattern_mismatch;
    range_overflow;
    range_underflow;
    step_mismatch;
    too_long;
    too_short;
    type_mismatch;
    value_missing;
    value_missing_with_label;
    unique;
    unknown;
  },
  Icon: {
    icons;
    whatsNew;
    direction;
    suggestion;
    edit;
    data;
    other;
    series;
  }
}

export default zh_CN;
