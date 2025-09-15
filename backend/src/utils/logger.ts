export type LogFields = Record<string, unknown>;

class ConsoleLogger {
  info(objOrMsg?: any, msg?: string) {
    if (typeof objOrMsg === "string") console.log(objOrMsg);
    else if (objOrMsg && msg) console.log(msg, objOrMsg);
    else if (objOrMsg) console.log(objOrMsg);
  }
  error(objOrMsg?: any, msg?: string) {
    if (typeof objOrMsg === "string") console.error(objOrMsg);
    else if (objOrMsg && msg) console.error(msg, objOrMsg);
    else if (objOrMsg) console.error(objOrMsg);
  }
  warn(objOrMsg?: any, msg?: string) {
    if (typeof objOrMsg === "string") console.warn(objOrMsg);
    else if (objOrMsg && msg) console.warn(msg, objOrMsg);
    else if (objOrMsg) console.warn(objOrMsg);
  }
  debug(objOrMsg?: any, msg?: string) {
    if (process.env.NODE_ENV !== "production") {
      if (typeof objOrMsg === "string") console.debug(objOrMsg);
      else if (objOrMsg && msg) console.debug(msg, objOrMsg);
      else if (objOrMsg) console.debug(objOrMsg);
    }
  }
  child(_bindings: LogFields) {
    return this; // API compatible con pino.child()
  }
}

export const logger = new ConsoleLogger();
export default logger;
