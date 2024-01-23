declare var MapBridge: any;

import { MapControlDelegate } from '../Common/MapControlDelegate';

export class Map {

    protected _delegate: any;

    // Returns a view
    public create(params, dataService, mapExtension): any {
        // enable pagination when business objects are retrieved from an OData query 
        params.PaginationEnabled = !mapExtension.readFromContext();
        let bridge = MapBridge.alloc().initWithParams(params);
        mapExtension._bridge = bridge;
        this._delegate = MapControlDelegate.initWithExtension(mapExtension);
        bridge.delegate = this._delegate;
        let viewController = bridge.viewController;
        return viewController;
    }

    public getDelegate(): any {
        return this._delegate;
    }

    public setDelegate(delegate) {
        this._delegate = delegate;
    }
};
