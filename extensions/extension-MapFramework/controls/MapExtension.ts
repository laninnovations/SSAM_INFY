import { BaseExtension } from 'extension-Common/BaseExtension';
import { Utils } from 'extension-Common/Utils';
import { MapBridge } from 'extension-MapFramework';
import { MapParser } from './MapParser';
import { Device } from '@nativescript/core';

import { ValueResolver} from 'mdk-core/utils/ValueResolver';
import { ClientAPI, ControlProxy, PageProxy } from 'mdk-core/context/ClientAPI';

export class MapExtension extends BaseExtension {

    // Hold reference to the delegate so it isn't immediately collected by ARC
    protected _delegate: any;
    protected _objectSchemeMap: any;
    protected _editModeInfo: any;
    protected _configParams: any;
    protected _nextPageLinkDict: any;
    protected _lastCallbackData: any;

    public initialize(props) {
        this._parser = new MapParser();
        this._editModeInfo = {};
        this._configParams = undefined;
        this._nextPageLinkDict = {};
        super.initialize(props);
        let map = new MapBridge();
        let mapViewController = map.create(this.getParams(), this.getDataService(), this);
        this._delegate = map.getDelegate();
        this.setViewController(mapViewController);
    }

    public getExtensionLocalizedValue(key, params): any {
        return this._parser.getExtensionLocalizedValue(key, params, this.context);
    }

    public parseParameters(params, context) {
        super.parseParameters(params, context);

        let businessObjects = params.BusinessObjects;
        if (businessObjects !== undefined && Array.isArray(businessObjects)) {
            this._objectSchemeMap = {};
            businessObjects.forEach(element => {
                // Copy the object scheme into a map for formatting objects
                if (element.Target === undefined || //
                    element.Type === undefined || //
                    element.ObjectScheme === undefined) {
                    // Not configured properly, continue
                    return;
                }
                this._objectSchemeMap[element.Type] = Utils.clone(element.ObjectScheme);
            });
        }
    }

    public getObjectSchema(type) {
        return this._objectSchemeMap[type];
    }

    public getObjects(params): any {
        let target = params.Target;
        let entitySet = target.EntitySet;
        let schema = this.getObjectSchema(params.Type);
        // If schema is empty, return immediately
        if (Object.keys(schema).length === 0) {
            return Promise.resolve();
        }

        if (this.readFromContext()) {
            return this.getObjectsFromContext(schema, entitySet);
        }
        let queryOptions = target.QueryOptions;
        return ValueResolver.resolveValue(queryOptions, this.context).then((result) => {
            target.QueryOptions = result;
            return this.getObjectsFromService(target, schema).then(objects => {
                let editParams = this.getParams().EditMode;
                if (objects && this.readFromContext() && editParams && editParams.InitialParams &&
                    editParams.InitialParams.EntitySet === params.Target.EntitySet) {
                    return this.runAction(editParams.InitialParams.GeometryValue, null).then(result => {
                        if (result && result.length > 0) {
                            objects[0].Geometry = result;
                        }
                        return objects;
                    });
                } else {
                    return objects;
                }
            });
        });
    }

    public getObjectActions(jsonDictionary: any, filter: any): any {
        const type = jsonDictionary.Type;
        const objectSchema = this.getObjectSchema(type);

        if (objectSchema && filter) {
            const target = jsonDictionary.Target;
            target.QueryOptions = filter.QueryOptions;
            objectSchema.Actions = jsonDictionary.Actions;

            return this.getUpdatedObjectFromService(objectSchema, jsonDictionary).then((objects) => {
                delete objectSchema.Actions;
                return objects;
            });
        }
    }

    public onPageLoaded(pageExists: boolean) {
        if (Device.os === 'Android') {
            this.sendCallback('', 'Resume')
        }
    }

    /**
     * Called when the parent page is unloaded.
     * @param pageExists Whether or not the page still exists on the stack after unload
     */
    public onPageUnloaded(pageExists: boolean) {

        if (!pageExists) {
            // Page is being unloaded and does not exists on the back stack
            // It should be told to drop extra resources
            this.sendCallback({}, 'Reset')
            this._delegate.setControlExtension(undefined);
            this._delegate = undefined;
            this.setViewController(undefined);
            this._bridge = undefined;
        } else {
            if (Device.os === 'Android') {
                // When navigating from Overview
                this.sendCallback('', 'Pause')
            }
        }
    }

