declare var EditableDataTableBridge: any;

import { EditableDataTableControlDelegate } from '../Common/EditableDataTableControlDelegate';
import { EditableDataTableNativeObjects } from './EditableDataTableNativeObjects';

export class EditableDataTableManager {

    public create(params: any, edtExtension: any): EditableDataTableNativeObjects {
        let bridge = EditableDataTableBridge.alloc().initWithParams(params);
        let objects = new EditableDataTableNativeObjects()
        let delegate = EditableDataTableControlDelegate.initWithExtension(edtExtension);
        objects.delegate = delegate;
        bridge.delegate = delegate;
        objects.view = bridge.viewController;
        objects.bridge = bridge;
        return objects;
    }
};
