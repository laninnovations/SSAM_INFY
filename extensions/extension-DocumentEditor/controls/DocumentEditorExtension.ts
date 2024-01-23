import { BaseExtension } from './BaseExtension';
import { DocumentEditorParser } from './DocumentEditorParser';
import { DocumentEditorControl } from 'extension-DocumentEditor';
import { ValueResolver} from 'mdk-core/utils/ValueResolver';

export class DocumentEditorExtension extends BaseExtension {
    protected _delegate: any;
    protected _isEditMode: any;
    protected _isCropMode: any;

    public initialize(props) {
        this._parser = new DocumentEditorParser();

        super.initialize(props);

        let control: DocumentEditorControl = new DocumentEditorControl();
        const fileName = this.context.binding.Document.FileName
        var params = this.getParams();
        params['FileName'] = fileName
        let objects = control.create(params, this);

        this._delegate = objects.delegate;
        this._bridge = objects.bridge;
        this._isEditMode = false;
        this._isCropMode = false;
        this.setViewController(objects.view);
    }

    // metadata to mdk / native

    public isEditMode() {
        return this._isEditMode;
    }

    public enterEditMode() {
        if (!this._isEditMode) {
            this.sendCallback({}, 'EnterEditMode');
            this._isEditMode = true;
        }
    }

    public exitEditMode() {
        if (this._isEditMode) {
            this.sendCallback({}, 'ExitEditMode');
            this._isEditMode = false;
        }
    }

    public isCropMode() {
        return this._isCropMode;
    }

    public enterCropMode() {
        if (!this._isCropMode) {
            this.sendCallback({}, 'EnterCropMode');
            this._isCropMode = true;
        }
    }

    public exitCropMode() {
        if (this._isCropMode) {
            this.sendCallback({}, 'ExitCropMode');
            this._isCropMode = false;
        }
    }

    public clearAnnotations() {
        if (this._isEditMode) {
            this.sendCallback({}, 'ClearAnnotations');
        }
    }

    public saveFile(fileInfo) {
        if (fileInfo) {
            this.sendCallback({FileInfo: fileInfo}, 'SaveFile');
        }
    }

    // native to mdk
    
    public onCreate() {
        let config = this.getParams().Config;
        if (Object.keys(config).length > 0) {
            ValueResolver.resolveKeyValues(config, this.context).then((result) => {
                this.sendCallback(result, 'UpdateConfig');
                this.openFile();
            });
        } else {
            this.openFile();
        }
    }

    public onSave() {
        let callback = this.getParams().OnSave;
        if (callback) {
            this.executeActionOrRule(callback, this.context);
        }
    }

    public onPageUnloaded(pageExists: boolean) {
        if (!pageExists) {
            // Page is being unloaded and does not exists on the back stack
            // It should be told to drop extra resources
            this.sendCallback({}, 'Reset')
            this._delegate.setControlExtension(undefined);
            this._delegate = undefined;
            this.setViewController(undefined);
            this._bridge = undefined;
        }
    }

    public onDelete() {
        let callback = this.getParams().OnDelete;
        if (callback) {
            this.executeActionOrRule(callback, this.context);
        }
    }

    public getExtensionLocalizedValue(key, params): any {
        return this._parser.getExtensionLocalizedValue(key, params, this.context);
    }

    private openFile() {
        let callback = this.getParams().FileInfo;
        if (callback) {
            this.executeActionOrRule(callback, this.context).then(fileInfo => {
                this.sendCallback({FileInfo: fileInfo}, 'OpenFile');
            });
        }
    }
}