    public onNavigatedTo(pageExists: boolean) {
        if (Device.os === 'Android') {
            this.sendCallback('', 'NavigatedTo')
        }
    }

    public onDisplayingModal(isFullPage: boolean) {
        // to be implemented
    }

    get isBindable(): boolean {
        return true;
    }

    public bind(): Promise<any> {
        return this.observable().bindValue(this.definition().getValue());
    }

    public onDataChanged(action: any, result: any) {
        if (this._bridge !== null && result !== null) {
            const soArr = ['S4ObjectID', 'Job'];
            const woArr = ['OrderId', 'Job', 'WOGeometries'];
            const noArr = ['NotificationNumber', 'Notification', 'NotifGeometries'];
            const eqArr = ['EquipId', 'Equipment', 'EquipGeometries'];
            const flArr = ['FuncLocIdIntern', 'FunctionalLocation', 'FuncLocGeometries'];
            const geoMap = {
                'ORH': woArr, 'NO1': noArr, 'IEQ': eqArr, 'IFL': flArr
            };
            const objMap = {
                '#sap_mobile.MarkedJob': woArr,
                '#sap_mobile.MyWorkOrderHeader': woArr,
                '#sap_mobile.MyNotificationHeader': noArr,
                '#sap_mobile.MyEquipment': eqArr,
                '#sap_mobile.MyFunctionalLocation': flArr
            }
            const json = JSON.parse(result);
            const type = json['@odata.type'];

            if (type === '#sap_mobile.Geometry') {
                const tag = geoMap[json.ObjectType][0];
                const val = geoMap[json.ObjectType][1];
                const nav = geoMap[json.ObjectType][2];

                if (json.SpacialId) { // downloaded
                    this.getDataService().read({
                        entitySet: 'Geometries', keyProperties: [], offlineEnabled: true, properties: [],
                        queryOptions: `$filter=SpacialId eq '${json.SpacialId}'&$expand=${nav}`,
                        serviceUrl: this._serviceURL, uniqueIdType: 0,
                    }).then(objects => {
                        if (objects && objects.length > 0) {
                            const id = objects.getItem(0)[nav][0][tag]
                            this.updateObject(`${tag} eq '${id}'`, id, val);
                        }
                    });
                } else { // local
                    this.updateObject(`${tag} eq '${json.ObjectKey}'`, json.ObjectKey, val);
                }
            } else if (type === '#sap_mobile.PMMobileStatus' && json.ObjectType === 'WII') {  // WCM
                this.getDataService().read({
                    entitySet: `${json['@odata.readLink']}/WCMDocumentItem_Nav`, keyProperties: [], offlineEnabled: true, properties: [],
                    queryOptions: '',
                    serviceUrl: this._serviceURL, uniqueIdType: 0,
                }).then(objects => {
                    if (objects && objects.length > 0) {
                        const wcmDocumentItem = objects.getItem(0);
                        this.updateObject(`WCMDocument eq '${wcmDocumentItem.WCMDocument}' and WCMDocumentItem eq '${wcmDocumentItem.WCMDocumentItem}'`, wcmDocumentItem.ObjectNumber, 'OperationalItem');
                    }
                });
            } else if (type === '#sap_mobile.WCMDocumentItem' && json.WCMDocument && json.WCMDocumentItem) {
                // ignore this case, because the necessary update happens with the related pmmobilestatus change
            } else if (type === '#sap_mobile.PMMobileStatus' && json.OrderId) {
                this.updateObject(`${woArr[0]} eq '${json.OrderId}'`, json.OrderId, woArr[1]);
            } else if (type === '#sap_mobile.PMMobileStatus' && json.S4ObjectID) {
                this.updateObject(`${soArr[0]} eq '${json.S4ObjectID}'`, json.S4ObjectID, soArr[1]);
            } else {
                this.updateObject(`${objMap[type][0]} eq '${json[objMap[type][0]]}'`, json[objMap[type][0]], objMap[type][1]);
            }
        }
    }

