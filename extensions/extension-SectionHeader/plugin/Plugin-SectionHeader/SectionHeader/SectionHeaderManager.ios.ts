declare var SectionHeaderBridge: any;

import { SectionHeaderControlDelegate } from '../Common/SectionHeaderControlDelegate';
import { SectionHeaderNativeObjects } from './SectionHeaderNativeObjects';

export class SectionHeaderManager {

    public create(params: any, edtExtension: any): SectionHeaderNativeObjects {
        let bridge = SectionHeaderBridge.alloc().initWithParams(params);
        let objects = new SectionHeaderNativeObjects()
        let delegate = SectionHeaderControlDelegate.initWithExtension(edtExtension);
        objects.delegate = delegate;
        bridge.delegate = delegate;
        objects.view = bridge.viewController;
        objects.bridge = bridge;
        return objects;
    }
};
