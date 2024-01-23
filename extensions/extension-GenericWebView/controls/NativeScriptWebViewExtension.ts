import {
  Builder,
  EventData,
  ImageSource,
  Screen,
  WebView,
} from "@nativescript/core";
import { IControlData } from "mdk-core/controls/IControlData";
import { AbstractWebView } from "./AbstractWebView";
import { WebViewModel } from "./NativeScriptWebView/ui/WebView";
import {
  startLoadingIndicator,
  stopLoadingIndicator,
} from "./NativeScriptWebView/utils/IndicatorUtil";

const ERROR_SRC_PREFIX = "Error:";

export class NativeScriptWebViewExtension extends AbstractWebView {
  private _nsWebView: any;
  private _enablePadding: boolean;
  private _enableToolbar: boolean;
  private _clientAPI: any;
  private _webView: WebView;
  private _curSrc: string;
  private _errorAction: string;

  constructor() {
    super();
    this._nsWebView = null;
    this._enablePadding = false;
    this._enableToolbar = false;
    this._errorAction = '';
  }

  public initialize(props: IControlData): void {
    super.initialize(props);

    this._clientAPI = this._props.context.clientAPI;
    this._nsWebView = Builder.load({
      path:
        "~/extensions/extension-GenericWebView/controls/NativeScriptWebView/ui",
      name: "WebView",
    });

    this.resolveExtensionProperties().then((resolvedProperties) => {
      let src = "";
      if (resolvedProperties) {
        src = resolvedProperties["Src"] || "";
        this._enablePadding = !!resolvedProperties["EnablePadding"];
        this._enableToolbar = !!resolvedProperties["EnableToolbar"];
        this._errorAction = resolvedProperties["ErrorAction"] || "";
      }

      this._webView = this._nsWebView.getViewById("webView") as WebView;
      if (this._webView) {
        this._curSrc = src;
        this._webView.on("loadStarted", this._onWebViewLoadStarted, this);
        this._webView.on("loadFinished", this._onWebViewLoadFinished, this);
      }

      if (this._isErrorPage(src)) {
        this._initWithSrc(this._getErrorPageSrc());
        this._showErrorMessage(src);
      } else {
        this._initWithSrc(src);
      }
    });
  }

  public view() {
    return this._nsWebView;
  }

  private _onWebViewLoadStarted(args: any) {
    if (this._curSrc == args.url) {
      return startLoadingIndicator(this._clientAPI);
    }
  }

  private _onWebViewLoadFinished(args: any) {
    stopLoadingIndicator(this._clientAPI);
  }

  private _getErrorPageSrc() {
    let src = `<html><head><meta charset="UTF-8"><meta name="viewport" content="initial-scale=1.0"></head><body><div style="text-align:center;position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);">`;
    const imageSource = ImageSource.fromResourceSync("disconnect");
    const screenHeight = Screen.mainScreen.heightDIPs;
    const imageSize = (screenHeight * 240) / 1642;
    const base64Str = imageSource.toBase64String("png");
    src += `<img src="data:image/png;base64,${base64Str}" width="${imageSize}, height="${imageSize} />`;
    src += `</div></body></html>`;
    return src;
  }

  private _isErrorPage(src: string) {
    return src && src.indexOf(ERROR_SRC_PREFIX) === 0;
  }

  private _initWithSrc(src: string) {
    const webviewModel = new WebViewModel(this._props.context.clientAPI, src);
    webviewModel.enablePadding = this._enablePadding;
    webviewModel.enableToolbar = this._enableToolbar;
    this._nsWebView.bindingContext = webviewModel;
  }

  private _showErrorMessage(src: string) {
    const message = src.substr(ERROR_SRC_PREFIX.length);
    const clientAPI = this._props.context.clientAPI;
    if (this._errorAction) {
      setTimeout(() => {
        clientAPI.executeAction({
          Name: this._errorAction,
          Properties: {
            Message: message,
          },
        });
      }, 500);
    } else {
      this.logger.debug(src, this.logDomain);
    }

  }
}
