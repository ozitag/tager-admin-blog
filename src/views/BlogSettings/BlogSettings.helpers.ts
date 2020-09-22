import { FieldUnion, universalFieldUtils } from '@tager/admin-dynamic-field';

import { SettingItemType } from '../../typings/model';
import { SettingsUpdatePayload } from '../../services/requests';

export type SettingsFormValues = Array<FieldUnion>;

export function convertBlogSettingsToFormValues(
  settingItemList: Array<SettingItemType>
): SettingsFormValues {
  return settingItemList.map((settingItem) =>
    universalFieldUtils.createFormField(settingItem.field, settingItem.value)
  );
}

export function convertSettingValuesToRequestPayload(
  values: SettingsFormValues
): SettingsUpdatePayload {
  return {
    values: values.map((field) => ({
      name: field.config.name,
      value: universalFieldUtils.getOutgoingValue(field),
    })),
  };
}
