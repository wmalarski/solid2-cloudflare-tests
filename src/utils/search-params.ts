export const buildSearchParams = (query?: Record<string, unknown>): URLSearchParams => {
  const entries = Object.entries(query || {});
  const pairs = entries.flatMap(([key, value]) =>
    // oxlint-disable-next-line typescript/no-base-to-string typescript/restrict-template-expressions
    value !== undefined && value !== null ? [[key, `${value}`]] : [],
  );
  return new URLSearchParams(pairs);
};
