interface HierarchyDelegate extends NSObjectProtocol {
    getObjectsType?(params: string, type: string): void;
    loadMoreItemsPagingParams?(queryParams: string, pagingParams: string): void;
    searchUpdatedSearchParams?(queryParams: string, searchParams: string): void;
    updateReturnValues?(ids: string): void;
    setReturnValues?(ids: string): void;
    getLocalizedValueParams?(key: string, params: string): string;
    runActionType?(jsonString: string, type: string);
}

declare var HierarchyDelegate: {
    prototype: HierarchyDelegate;
}

@NativeClass()
class HierarchyControlDelegate extends NSObject implements HierarchyDelegate {

    static ObjCProtocols = [HierarchyDelegate] // tslint:disable-line

    public static init(dataService, bridge, controlExtension): HierarchyControlDelegate {
        let controlDelegate = <HierarchyControlDelegate> HierarchyControlDelegate.new();
        controlDelegate._dataService = dataService;
        controlDelegate._controlExtension = controlExtension;
        return controlDelegate;
    }

    private _dataService: any;
    private _controlExtension: any;

    /**
     * Explicitly set reference to control extension
     * @param controlExtension 
     */
    public setControlExtension(controlExtension) {
        this._controlExtension = controlExtension;
    }

    public getObjectsType(params: string, type: string) {
        try {
            this.fetchBusinessObjects(params, type);
        } catch (e) {
            console.log(e);
        }
    }
    
    public runActionType(jsonString: string, type: string) {
        let actionJson = JSON.parse(jsonString);
        this._controlExtension.runActionWithInfoAndService(actionJson, type, this._dataService);
    }

    public loadMoreItemsPagingParams(queryParams, pagingParams) {
        let pagingParam = JSON.parse(pagingParams);
        this._controlExtension.loadMoreItems(queryParams, pagingParam.currentPage, pagingParam.itemsPerPage);
    }

    public searchUpdatedSearchParams(queryParams, searchParams) {
        let params = JSON.parse(searchParams);
        this._controlExtension.searchUpdated(queryParams, params.searchString, params.currentPage, 
            params.itemsPerPage);
    }

    public updateReturnValues(ids) {
        let valueArray = JSON.parse(ids);
        if (valueArray.length > 1) {
            this._controlExtension.updateReturnValues(valueArray);
        } else  if (valueArray.length === 1) {
            this._controlExtension.updateReturnValue(valueArray[0]);
        } else {
            this._controlExtension.updateReturnValue(''); // Send empty string
        }
    }

    public setReturnValues(ids) {
        let valueArray = JSON.parse(ids);
        if (valueArray.length > 1) {
            this._controlExtension.setReturnValue(valueArray);
        } else  if (valueArray.length === 1) {
            this._controlExtension.setReturnValue(valueArray[0]);
        }
    }

    public getLocalizedValueParams(key, params): any {
        return this._controlExtension.getExtensionLocalizedValue(key, JSON.parse(params));
    }

    protected fetchBusinessObjects(dictionary, type) {
        if (this._controlExtension) {
            this._controlExtension.getObjects(dictionary, type);
        }
    }
}

export { HierarchyControlDelegate }