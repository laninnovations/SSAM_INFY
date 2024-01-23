import { EventHandler } from 'mdk-core/EventHandler';
import { IContext } from 'mdk-core/context/IContext';
import { JsonToXml } from './JsonToXml';

export abstract class BaseWebView {
    public static reusableWebView: BaseWebView;

    protected _reloadRequired = false;
    protected _isApplicationSuspended = false;
    protected _context: IContext;
    protected _cacheMaxLimit: number;
    protected _isFormDataSafe: boolean = false;
    protected _formTemplateDataHandler: string;
    protected _submissionHandler: string;
    protected _formConfig: any;
    protected _isFormDataSafeCallback: (_: boolean) => void;
    protected _isFormDataSafeTimeout: any;

    public abstract getNativeView(): any;

    public reloadRequired() {
        return this._reloadRequired;
    }

    public setIsApplicationSuspended(value) {
        this._isApplicationSuspended = value;
    }
    public getIsApplicationSuspended() {
        return this._isApplicationSuspended;
    }

    set isFormDataSafe(isFormDataSafe: boolean) {this._isFormDataSafe = isFormDataSafe;}
    get isFormDataSafe(): boolean {return this._isFormDataSafe;}
    set isFormDataSafeCallback(isFormDataSafe: (_: boolean) => void) {this._isFormDataSafeCallback = isFormDataSafe;};
    get isFormDataSafeCallback(): (_: boolean) => void {return this._isFormDataSafeCallback;};
    set isFormDataSafeTimeout(timeout: any) {this._isFormDataSafeTimeout = timeout;};
    get isFormDataSafeTimeout(): any {return this._isFormDataSafeTimeout;};
    set formTemplateDataHandler(formTemplateDataHandler: string) {this._formTemplateDataHandler = formTemplateDataHandler;}
    get formTemplateDataHandler(): string {return this._formTemplateDataHandler;}
    set submissionHandler(submissionHandler: string) {this._submissionHandler = submissionHandler;}
    get submissionHandler(): string {return this._submissionHandler;}
    set formConfig(formConfig: Object) {this._formConfig = formConfig;}
    get formConfig(): Object {return this._formConfig;}
    set context(context: IContext) {this._context = context;}
    get context(): IContext {return this._context;}

    public pressButton(buttonname) {
        switch(buttonname) {
            case 'save-final':
                this.evaluateJavaScript('document.querySelector(".fr-buttons .fr-save-final-button button").click()');
                break;
            case 'save-not-final':
                this.evaluateJavaScript('document.querySelector(".fr-buttons .fr-save-not-final-button button").click()');
                break;
            case 'reopen':
                this.evaluateJavaScript('document.querySelector(".fr-buttons .fr-reopen-button button").click()');
                break;
            case 'clear':
                this.evaluateJavaScript('document.querySelector(".fr-buttons .fr-clear-button button").click()');
                break;
            default:
                // ok to do nothing
                break;
        }
    }

    public setCacheMaxLimit(cacheMaxLimit) {
        this._cacheMaxLimit = cacheMaxLimit;
    }

    public initialLoad(htmlFileName: string): void {
        // debug delay for debugger attachment.
        const debugDelay = this._formConfig.debugDelay || 0;
        setTimeout(() => this.initialLoadPlatform(htmlFileName), debugDelay)
    }

    protected abstract initialLoadPlatform(htmlFileName: string): void;

    public reloadWebView(formConfig: any) {
        new EventHandler().executeActionOrRule(this._formTemplateDataHandler, this._context).then((result) => {
            if (result && result.length > 0) {
                let binding = {};
                if (this.context && this.context.binding) {
                    binding = this.context.binding;
                }
                this.loadDataIntoWebView(
                    result, 
                    formConfig.applicationName, 
                    formConfig.formName, 
                    formConfig.formId, 
                    formConfig.formData, 
                    formConfig.formStatus, 
                    formConfig.formVersion, 
                    formConfig.startDate, 
                    formConfig.fontSize,
                    JsonToXml(binding));
            }
        });
    }

    protected loadDataIntoWebView(templateData: string, applicationName, formName, formId, formData, formStatus, formVersion, startDate, fontSize, contextXML): void {
        // method to create JSON string to call WebView's initData method
        let localFormData = formData;
        if (typeof(localFormData) !== 'string' || localFormData === 'PGZvcm0+PC9mb3JtPg==s') { // b64 to <form></form>
            localFormData = '';
        }
        const endDate = new Date().getTime();
        const timeDiff = endDate - startDate;

        const debugDelay = 0;

        // template data
        const JSMethodString = [
            templateData, 
            applicationName, 
            formName, 
            formId, 
            localFormData,
            formStatus, 
            formVersion, 
            this._cacheMaxLimit, 
            fontSize, 
            timeDiff, 
            contextXML,
            debugDelay].reduce((prev, current) => {
                return prev + '\'' + String(current) + '\',';
            }, 'initData(') + '\'\')';
        
        // call Webview's initData method
        this.evaluateJavaScript(JSMethodString);
    }

    public destroyForm() {
        this.evaluateJavaScript('destroyForm()');
    }

    public warmupForm(templateData, applicationName, formName, formVersion) {
        // template data
        const JSMethodString = [
            templateData, 
            applicationName, 
            formName, 
            formVersion].reduce((prev, current) => {
                return prev + '\'' + current + '\',';
            }, 'warmupForm(') + ')';
        this.evaluateJavaScript(JSMethodString);
    }

    public getIsFormDataSafe(callback: (_: boolean) => void, timeoutms: number) {
        const currentTimeout = this.isFormDataSafeTimeout;
        // avoid multiple calls
        if (currentTimeout) {
            return;
        }
        this.isFormDataSafeCallback = callback;
        const timeoutCallback = () => {
            this.isFormDataSafeTimeout = undefined;
            this.isFormDataSafeCallback = undefined;

            callback(false);
        }

        const timeout = setTimeout(timeoutCallback, timeoutms);
        this.isFormDataSafeTimeout = timeout;
        this.isFormDataSafeCallback = callback;

        this.evaluateJavaScript('postMessageIsFormDataSafe()');
    }

    public isFormDataSafeReturned(result: boolean) {
        const currentTimeout = this.isFormDataSafeTimeout;
        // avoid multiple calls
        if (!currentTimeout) {
            return;
        }

        clearTimeout(currentTimeout)

        const callback = this.isFormDataSafeCallback;
        callback(result);

        this.isFormDataSafeTimeout = undefined;
        this.isFormDataSafeCallback = undefined;
    }

    public abstract evaluateJavaScript(expression: string);
    public abstract resetHeight(width: number, height: number): void;
}