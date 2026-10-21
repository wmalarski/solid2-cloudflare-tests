type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const write = (level: LogLevel, event: string, fields: LogFields = {}) => {
  const line = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  });

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
};

export const logInfo = (event: string, fields?: LogFields) => {
  write("info", event, fields);
};

export const logWarn = (event: string, fields?: LogFields) => {
  write("warn", event, fields);
};

export const logError = (event: string, fields?: LogFields) => {
  write("error", event, fields);
};

export const serializeError = (error: unknown): LogFields => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
};
