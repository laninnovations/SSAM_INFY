import { IControl } from 'mdk-core/controls/IControl';
import { BaseExtensionObservable } from './BaseExtensionObservable';
import { BaseExtensionParser } from './BaseExtensionParser';
import { IDataService } from 'mdk-core/data/IDataService';
import { IDefinitionProvider } from 'mdk-core/definitions/IDefinitionProvider';
import { Context } from 'mdk-core/context/Context';
import { EventHandler } from 'mdk-core/EventHandler';
import { ClientAPI, PageProxy } from 'mdk-core/context/ClientAPI';
import { Utils } from './Utils';
import { Device } from '@nativescript/core';
import { IControlData } from 'modules/mdk-core/controls/IControlData';

export class BaseExtension extends IControl {
    protected _viewController: any;
    protected _observable: BaseExtensionObservable;
    protected _params: any;
    protected _serviceURL: any;
    protected _bridge: any;
    protected _parser: BaseExtensionParser;
    protected _contextData: any;
    protected _nextPageLinkDict: any;
    protected _itemsPerPageDict: any;

    public initialize(controlData: IControlData) {
        super.initialize(controlData);

        if (!this.context) {
            // Create a new context that uses the provided binding.
            const binding = controlData.context ? controlData.context.binding : null;
            this.context = new Context(binding, this);
        }

        let params = this.getParams();
        this._params = params;
        this.parseParameters(params, this.context);
        // paging feature
        this._nextPageLinkDict = {};
        this._itemsPerPageDict = {};
    }

    public setContainer(container: IControl) {
        // do nothing
    }

    public setValue(value: any, notify: boolean): Promise<any> {
        return Promise.resolve();
    }

    protected sendCallback(payload: any, type: string) {
        if (this._bridge != null) {
            this._bridge.callback(Device.os === 'Android' ? JSON.stringify(payload) : payload, type);
        }
    }

    protected parseParameters(params, context) {
        if (params) {
            Object.keys(params).forEach(sKey => {

                if (sKey === 'ObjectScheme') {
                    // We don't want to dig into these before they have a context object
                    // In this first class function, this is the same as continue
                    return;
                }

                params[sKey] = this.replaceParam(sKey, params[sKey], context);
                if (params[sKey] !== null && typeof(params[sKey]) === 'object') {

                    this.parseParameters(params[sKey], context);
                }
                if (sKey === 'Service') {
                    this._serviceURL = IDataService.instance().urlForServiceName(params[sKey]);
                }
            });
        }
    }

    protected replaceParam(key, value, context) {
        if (typeof(value) === 'string') {
            if (value.indexOf('#Application') >= 0 && (value.indexOf('#ClientData') >= 0)) {
                //Application Data format is
                //#Application/#ClientData/UserId
                let property = value.split("/").slice(-1).pop();
                let appData = context.clientAPI.getPageProxy().getAppClientData();
                if (appData.hasOwnProperty(property)) {
                    return context.clientAPI.getPageProxy().getAppClientData()[property];
                } else {
                    return false;
                }
            } else if (value.indexOf('#Property') >= 0 && value.indexOf('#ClientData') >= 0) {
                //Client Data format is
                //#ClientData/#Property:Cats
                let property = value.split(":").slice(-1).pop();
                let clientData = context.clientAPI.getPageProxy().getClientData();
                if (clientData.hasOwnProperty(property)) {
                    return context.clientAPI.getPageProxy().getClientData()[property];
                } else {
                    return false;
                }
            }
            let valueAsString = String(value);
            if (valueAsString.includes('.global')) {
                  // If this is a global, replace it with it's proper value
                  return IDefinitionProvider.instance().getDefinition(value).getValue();
            }
            if (valueAsString.includes('$(L,')) {
                value = this._parser.localizeValue(context, valueAsString);
            }
        }

        return value;
    }

    public setStyle() {
        // No op
    }

    public setViewController(vc) {
        this._viewController = vc;
    }

    public getDataService() {
        return IDataService.instance();
    }

    public view() {
        return this._viewController;
    }

    public viewIsNative() {
        return true;
    }

    protected getParams() {
        if (!this._params) {
            let definition = this.definition();
            if (definition && definition.data) {
                if (definition.data.hasOwnProperty('ExtensionProperties')) {
                    return definition.data.ExtensionProperties;
                } else if (definition.data.hasOwnProperty('Extension')) {
                    return definition.data.Extension.ExtensionProperties;
                }
            }
        }
        return this._params;
    }

    // By default we will try to bind to text.  Any control that wants to do otherwise needs to override.
    public observable() {
       let observable =  this._observable || this.createObservable() as BaseExtensionObservable;
       return observable;
    }

    public createObservable() {
        let o = new BaseExtensionObservable(this);
        this.setObservable(o);
        return o;
    }

    public setObservable(observable) {
        this._observable = observable;
    }

    public runActionWithInfoAndService(actionInfo) {
        let action = actionInfo.Action;
        this.runAction(action, null);
    }

    public runAction(actionName, object) {
        let context = this.page().context;
        let pageAPI = <PageProxy> ClientAPI.Create(context);
        // Set the action binding and context binding to object
        // Object may be null
        pageAPI.setActionBinding(object);
        context.binding = object;

        const eventHandler = new EventHandler();
        return eventHandler.executeActionOrRule(actionName, context);
    }

    public contextData() {
        if (!this._contextData) {
            let cd = this.context.binding;
            if (cd) {
                this._contextData = Utils.clone(cd);
            }
        }
        return this._contextData;

    }

    public page() {
        return super.page();
    }

    public executeActionOrRule(rule: string, context = this.context): Promise<any> {
        let eventHandler = new EventHandler();
        return eventHandler.executeActionOrRule(rule, context);
    }
};
