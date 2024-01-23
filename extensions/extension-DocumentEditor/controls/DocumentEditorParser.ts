import { BaseExtensionParser } from './BaseExtensionParser';

export class DocumentEditorParser extends BaseExtensionParser {
    protected getFolderName(): string {
        return 'extension-DocumentEditor';
    }
};
