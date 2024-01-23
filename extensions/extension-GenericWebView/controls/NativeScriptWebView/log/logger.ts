export function getLogger(extension: any): any {
  if (extension && extension.page() && extension.page().context) {
    const context = extension.page().context.clientAPI;
    const pageProxy = context.getPageProxy();
    const appClientData =
      context.getAppClientData() ||
      context.evaluateTargetPathForAPI("#Application").getClientData();
    if (appClientData.getSWZLogger) {
      return appClientData.getSWZLogger();
    } else {
      return _getDebugConsole();
    }
  }
}

export function getLoggerFromClientAPI(clientAPI: any): any {
  if (clientAPI) {
    const appClientData =
      clientAPI.getAppClientData() ||
      clientAPI.evaluateTargetPathForAPI("#Application").getClientData();
    try {
      if (appClientData.getSWZLogger) {
        return appClientData.getSWZLogger();
      } else {
        return _getDebugConsole();
      }
    } catch (error) {
      console.error(error);
      return _getDebugConsole();
    }
  }
}

export function error(logger, message, domain) {
  if (logger && logger.error) {
    logger.error(message, domain);
  }
}

export function debug(logger, message, domain) {
  if (logger && logger.debug) {
    logger.debug(message, domain);
  }
}

export function warn(logger, message, domain) {
  if (logger && logger.warn) {
    logger.warn(message, domain);
  }
}

export function info(logger, message, domain) {
  if (logger && logger.info) {
    logger.info(message, domain);
  }
}

export const LogDomain = {
  MyImageNativeControl: "MyImageNativeControlExtension",
  BannerImageNativeControl: "BannerImageNativeControlExtension",
  PortalWebView: "PortalWebView",
  JamWebView: "JamWebView",
};

function _getDebugConsole() {
  if (!console.debug) {
    console.debug = console.log;
  }
  return console;
}
