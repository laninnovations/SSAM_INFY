import libCommon from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function FunctionalLocationUpdateNav(context) {
    if (context.binding['@sap.isLocal']) {
        let pageProxy = context;
        if (typeof pageProxy.getPageProxy === 'function') { 
            pageProxy = context.getPageProxy();
        }

        libCommon.setOnCreateUpdateFlag(context, 'UPDATE');
        return context.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/DocumentAddEditFLNav.action');
    }

    return context.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/DocumentAddEditFLNav.action');
}
