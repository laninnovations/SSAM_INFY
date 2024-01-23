import { IControl } from 'mdk-core/controls/IControl';
import { BaseExtensionObservable } from './BaseExtensionObservable';
import { BaseExtensionParser } from './BaseExtensionParser';
import { IDataService } from 'mdk-core/data/IDataService';
import { IDefinitionProvider } from 'mdk-core/definitions/IDefinitionProvider';
import { Context } from 'mdk-core/context/Context';
import { EventHandler } from 'mdk-core/EventHandler';
import { ITargetServiceSpecifier } from 'mdk-core/data/ITargetSpecifier';
import { ClientAPI, ControlProxy, PageProxy } from 'mdk-core/context/ClientAPI';
import { Utils } from './Utils';
import { IClientAPI } from 'mdk-core/context/IClientAPI';
import { DataQueryBuilder } from 'mdk-core/builders/odata/DataQueryBuilder';

interface IDQBClientAPI extends IClientAPI {
    dataQueryBuilder(query: string): DataQueryBuilder;
}

class DQBControlProxy extends ControlProxy implements IDQBClientAPI {
    dataQueryBuilder(query: string): DataQueryBuilder {
        return new DataQueryBuilder(this._context, query);
    }
}

class DQBContext extends Context {
    private DQBClientAPI: IDQBClientAPI
    public get clientAPI(): IDQBClientAPI {
        this.DQBClientAPI = this.DQBClientAPI ? this.DQBClientAPI : new DQBControlProxy(this);
        return this.DQBClientAPI;
    }
}

export class BaseExtension extends IControl {
    protected _viewController: any;
    protected _observable: BaseExtensionObservable;
    protected _params: any;
    protected _serviceURL: any;
    protected _bridge: any;
    protected _parser: BaseExtensionParser;
    protected _contextData: any;

    public initialize(props) {
        super.initialize(props);

        // Create a new context that uses the provided binding.
        const binding = props.context ? props.context.binding : null;
        this.context = new DQBContext(binding, this);

        let params = this.getParams();
        this._params = params;
        this.parseParameters(params, this.context);
        this._params.IsDemoMode = this.isDemoMode();
    }

    // TODO: Check Demo Mode from Snowblind
    public isDemoMode(): Boolean {
        return false;
    }

    public setContainer(container: IControl) {
        // do nothing
    }

    public setValue(value: any, notify: boolean): Promise<any> {
        return Promise.resolve();
    }

