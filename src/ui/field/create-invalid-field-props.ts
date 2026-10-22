import { createMemo } from "solid-js";
import { useFieldContext } from "../field/field";
import { getInvalidStateProps } from "../utils/forms";

export const createInvalidFieldProps = () => {
  const field = useFieldContext();

  return createMemo(() =>
    field
      ? getInvalidStateProps({
          errorMessageId: field.errorId,
          isInvalid: field.isInvalid,
        })
      : {},
  );
};
