import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import TextInput from "@/components/form/TextInput";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  formComponents: {},
  fieldComponents: {
    Input: TextInput,
  },
});
