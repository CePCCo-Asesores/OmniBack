export const logInfo = (message: string) => {
  console.log(`[INFO] ${new Date().toISOString()} — ${message}`);
};

export const logError = (message: string) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${message}`);
};

export const logDebug = (message: string) => {
  if (process.env.DEBUG === 'true') {
    console.debug(`[DEBUG] ${new Date().toISOString()} — ${message}`);
  }
};
