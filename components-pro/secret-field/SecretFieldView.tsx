import React, { Component } from 'react';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';

import autobind from '../_util/autobind';

import { $l } from '../locale-context';
import DataSet from '../data-set/DataSet';
import message from '../message';
import { FieldType } from '../data-set/enum';
import Form from '../form/Form';
import SelectBox from '../select-box/SelectBox';
import Option from '../option/Option';
import TextField from '../text-field';
import Button from '../button/Button';
import { modalChildrenProps } from '../modal/interface';
import VerifySlider from './VerifySlider';
import CountDownButton from './CountDownButton';
import { ButtonColor } from '../button/enum';
import { ValueChangeAction } from '../text-field/enum';

export interface SecretFieldViewProps {
  modal?: modalChildrenProps;
  readOnly?: boolean;
  name: string;
  label: string;
  pattern?: string | RegExp;
  restrict?: string | RegExp;
  token?: string;
  countDown: any;
  onChange?: (data?: any) => void;
  onQueryFlag: (data: boolean) => void;
}

export interface VerifyTypeObjProps {
  name: string,
  type: string,
  value: string,
}

@observer
export default class SecretFieldView extends Component<SecretFieldViewProps> {
  static get contextType() {
    return ConfigContext;
  }

  static displayName = 'SecretFieldView';

  context: ConfigContextValue;

