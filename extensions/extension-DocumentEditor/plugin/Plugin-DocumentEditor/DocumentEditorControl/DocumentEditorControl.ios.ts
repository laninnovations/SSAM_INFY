declare var DocumentEditorBridge: any;

import {DocumentEditorNativeObjects} from './DocumentEditorNativeObjects';
import {DocumentEditorControlDelegate} from '../Common/DocumentEditorControlDelegate';

export class DocumentEditorControl {
    public create(params: any, extension: any): DocumentEditorNativeObjects {
        let bridge = DocumentEditorBridge.alloc().initWithParams(params);
        let objects = new DocumentEditorNativeObjects()
        let delegate = DocumentEditorControlDelegate.initWithExtension(extension);
        objects.delegate = delegate
        bridge.delegate = delegate;
        objects.view = bridge.viewController;
        objects.bridge = bridge;
        return objects;
    }
};
