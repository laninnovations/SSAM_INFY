import { DocumentEditorNativeObjects } from './DocumentEditorNativeObjects';

export class DocumentEditorControl {
    public create(params: any, extension: any): DocumentEditorNativeObjects {
        return new DocumentEditorNativeObjects()
    }
};
