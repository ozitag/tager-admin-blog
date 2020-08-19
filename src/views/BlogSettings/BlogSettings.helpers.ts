import { Nullable } from '@tager/admin-services';

import {
  SettingsItemFile,
  SettingsItemFileList,
  SettingsItemString,
  SettingsItemType,
} from '../../typings/model';
import {
  SettingsFieldType,
  SettingsUpdatePayload,
} from '../../services/requests';

function convertStringField(
  field: SettingsItemString
): SettingsFieldType<string> {
  return { name: field.name, value: field.value ?? '' };
}

function convertFileField(
  field: SettingsItemFile
): SettingsFieldType<Nullable<number>> {
  return { name: field.name, value: field.value?.id ?? null };
}

function convertFileListField(
  field: SettingsItemFileList
): SettingsFieldType<Array<number>> {
  return { name: field.name, value: field.value.map((file) => file.id) };
}

function convertField(field: SettingsItemType) {
  switch (field.type) {
    case 'TEXT':
    case 'STRING':
    case 'HTML':
    case 'NUMBER':
      return convertStringField(field);
    case 'IMAGE':
    case 'FILE':
      return convertFileField(field);
    case 'GALLERY':
      return convertFileListField(field);
    default:
      return { name: (field as SettingsItemType).name, value: null };
  }
}

export function convertFieldListToRequestPayload(
  fieldList: Array<SettingsItemType>
): SettingsUpdatePayload {
  return {
    values: fieldList.map(convertField),
  };
}
