import {
  type Accessor,
  type Component,
  type ParentProps,
  createContext,
  createMemo,
  createUniqueId,
  useContext,
} from "solid-js";

type CreateFieldContextArgs = {
  id?: string;
  name: string;
  isInvalid?: boolean;
};

const createFieldContext = (args: Accessor<CreateFieldContextArgs>) => {
  const generatedId = createUniqueId();
  const errorId = createUniqueId();

  const id = createMemo(() => args().id ?? generatedId);
  const name = createMemo(() => args().name);
  const isInvalid = createMemo(() => args().isInvalid ?? false);

  return {
    get id() {
      return id();
    },
    get name() {
      return name();
    },
    get isInvalid() {
      return isInvalid();
    },
    errorId,
  };
};

type FieldContextValue = ReturnType<typeof createFieldContext>;

const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = () => useContext(FieldContext);

type FieldRootProps = ParentProps<CreateFieldContextArgs>;

export const FieldRoot: Component<FieldRootProps> = (props) => {
  const value = createFieldContext(() => props);

  return <FieldContext value={value}>{props.children}</FieldContext>;
};
