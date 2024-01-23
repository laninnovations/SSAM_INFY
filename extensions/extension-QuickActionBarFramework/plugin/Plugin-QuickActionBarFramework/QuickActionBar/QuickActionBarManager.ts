import { QuickActionBarNativeObjects } from './QuickActionBarNativeObjects';

export class QuickActionBarManager {
    public create(params: any, extension: any): QuickActionBarNativeObjects {
        return new QuickActionBarNativeObjects();
    }
};
