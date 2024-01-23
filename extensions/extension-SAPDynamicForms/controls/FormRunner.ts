import { IControl } from 'mdk-core/controls/IControl';
import { BaseObservable } from 'mdk-core/observables/BaseObservable';
import { ReusableWebView } from './ReusableWebView';
import { Application as app } from '@nativescript/core';
import { Screen } from '@nativescript/core';

export class FormRunner extends IControl {
    private _observable: BaseObservable;

    public static reusableWebView: ReusableWebView;
    //public static _webView: WKWebView;
    public static _formData: string;
    public static _applicationName: string;
    public static _formStatus: string;
    public static _formName: string;
    public static _formId: string;
    public static _formVersion;
    public static _startDate: number;
    public static _endDate: number;
    public static _cacheMaxLimit: number;
    public static _fontSize: string;
    public static _debug: boolean;
    public static _debugDelay: number;

    public initialize(props) {
        super.initialize(props);

        //start current time
        FormRunner._startDate = new Date().getTime();

        // setup web view
        const reusableWebView = ReusableWebView.getReusableWebView();
        FormRunner.reusableWebView = reusableWebView;

        reusableWebView.context = this.context;

        const sBinding = this.definition().data.ExtensionProperties.binding;
        const handlers = this.definition().data.ExtensionProperties.handlers;
        if (handlers && handlers.submissionHandler) {
            reusableWebView.submissionHandler = handlers.submissionHandler;
        }
        if (handlers && handlers.formTemplateDataHandler) {
            reusableWebView.formTemplateDataHandler = handlers.formTemplateDataHandler;
        }
         
        this.valueResolver().resolveValue(sBinding).then((resolvedValue) => {
            let htmlFileName = resolvedValue.fileName;
            const formConfig = {
                formData: resolvedValue.formData,
                applicationName: resolvedValue.applicationName,
                formName: resolvedValue.formName,
                formId: resolvedValue.formId,
                formStatus: resolvedValue.formStatus,
                formVersion: resolvedValue.formVersion,
                cacheMaxLimit: resolvedValue.cacheFormEntries,
                fontSize: resolvedValue.fontSize,
                startDate: FormRunner._startDate,
                debug: resolvedValue.debug || false,
                debugDelay: resolvedValue.debugDelay,
            }
            
            reusableWebView.formConfig = formConfig;

            // set cache max limit
            reusableWebView.setCacheMaxLimit(formConfig.cacheMaxLimit);

            if (FormRunner.reusableWebView.reloadRequired()) {
                reusableWebView.reloadWebView(formConfig);
            }
            else {
                reusableWebView.initialLoad(htmlFileName);
            }
        });
    }


    public view() {
        return FormRunner.reusableWebView.getNativeView();
    }

    public viewIsNative() {
        return true;
    }

    public observable() {
        if (!this._observable) {
            this._observable = new BaseObservable(this, this.definition(), this.page());
        }
        return this._observable;
    }

    public setContainer(container: IControl) {
        // do nothing
    }

    public setValue(value: any, notify: boolean, isTextValue?: boolean): Promise<any> {
        // do nothing
        return Promise.resolve();
    }

    public onPageLoaded() {
        app.on(app.orientationChangedEvent, this._fireOrientationChangedEvent, this);
    }

    public onPageUnloaded(pageExists) {
        setTimeout(function() {
            if (!FormRunner.reusableWebView.getIsApplicationSuspended()) {
                FormRunner.reusableWebView.destroyForm();
                app.off(app.orientationChangedEvent);
            } else {
                FormRunner.reusableWebView.setIsApplicationSuspended(false);
            }
        }, 100); 
    }

    public getWebView() {
        return FormRunner.reusableWebView;
    }

    private _fireOrientationChangedEvent(data: any) {
        if (data && data.newValue && data.newValue === 'portrait') {

            const width = Screen.mainScreen.heightDIPs > Screen.mainScreen.widthDIPs ? Screen.mainScreen.widthDIPs : Screen.mainScreen.heightDIPs;
            const height = Screen.mainScreen.heightDIPs > Screen.mainScreen.widthDIPs ? Screen.mainScreen.heightDIPs : Screen.mainScreen.widthDIPs;
            FormRunner.reusableWebView.resetHeight(width, height);
        }
    }
}
