import { IContext } from 'mdk-core/context/IContext';
import { ValueResolver} from 'mdk-core/utils/ValueResolver';
import { BaseExtensionParser } from 'extension-Common/BaseExtensionParser';

export class QuickActionBarParser extends BaseExtensionParser {
    public parse(fromValue: any, context: IContext, key: string): Promise<any> {
        if (fromValue) {
            if (typeof fromValue === 'string'
                && fromValue.indexOf('/Rules/') >= 0) {
                // This is a rule that should be evaluated
                return ValueResolver.resolveValue(fromValue, context, false).then((result) => {
                    return this.createBoundValue(key, result);
                });
            }
            return this.createPromiseValue(key, super.parseValue(fromValue, context));
        }
        return this.createPromiseValue(key, '');
    }
}