    /**
     * If the extension is not added to the view controller heirarchy,
     * this method is used to manually trigger a map update
     */
    public update() {
        this.sendCallback({}, 'Update')
    }

    /**
     * Tell the map to perform a user action update.
     * This means update the objects without resetting view bounds
     * as well as updating details menu (if needed)
     */
    public userActionUpdate() {
        this.sendCallback({}, 'UserActionUpdate')
    }

    public clearUserDefaults() {
        this.sendCallback({}, 'ClearUserDefaults')
    }

    public clearRouteCache() {
        this.sendCallback({}, 'ClearRouteCache')
    }

    public resetPaging() {
        this._nextPageLinkDict = {};
    }

    public cacheConfigParams(configParams) {
        this._configParams = configParams;
    }

    public isInitialized() {
        return this._configParams === undefined;
    }

    public fetchConfig() {
        if (!this.isInitialized()) {
            this._delegate.fetchConfig(this._configParams, 'Config');
        }
    }

    public enterEditMode(editModeConfig: any) {
        this._editModeInfo = {};
        this.sendCallback(editModeConfig, 'EnterEditMode');
    }

    public leaveEditMode(editModeInfo: any, callBackInfo: any) {
        this.page().editModeInfo = JSON.parse(editModeInfo);
        this._editModeInfo = JSON.parse(editModeInfo);
        if (callBackInfo && callBackInfo.length > 0) {
            this.runActionWithDataService(JSON.parse(callBackInfo));
        }
    }

    public getEditModeInfo() {
        return this._editModeInfo;
    }


    /**
     *  Execute an action from the extension given information and access to a dataservice
     *
     * @Parameter actionInfo: Key Value pairs providing specifics of the action
     * @Parameter type: Brief identifier for action. TODO: Remove this parameter
     */
    // TODO: Remove 'type' as it is no longer used. Keeping for now to avoid breaks elsewhere
    public runActionWithInfoAndService(actionInfo, type) {
        switch (type) {
            case 'ESRIToken':
                this.runAction(this._params.TokenAuthentication.Action, null).then((result) => {
                    this.sendCallback(result, type);
                });
                break;
            case 'AllowEnterEditMode':
                if (this._params.EditMode && this._params.EditMode.OnAllowEnterEditMode) {
                    this.runAction(this._params.EditMode.OnAllowEnterEditMode, null);
                }
                break;
            case 'DisallowEnterEditMode':
                if (this._params.EditMode && this._params.EditMode.OnDisallowEnterEditMode) {
                    this.runAction(this._params.EditMode.OnDisallowEnterEditMode, null);
                }
                break;
            case 'FeatureLayer':
                this._lastCallbackData = actionInfo.CallbackData;
                this.runAction(actionInfo.Action, null);
                break;
            default:
                let action = actionInfo.Action;
                let targetService = this.getTargetService(actionInfo.Target);
                if (targetService) {
                    this.read(targetService).then(result => {
                        if (result.length === 1) {
                            let item = result.getItem(0);
                            this.runAction(action, item);
                        } else {
                            this.runAction(action, null);
                        }
                    });
                } else {
                    this.runAction(action, null);
                }
        }
    }

    public getLastCallbackData(): any {
        return this._lastCallbackData;
    }


    public getValueFromTargetPaths(path: string, context: any): string {
        if (path) {
            let match;
            let regex = /{{(.+?)}}/g;
            let pageAPI = <PageProxy> ClientAPI.Create(context);
            for (match = regex.exec(path); match; match = regex.exec(path)) {
                let bindValue = pageAPI.evaluateTargetPath(match[1]);
                path = path.replace(match[0], bindValue.toString());
            }
            return path;
         } else {
            return '';
         }
    }

    protected readFromContext() {
        return false;
    }

