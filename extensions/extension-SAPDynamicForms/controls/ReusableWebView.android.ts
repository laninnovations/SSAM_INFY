import { EventHandler } from 'mdk-core/EventHandler';
import { BaseWebView } from './BaseWebView';
import { WebView, LoadEventData } from '@nativescript/core/ui/web-view';
import { EventData } from '@nativescript/core/data/observable';
declare const com: any

@NativeClass
class JSInterface extends com.sap.mobile.apps.sdf.JSInterfaceObject {
    messageHandler: (message: string) => void;

    // constructor
    constructor(messageHandler: (message: string) => void) {
        super();
        this.messageHandler = messageHandler;
    }

    public _postMessage(message: string): void {
        this.messageHandler(message);
    }
}

export class ReusableWebView extends BaseWebView {

    private _webView: WebView;
    private _hasLoaded: boolean = false;

    public static getReusableWebView(): BaseWebView {
        if (false) { //(ReusableWebView.reusableWebView) {
            const reusableWebView = <ReusableWebView>ReusableWebView.reusableWebView;
            reusableWebView._reloadRequired = true;
            return reusableWebView;
        } else {
            const reusableWebView = new ReusableWebView();
            ReusableWebView.reusableWebView = reusableWebView;
            //reusableWebView._templateDataMap = new Map();
            reusableWebView._reloadRequired = false;
            reusableWebView.initialize();
            return reusableWebView;
        }
    }

    public webView() {
        return this._webView;
    }

    public getNativeView(): any {
        return this._webView;
    }

    public initialLoadPlatform(htmlFileName: string): void {
        // android get bundle here
        let htmlPath = `file:///android_asset/script-offline/offline.html`;
        if (htmlFileName !== 'static') {
            htmlPath = `file:///android_asset/formrunner/${htmlFileName}.htm`
        }
    }

    public resetHeight(width: number, height: number) {
        // if (this._webView) {
        //     this._webView.frame = CGRectMake(0, 0, width, height);
        // }
    }

    protected initialize(): void {
        if (this._formConfig.debug) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true);
        }
        
        this._webView = new WebView();
        this._webView.on('loadStarted', this.onLoadStarted, this);
        this._webView.on('loadFinished', this.onLoadFinished, this);
        this._webView.on('pageStarted', this.onPageStarted, this);
    }

    public evaluateJavaScript(expression: string): void {
        if (this._webView && this._webView.android)
            this._webView.android.evaluateJavascript(expression, null);
    }

    private onLoadStarted(eventData: LoadEventData) {
        //TODO: setup script manipulation for ios listener
        this._webView.android.getSettings().setDisplayZoomControls(false);
        this._webView.android.addJavascriptInterface(new JSInterface(this.processJSMessage), 'AndroidListener');
        this.evaluateJavaScript('webkit = { messageHandlers: { formRunner: AndroidListener} }');
    }

    private onLoadFinished(eventData: LoadEventData) {
        if (eventData.error || this._hasLoaded) {
            //TODO: log this!
            return;
        }

        this._hasLoaded = true;
        ReusableWebView.reusableWebView.reloadWebView(ReusableWebView.reusableWebView.formConfig);
    }

    private onPageStarted(eventData: EventData) {
        this._webView.android.addJavascriptInterface(new JSInterface(this.processLogMessage), 'AndroidLogListener');
        this.evaluateJavaScript('function captureLog(msg) { AndroidLogListener.postMessage(msg); } window.console.log = captureLog;');
    }

    protected processJSMessage(message) {
        let jsonData: any;
        try {
            jsonData = JSON.parse(message);
        } catch (error) {
            // TODO: Log this
            return;
        }
        const communicationType: string = jsonData['communication-type'];
        const data: string = jsonData.data;
        const eventHandler: any = new EventHandler();

        if ((communicationType === 'isFormDataSafe')) {
            ReusableWebView.reusableWebView.isFormDataSafe = data === 'true';
            ReusableWebView.reusableWebView.isFormDataSafeReturned(ReusableWebView.reusableWebView.isFormDataSafe);
        } else {
                if (ReusableWebView.reusableWebView.submissionHandler) {
                    if (ReusableWebView.reusableWebView.context) {
                        ReusableWebView.reusableWebView.context.binding = jsonData;
                    }
                    return eventHandler.executeActionOrRule(ReusableWebView.reusableWebView.submissionHandler, ReusableWebView.reusableWebView.context)
                        .catch ((error) => {
                            // TODO: log this
                        });
                } else {
                    // TODO: log error message for no submission handler
                }
        }
    }

    protected processLogMessage(message) {
        console.log(message);
    }
}
