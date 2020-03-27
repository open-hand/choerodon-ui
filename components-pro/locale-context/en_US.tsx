import { Lang } from './enum';
import { Locale } from './locale';

const locale: Locale = {
  lang: Lang.en_US,
  Table: {
    show_cached_seletion: 'Show all selected records',
    hide_cached_seletion: 'Hide all selected records',
    edit_button: 'Edit',
    create_button: 'Create',
    save_button: 'Save',
    cancel_button: 'Cancel',
    delete_button: 'Delete',
    remove_button: 'Remove',
    reset_button: 'Reset',
    query_button: 'Query',
    expand_button: 'Expand',
    collapse_button: 'Collapse',
    export_button: 'Export',
    advanced_search: 'Advanced Search',
    dirty_info: 'Display condition has changed.',
    restore: 'Restore',
    empty_data: 'No data',
    choose_export_columns: 'Please select the column to export',
    column_name: 'Column Name',
    filter_bar_placeholder: 'Table Filter',
    advanced_query: 'Advanced Query',
    advanced_query_conditions: 'Advanced Queries',
  },
  Pagination: {
    page: 'Page',
    jump_to: 'Jump to',
    jump_to_confirm: 'Confirm',
    records_per_page: 'Number of items per page：',
  },
  Upload: {
    file_selection: 'Select File',
    click_to_upload: 'Click to Upload',
    upload_success: 'Upload successfully',
    upload_failure: 'Fail to upload',
    no_file: 'No File',
    been_uploaded: 'File uploaded',
    upload_path_unset: 'Upload path unset',
    not_acceptable_prompt: 'Upload List contains unacceptable file, accept:',
    file_list_max_length: 'Number of files exceeded the maximum',
  },
  Modal: {
    ok: 'OK',
    cancel: 'Cancel',
  },
  DataSet: {
    unsaved_data_confirm: `There's unsaved data, continue?`,
    invalid_query_dataset: 'Invalid query DataSet.',
    delete_selected_row_confirm: 'Are you sure to delete the selected row?',
    delete_all_row_confirm: 'Are you sure to delete all rows?',
    query_failure: 'Fail to query data.',
    submit_success: 'Submit successfully.',
    submit_failure: 'Fail to submit data.',
    cannot_add_record_when_head_no_current: `Can't create new row record when head record unselected.`,
  },
  DatePicker: {
    value_missing_no_label: 'Please choose a date.',
    value_missing: 'Please select {label}.',
    type_mismatch: 'Please enter a valid date.',
    ok: 'OK',
    today: 'Today',
    now: 'Now',
    this_week: 'This week',
  },
  EmailField: {
    value_missing_no_label: 'Please input an email address.',
    value_missing: 'Please input {label}.',
    type_mismatch: 'Please input a valid email address.',
  },
  IntlField: {
    modal_title: 'Input multi-language information.',
  },
  NumberField: {
    value_missing_no_label: 'Please input a number.',
    value_missing: 'Please input {label}.',
  },
  Radio: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
  },
  SelectBox: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
  },
  Select: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
    no_matching_results: 'No matching results.',
    select_all: 'Select All',
    unselect_all: 'None',
  },
  Lov: {
    choose: 'Choose',
  },
  Transfer: {
    items: 'items',
  },
  UrlField: {
    value_missing_no_label: 'Please input a url address.',
    value_missing: 'Please input {label}.',
    type_mismatch: 'Please input a valid url address.',
  },
  ColorPicker: {
    value_missing_no_label: 'Please select a color.',
    value_missing: 'Please select {label}.',
    type_mismatch: 'Please select a valid color.',
  },
  Validator: {
    bad_input: 'Please input a number.',
    pattern_mismatch: 'Please input a valid value.',
    range_overflow: '{label} must be less than or equal to {max}.',
    range_underflow: '{label} must be greater than or equal to {min}.',
    step_mismatch: 'Please input a valid value. The closest valid value is {0}.',
    step_mismatch_between:
      'Please input a valid value. The two closest valid values are {0} and {1}.',
    too_long:
      'Please decrease the length of the value down to {maxLength} or less characters (You have input {length} characters).',
    too_short:
      'Please increase the length of the value down to {minLength} or more characters (You have input {length} characters).',
    type_mismatch: 'Please input a value to match the given type.',
    value_missing_no_label: 'Please input a value.',
    value_missing: 'Please input {label}.',
    unique: 'The value is duplicate, please input another one.',
    unknown: 'Unknown error.',
  },
  Icon: {
    icons: ' Icons',
    whatsNew: 'New',
    direction: 'Directional',
    suggestion: 'Suggested',
    edit: 'Editor',
    data: 'Data',
    other: 'Application',
    series: 'Series',
  },
};

export default locale;