  get prefixCls() {
    const { context } = this;
    return context.getProPrefixCls('secret-field');
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.setFlag('verify');
      this.setVerifyTypeObj();
      this.setFormDs();
      this.setCaptchaKey('');
      this.setCaptcha('');
      this.setValidate(true);
    });
  }

  // 滑块拖到最右
  @autobind
  handleSuccess() {
    const { countDown } = this.props;
    const { context } = this;
    // 发送信息以获取验证码
    const secretFieldFetchVerifyCode = context.getConfig('secretFieldFetchVerifyCode');
    if (secretFieldFetchVerifyCode) {
      secretFieldFetchVerifyCode(this.formDs?.current?.get('verifyType')).then(
        res => {
          if ((res as any).success) {
            message.success((res as any).message);
            this.setCaptchaKey((res as any).captchaKey);
            // 验证码倒计时
            countDown.start();
          } else {
            message.error((res as any).message);
          }
          setTimeout(() => {
            this.setFlag('verify');
          }, 500);
        },
      ).catch(_e => this.setFlag('verify'));
    }
  }

  // 下一步
  @autobind
  handleGoToEdit() {
    const { name, token = '' } = this.props;
    // 编辑-校验验证码，返回原始值
    const { captchaKey, captcha, context } = this;
    const secretFieldQueryData = context.getConfig('secretFieldQueryData');
    const type = this.formDs?.current?.get('verifyType');
    const params = { type, _token: token, fieldName: name, captchaKey, captcha, action: 'edit' };
    if (secretFieldQueryData) {
      secretFieldQueryData(params).then(
        res => {
          if ((res as any)?.failed) {
            // 校验失败
            return;
          }
          // 编辑-返回原始数据
          this.formDs?.current?.set(name, res);
          this.setFlag('edit');
        },
      );
    } else {
      this.setFlag('edit');
    }
  }

  // 确定可查看
  @autobind
  handleQuery() {
    const { name, token = '', onChange, onQueryFlag, modal } = this.props;
    // 查看-校验验证码，返回原始值
    const { captchaKey, captcha, context } = this;
    const secretFieldQueryData = context.getConfig('secretFieldQueryData');
    const type = this.formDs?.current?.get('verifyType');
    const params = { type, _token: token, fieldName: name, captchaKey, captcha, action: 'query' };
    if (secretFieldQueryData) {
      return secretFieldQueryData(params).then(
        res => {
          if ((res as any)?.failed) {
            // 校验失败
            return;
          }
          // 查看-返回原始数据
          if (onChange) {
            if (res) {
              onChange(res);
            } else {
              onChange('');
            }
          }
          if (modal) {
            modal.close();
            onQueryFlag(false);
          }
        },
      );
    }
  }

  // 正则string处理
  generatePattern(pattern: string | RegExp): RegExp {
    if (pattern instanceof RegExp) {
      return pattern;
    }
    const begin = pattern.startsWith('^') ? '' : '^';
    const end = pattern.endsWith('$') ? '' : '$';
    return new RegExp(`${begin}${pattern}${end}`);
  }

  // 确定修改
  @autobind
  handleEdit() {
    const { name, token = '', onChange, modal, pattern } = this.props;
    const { context } = this;
    const editValue = this.formDs?.current?.get(name);
    if (pattern) {
      const newPattern = this.generatePattern(pattern);
      if (newPattern.test(editValue) === false) {
        // 正则校验不通过
        this.setValidate(false);
        return;
      }
    }

    // 接口查询重置值
    const secretFieldSaveData = context.getConfig('secretFieldSaveData');
    const params = { _token: token, fieldName: name, value: editValue };
    if (secretFieldSaveData) {
      return secretFieldSaveData(params).then(
        res => {
          // 校验失败
          if ((res as any)?.failed) {
            return;
          }
          // 编辑-返回修改数据
          if (onChange) {
            if (res) {
              onChange(res);
            } else if (!res) {
              onChange('');
            }
          }
          if (modal) {
            modal.close();
          }
        },
      );
    }
  }

  // 取消
  @autobind
  handleCancel() {
    // 清空formDs值
    // 关闭弹窗
    const { modal } = this.props;
    if (modal) {
      modal.close();
    }
  }

  @observable formDs;

  @action
  setFormDs() {
    const { name, label, pattern } = this.props;
    const { verifyTypeObj } = this;
    let initData: object[] = [];
    // 传入验证方式时，设置初始值
    if (verifyTypeObj.length > 0) {
      initData = [{ 'verifyType': verifyTypeObj[0].type, 'verifyNumber': verifyTypeObj[0].value }];
    }
    this.formDs = new DataSet(
      {
        autoCreate: true,
        data: initData,
        fields: [
          {
            name: 'verifyType',
            type: FieldType.string,
            label: $l('SecretField', 'verify_type'),
          },
          {
            name: 'verifyNumber',
            type: FieldType.string,
            label: $l('SecretField', 'verify_value'),
          },
          {
            name: 'verifyCode',
            type: FieldType.string,
            label: $l('SecretField', 'verify_code'),
          },
          {
            name,
            type: FieldType.string,
            label,
            pattern,
          },
        ],
        events: {
          update: this.handleFormUpdate,
        },
      },
    );
  }

  @observable captchaKey;

  @action
  setCaptchaKey(value) {
    this.captchaKey = value;
  }

  @observable captcha;

  @action
  setCaptcha(value) {
    this.captcha = value;
  }

  // 对编辑的值进行正则校验
  @observable validate;

  @action
  setValidate(value) {
    this.validate = value;
  }

  // 模态框页面显示。verify:验证页，slider:滑块，edit:编辑页
  @observable flag;

  @action
  setFlag(value) {
    this.flag = value;
  }

  @observable verifyTypeObj;

  @action
  setVerifyTypeObj() {
    const { context } = this;
    // 从配置项获取验证方式
    const secretFieldTypesConfig = context.getConfig('secretFieldTypes');
    if (secretFieldTypesConfig) {
      this.verifyTypeObj = secretFieldTypesConfig() as VerifyTypeObjProps[];
    } else {
      this.verifyTypeObj = [];
    }
  }

  @autobind
  handleFormUpdate({ name, value }) {
    const { verifyTypeObj } = this;
    // 修改验证方式时，自动填充验证号码
    if (verifyTypeObj.length > 0 && name === 'verifyType') {
      verifyTypeObj.forEach(item => {
        if (item.type === value) {
          this.formDs?.current?.set('verifyNumber', item.value);
        }
      });
    }
    if (name === 'verifyCode') {
      this.setCaptcha(value);
    }
  }

  @autobind
  handleVerifySliderCancel() {
    this.setFlag('verify');
  }

  @autobind
  handleClickButton() {
    this.setFlag('slider');
  }

  render() {
    const { flag, captcha, verifyTypeObj, prefixCls, validate } = this;
    const { readOnly, label, name, countDown, restrict } = this.props;

    return (
      <div className={`${prefixCls}-modal`}>
        {
          flag !== 'slider' && (
            <Form style={{ height: 'calc(100% - 42px)' }} dataSet={this.formDs} columns={4} labelWidth="auto">
              {
                flag === 'verify' && (
                  <>
                    <SelectBox name="verifyType" colSpan={4}>
                      {verifyTypeObj?.map(item => <Option value={item.type} key={item.type}>
                        {item.name}
                      </Option>)}
                    </SelectBox>
                    <TextField name="verifyNumber" colSpan={4} disabled />
                    <TextField name="verifyCode" colSpan={3} valueChangeAction={ValueChangeAction.input} />
                    <CountDownButton onClick={this.handleClickButton} countDown={countDown} />
                    <td className={`${prefixCls}-modal-btns`} colSpan={4}>
                      <Button onClick={this.handleCancel}>{$l('SecretField', 'cancel')}</Button>
                      {readOnly ? (
                        <Button
                          onClick={this.handleQuery}
                          className={`${prefixCls}-modal-raised-btn`}
                          disabled={!captcha}
                          color={ButtonColor.primary}
                        >
                          {$l('SecretField', 'ok_btn')}
                        </Button>
                      ) : (
                        <Button
                          onClick={this.handleGoToEdit}
                          className={`${prefixCls}-modal-raised-btn`}
                          disabled={!captcha}
                          color={ButtonColor.primary}
                        >
                          {$l('SecretField', 'next_step')}
                        </Button>
                      )}
                    </td>
                  </>
                )
              }
              {
                flag === 'edit' && (
                  <>
                    <TextField name={name} colSpan={4} restrict={restrict} />
                    <td colSpan={4} className={`${prefixCls}-modal-btns`}>
                      {!validate &&
                      <><p className={`${prefixCls}-modal-validate`}>{$l('SecretField', 'type_mismatch', { label })}</p><br /></>}
                      <Button onClick={this.handleCancel}>{$l('SecretField', 'cancel')}</Button>
                      <Button onClick={this.handleEdit} color={ButtonColor.primary}>{$l('SecretField', 'ok_btn')}</Button>
                    </td>
                  </>
                )
              }
            </Form>
          )
        }
        {flag === 'slider' && (
          <VerifySlider onCancel={this.handleVerifySliderCancel} onSuccess={this.handleSuccess} />
        )}
      </div>
    );
  }
}
