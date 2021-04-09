/* eslint-disable camelcase */
import { Lang } from './enum';
import zh_CN from './zh_CN';

export interface Locale {
  lang: Lang;
  Table: {
    show_cached_seletion;
    hide_cached_seletion;
    selection_tips;
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
    defalut_export;
    more_button;
    advanced_search;
    dirty_info;
    restore;
    empty_data;
    choose_export_columns;
    column_name;
    filter_bar_placeholder;
    advanced_query;
    advanced_query_conditions;
    export_failed;
    download_button;
    export_success;
    export_ing;
    retry_button;
    file_name;
    export_break;
    export_operating;
    export_waiting;
    more;
    enter_text_filter;
    clear_filter;
    save_filter;
    collapse;
    predefined_fields;
    add_filter;
    enter_search_content;
    save_as;
    fast_filter;
    rename;
    set_default;
    cancel_default;
    filter_rename;
    save_filter_as;
    whether_delete_filter;
    filter_name;
    please_enter;
    query_option_yes;
    query_option_no;
    customization_settings;
    column_settings;
    restore_default;
    left_lock;
    right_lock;
    unlocked;
    unlock;
    top;
    up;
    down;
  };
  Pagination: {
    page;
    jump_to;
    jump_to_confirm;
    records_per_page;
  };
  Upload: {
    file_selection;
    click_to_upload;
    upload_success;
    upload_failure;
    no_file;
    upload_path_unset;
    been_uploaded;
    not_acceptable_prompt;
    file_list_max_length;
  };
  Modal: {
    ok;
    cancel;
  };
  DataSet: {
    unsaved_data_confirm;
    invalid_query_dataset;
    delete_selected_row_confirm;
    delete_all_row_confirm;
    query_failure;
    submit_success;
    submit_failure;
    cannot_add_record_when_head_no_current;
  };
  DatePicker: {
    value_missing;
    value_missing_no_label;
    type_mismatch;
    ok;
    today;
    now;
    this_week;
  };
  EmailField: {
    value_missing;
    value_missing_no_label;
    type_mismatch;
  };
  IntlField: {
    modal_title;
  };
  NumberField: {
    value_missing;
    value_missing_no_label;
  };
  Radio: {
    value_missing;
    value_missing_no_label;
  };
  SelectBox: {
    value_missing;
    value_missing_no_label;
  };
  Select: {
    value_missing;
    value_missing_no_label;
    no_matching_results;
    select_all;
    select_re;
    unselect_all;
    common_item;
  };
  Lov: {
    choose;
  };
  Transfer: {
    items;
  };
  UrlField: {
    value_missing;
    value_missing_no_label;
    type_mismatch;
  };
  ColorPicker: {
    value_missing;
    value_missing_no_label;
    type_mismatch;
  };
  Validator: {
    bad_input;
    pattern_mismatch;
    range_overflow;
    range_underflow;
    step_mismatch;
    step_mismatch_between;
    too_long;
    too_short;
    type_mismatch;
    value_missing;
    value_missing_no_label;
    unique;
    unknown;
  };
  Icon: {
    icons;
    whatsNew;
    direction;
    suggestion;
    edit;
    data;
    other;
    series;
  };
  Cascader: {
    please_select;
    value_missing_no_label;
    value_missing;
    select_all;
    unselect_all;
  };
  Screening: {
    selected;
    pack_up;
    more;
    multi_select;
    confirm;
    cancel;
  }
}

export default zh_CN;