    protected getObjectsFromService(target, schema): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            try {
                const queryOptions = target.QueryOptions;
                const skipToken = this._nextPageLinkDict[queryOptions];

                if (skipToken === 'EOF') {
                    resolve([]);
                } else {
                    this.updateQueryOptions(target, skipToken);
                    let targetService = this.getTargetService(target);
                    const pageSize = this.getPageSize()
                    this.getDataService().readWithPageSize(targetService, pageSize).then(result => {
                        this._nextPageLinkDict[queryOptions] = this.getSkiptoken(result.nextLink);
                        // convert to a regular json array
                        let array = [];
                        for (let i = 0; i < result.Value.length; i++) {
                            array.push(result.Value.getItem(i));
                        }
                        this.bindObjects(schema, array).then(objects => {
                            resolve(objects);
                        });
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    protected runActionWithDataService(object: any) {
        let action = object.Action;
        let targetService = this.getTargetService(object.Target);
        return this.read(targetService).then(result => {
            if (result.length === 1) {
                let item = result.getItem(0);
                return this.runAction(action, item);
            }
            return this.runAction(action, null);
        });
    }

    protected updateObject(uniqueFilterTerm: string, idValue: string, type: string) {
        const cachedBOs = this.getParams().BusinessObjects;
        if (cachedBOs) {
            cachedBOs.forEach(bo => {
                if (bo.Type === type || (bo.Type === 'RouteStop' && type === 'Job')) {
                    // deep copy for no updating cached params
                    const clonedBO = JSON.parse(JSON.stringify(bo));
                    let schema = this.getObjectSchema(clonedBO.Type);
                    if (Object.keys(schema).length > 0) {
                        // cache old queryOptions
                        const queryOptions = clonedBO.Target.QueryOptions;
                        // compose spcific query
                        if (queryOptions.includes('.js')) {
                            this.executeActionOrRule(queryOptions, this.context).then(result => {
                                if (result && result.length > 0) {
                                    clonedBO.Target.QueryOptions = `${result} and (${uniqueFilterTerm})`;
                                    this.searchDatabase(clonedBO, schema, idValue, bo.Type, queryOptions);
                                }
                            });
                        } else {
                            clonedBO.Target.QueryOptions += ` and (${uniqueFilterTerm})`;
                            this.searchDatabase(clonedBO, schema, idValue, bo.Type, queryOptions);
                        }
                    }
                }
            });
        }
    }


    protected getUpdatedObjectFromService(schema, json): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let targetService = this.getTargetService(json.Target);
                this.getDataService().read(targetService).then(result => {
                    // convert to a regular json array
                    let array = [];
                    for (let i = 0; i < result.length; i++) {
                        array.push(result.getItem(i));
                    }
                    this.bindObjects(schema, array).then(objects => {
                        resolve(objects);
                    });
                });
            } catch (error) {
                console.log(error);
            }
        });
    }

    protected getObjectsFromContext(schema, property): Promise<any> {
        let objects = this.getObjectsToBind(property);
        if (objects && objects.length === 0 && this.isDemoMode()) {
            objects = this.getMockData();
        }

        return this.bindObjects(schema, objects);
    }

    private searchDatabase(clonedBO, schema, idValue: string, type: string, queryOptions) {
        this.getUpdatedObjectFromService(schema, clonedBO).then(newBOs => {
            // recover old queryOptions
            clonedBO.Target.QueryOptions = queryOptions;
            if (!newBOs) {
                return;
            }
            // delete old object
            if (newBOs.length === 0) {
                // lite version of business objects
                clonedBO.Objects = [{'Layer': `${type}`, 'Properties': {'ID': `${idValue}`}}];
                this.sendCallback(clonedBO, 'BusinessObjectDelete');
            } else { // update new objects
                clonedBO.Objects = newBOs;
                this.sendCallback(clonedBO, 'BusinessObjectUpdate');
            }

            if (newBOs.length && newBOs.some(bo => bo.Layer === 'OperationalItem')) {  // update actions for operational items -- tagging/untagging
                this.sendCallback(clonedBO, 'ObjectActionsUpdate');
            }
        });
    }

    private getPageSize(): number {
        const itemsPerPage = this.getParams().ItemsPerPage;
        return itemsPerPage ? itemsPerPage : 100;
    }

    private getSkiptoken(data): string {
        if (data && data !== '') {
            let key = '$skiptoken=';
            let index = data.indexOf(key);
            if (index !== -1) {
                return data.substring(index + key.length);
            }
        }
        return 'EOF';
    }

    // Update queryOptions with paging parameters
    private updateQueryOptions(target, skipToken) {
        if (skipToken && skipToken !== '' && target) {
            target.QueryOptions += '&$skiptoken=' + skipToken;
        }
    }
};