    public parseParameters(params, context) {
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

    public read(target: ITargetServiceSpecifier): Promise<any> {
        return this.getDataService().read(target)
    }

    public sendCallback(payload: any, type: string) {
        if (this._bridge != null) {
            this._bridge.callback(Utils.isAndroid() ? JSON.stringify(payload) : payload, type);
        }
    }

    public replaceParam(key, value, context) {
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
            } else if (value.indexOf('PLT,') >= 0) {
                const array = value.replace(/(\(|\))/g, "").split(',');
                if (array && array.length > 1) {
                    if (array.length > 2) {
                        return Utils.isAndroid() ? array[2] : array[1];
                    }
                    return array[1];
                }
            }
            let valueAsString = String(value);
            if (valueAsString.includes('.global')) {
                  // If this is a global, replace it with it's proper value
                  return IDefinitionProvider.instance().getDefinition(value).getValue();
            }
            value = this._parser.localizeValue(context, valueAsString);
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

    public getParams() {
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

    public runActionWithBinding(actionName) {
        let context = this.page().context;
        let pageAPI = <PageProxy> ClientAPI.Create(context);
        // Set the action binding to context binding
        pageAPI.setActionBinding(context.binding);

        const eventHandler = new EventHandler();
        return eventHandler.executeActionOrRule(actionName, context);
    }

    public getTargetService(target): ITargetServiceSpecifier {
        if (!target) {
            return null;
        }
        return {
            entitySet: target.EntitySet,
            keyProperties: target.KeyProperties,
            offlineEnabled: true,
            properties: target.Properties,
            queryOptions: target.QueryOptions,
            serviceUrl: this._serviceURL,
            uniqueIdType: 0,
        };
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

    public  ODataUpdate(params): Promise<any> {
       if (params) {
       return new Promise((resolve, reject) => {
        try {
            /**
             * Called to update an entity set from an ODataService.  Must be called on a service that is already open.
             *
             * @param {service: ITargetServiceSpecifier} - The properties of the service as specified in the metadata.
             * This could be empty.
             * @[] {deleteLinks: ITargetLinkSpecifier[]} - The links that are associated with the update.
             * @[] {createLinks: ITargetLinkSpecifier[]} - The links that are associated with the update.
             * @[] {updateLinks: ITargetLinkSpecifier[]} - The links that are associated with the update.
             * @[] {headers: Object}  - headers
             */
            this.getDataService().update(this.getTargetService(params), [], [], [], []).then(result => {
                 resolve(result);
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
      } else {
          console.log('Dictionary is empty');
      }
    }

    public getObject(schema, item): Promise<any> {
       let object = Utils.clone(schema);
       return new Promise((resolve, reject) => {
            this.bindParameters(item, object).then(result => {
                resolve(this.setObjectVisibility(object));
            });
        });
    }

    public bindParameters(object, params): Promise<any> {

        return new Promise((resolve, reject) => {
            let aPromises: Promise<any>[] = [];
            this._parser.setTarget(params.Target);
            aPromises.push(this._parser.bindParameters(object, params));
            return Promise.all(aPromises).then(results => {
                resolve(results);
            });
        });

    }

    public getPropertyValueFromMultipleBinding(value: string): any {
        let regex = /{(.+?)}/;
        let match;
        let results = [];
        for (match = regex.exec(value); match; match = regex.exec(value)) {
          let bindValue = this.getObjectsToBind(match[1]); // we expect this to return array of 1 element.
          value = value.replace(match[0], bindValue[0]);
        }
        return value;
    }

    public executeActionOrRule(rule: string, context = this.context): Promise<any> {
        let eventHandler = new EventHandler();
        return eventHandler.executeActionOrRule(rule, context);
    }

    /**
     * Fetch the user data embedded in extension
     */
    public getUserData() {
        if (this._params && this._params.UserData) {
            return this._params.UserData;
        }
        return undefined;
    }

    /**
     * Update the user data embedded in extension
     */
    public setUserData(userData: any) {
        if (this._params) {
            this._params.UserData = userData;
        }
    }

    protected getMockData(): any {
        // Sub class must override this if necessary
        return [];
    }

    protected getObjectsToBind(property): any[] {
        let contextData = this.contextData();
        let parts = property.split('/');
        let data;
        if (contextData) {
            data = Utils.clone(contextData);
        }
        let objects = [];
        if (data && parts) {
            parts.forEach((item, index) => {
                if (data && data.hasOwnProperty(item)) {
                    data = data[item];
                }
                if (index === parts.length - 1) {
                    if (data instanceof Array) {
                        objects = data;
                    } else {
                        objects.push(data);
                    }
                } else if (data instanceof Array) {
                    data = data[0]; // Always pick first element for now.
                }
            });
        }
        return objects;
    }

    protected bindProperty(property: string): any {
        if (property) {
            return this.getPropertyValueFromMultipleBinding(property);
        }
        return '';
    }

    protected bindObjects(schema, items): Promise<any> {
        return new Promise((resolve, reject) => {
            let aPromises: Promise<any>[] = [];
            for (let item of items) {
                aPromises.push(this.getObject(schema, item));
            }

            return Promise.all(aPromises).then(results => {
                resolve(results);
            });
        });

    }
    // Delete Action Items from the array based on it's visibility
    private setObjectVisibility(object): any {
        if (object.Actions) {
            for (let schema of object.Actions) {
                if (schema.IsVisible !== undefined && schema.IsVisible === false) {
                    // Get the index of the object that needs to be deleted and delete 1 object
                    object.Actions.splice(object.Actions.indexOf(schema), 1);
                }
            }
        }
        return object;
    }
};
