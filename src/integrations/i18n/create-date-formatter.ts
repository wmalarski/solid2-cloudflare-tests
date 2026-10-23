import { type Accessor, createMemo } from "solid-js";
import type { Locale } from "./index";

export const createDateFormatter = (locale: Accessor<Locale>) => {
  const formatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { dateStyle: "medium", hour12: false }),
  );

  return (date: string | Date) => formatter().format(new Date(date));
};
