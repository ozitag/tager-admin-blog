<script lang="ts">
import Vue, { VNode } from 'vue';

import { SettingsItemType } from '../../../typings/model';
import {
  FormField,
  FormFieldFileInput,
  FormFieldRichTextInput,
} from '@tager/admin-ui';

type Props = Readonly<{
  field: SettingsItemType;
}>;

export default Vue.extend<Props>({
  name: 'DynamicField',
  functional: true,
  props: {
    field: {
      type: Object,
      required: true,
    },
  },
  render(h, context) {
    function renderField(field: SettingsItemType): VNode {
      const commonProps = {
        label: field.label,
        name: field.name,
        value: field.value,
      };

      function handleChange(event: SettingsItemType['value']) {
        field.value = event;
      }

      switch (field.type) {
        case 'STRING':
          return h(FormField, {
            props: {
              ...commonProps,
            },
            on: {
              ...context.listeners,
              input: handleChange,
            },
          });
        case 'TEXT':
          return h(FormField, {
            props: {
              ...commonProps,
              type: 'textarea',
              rows: 4,
            },
            on: {
              ...context.listeners,
              input: handleChange,
            },
          });
        case 'HTML':
          return h(FormFieldRichTextInput, {
            props: {
              ...commonProps,
            },
            on: {
              ...context.listeners,
              input: handleChange,
            },
          });
        case 'IMAGE':
          return h(FormFieldFileInput, {
            props: {
              ...commonProps,
            },
            attrs: {
              fileType: 'image',
            },
            on: {
              ...context.listeners,
              change: handleChange,
            },
          });
        case 'GALLERY':
          return h(FormFieldFileInput, {
            props: {
              label: field.label,
              name: field.name,
              value: field.value,
            },
            attrs: {
              fileType: 'image',
              multiple: true,
            },
            on: {
              ...context.listeners,
              change: handleChange,
            },
          });
        case 'FILE':
          return h(FormFieldFileInput, {
            props: {
              ...commonProps,
            },
            on: {
              ...context.listeners,
              change: handleChange,
            },
          });

        default:
          return h('p', `Unknown field with type: ${field.type}`);
      }
    }

    return renderField(context.props.field);
  },
});
</script>

<style scoped></style>
