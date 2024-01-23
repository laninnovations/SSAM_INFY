declare var QuickActionBarBridge: any;

import {QuickActionBarControlDelegate} from '../Common/QuickActionBarControlDelegate';
import {QuickActionBarNativeObjects} from './QuickActionBarNativeObjects';

export class QuickActionBarManager {

    public create(params: any, qabExtension: any): QuickActionBarNativeObjects {
        let bridge = QuickActionBarBridge.alloc().initWithParams(params);
        let objects = new QuickActionBarNativeObjects()
        let delegate = QuickActionBarControlDelegate.initWithExtension(qabExtension);
        objects.delegate = delegate;
        bridge.delegate = delegate;
        objects.view = bridge.viewController;
        objects.bridge = bridge;
        return objects;
    }
};
