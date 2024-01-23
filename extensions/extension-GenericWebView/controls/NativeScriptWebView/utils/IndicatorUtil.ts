const INDICATOR_TIMEOUT = 30000;

export function startLoadingIndicator(context: any): void {
  // scenario 1: pass in the extension instance directly
  if (context && context.page && context.page() && context.page().context) {
    context = context.page().context.clientAPI;
  }
  // scenario 2: pass in the client api context
  return _startLoadingIndicator(context);
}

export function stopLoadingIndicator(context: any): void {
  if (context && context.page && context.page() && context.page().context) {
    context = context.page().context.clientAPI;
  }
  return _stopLoadingIndicator(context);
}

function _startLoadingIndicator(clientAPI: any): void {
  if (clientAPI && clientAPI.getPageProxy) {
    const pageProxy = clientAPI.getPageProxy();
    const appClientData =
      clientAPI.getAppClientData() ||
      clientAPI.evaluateTargetPathForAPI("#Application").getClientData();
    if (appClientData.ActivityIndicatorId !== undefined) {
      pageProxy.dismissActivityIndicator(appClientData.ActivityIndicatorId);
    }
    const loadingText = pageProxy.localizeText("loading");
    const indicatorId = pageProxy.showActivityIndicator(loadingText);
    appClientData.ActivityIndicatorId = indicatorId;
    // clean up any unhanded UI blocking indicator
    setTimeout(() => {
      pageProxy.dismissActivityIndicator(indicatorId);
    }, INDICATOR_TIMEOUT);
  }
}

function _stopLoadingIndicator(clientAPI: any): void {
  if (clientAPI && clientAPI.getPageProxy) {
    const pageProxy = clientAPI.getPageProxy();
    const appClientData =
      clientAPI.getAppClientData() ||
      clientAPI.evaluateTargetPathForAPI("#Application").getClientData();
    if (appClientData.ActivityIndicatorId !== undefined) {
      pageProxy.dismissActivityIndicator(appClientData.ActivityIndicatorId);
      appClientData.ActivityIndicatorId = undefined;
    }
  }
}
