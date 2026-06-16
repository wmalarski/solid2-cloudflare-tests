import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
  type Accessor,
  type Component,
  createContext,
  createMemo,
  createSignal,
  type ParentProps,
  useContext,
} from "solid-js";

const enDict = {
  auth: {
    signInWithSpotify: "Sign In With Spotify",
  },
  task: {
    note: "Note",
    rate: "Rate",
    status: "Status",
    statuses: {
      inProgress: "In progress",
      new: "New",
      reviewed: "Reviewed",
    },
    delete: {
      title: "Delete task",
      description: "Delete selected task from the list",
    },
  },
  currentlyPlaying: {
    addTask: {
      trigger: "Save",
      title: "Save album",
      description: "Save currently playing album as task",
    },
  },
  common: {
    cancel: "Cancel",
    clear: "Clear",
    closeDialog: "Close",
    confirm: "Are you sure you want to proceed?",
    delete: "Delete",
    edit: "Edit",
    openMenu: "Open Menu",
    save: "Save",
    update: "Update",
  },
  error: {
    description: "Something went wrong: {{message}}",
    home: "Home",
    reload: "Reload",
    title: "Error",
  },
  info: {
    description: "Solid v2 Example",
    madeBy: "Made by wmalarski",
    title: "Solid v2 Example",
  },
};

export type Locale = "en";

const dictionaries = { en: enDict };

type Accessed<T> = T extends Accessor<infer A> ? A : never;

export const createI18nValue = () => {
  const [locale, setLocale] = createSignal<Locale>("en");

  const translate = createMemo(() => {
    const dict = flatten(dictionaries[locale()]);
    return translator(() => dict, resolveTemplate);
  });

  const t: Accessed<typeof translate> = (path, ...args) => {
    return translate()(path, ...args);
  };

  return { locale, setLocale, t };
};

type I18nContextValue = ReturnType<typeof createI18nValue>;

export const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nContextProvider: Component<ParentProps> = (props) => {
  const value = createI18nValue();

  return <I18nContext value={value}>{props.children}</I18nContext>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("I18nContext not found");
  }

  return context;
};
