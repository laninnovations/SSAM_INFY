import matDocDelete from '../Inventory/MaterialDocument/MaterialDocumentDeleteWrapper';
import updateHeaderStatus from '../Inventory/InboundOrOutbound/InboundOrOutboundUpdateHeaderStatus';
import userFeaturesLib from '../UserFeatures/UserFeaturesLibrary';
import meterDiscard from '../Meter/CreateUpdate/DiscardReadings';
import removePhysicalInventoryDoc from '../Inventory/PhysicalInventory/RemovePhysicalInventoryDoc';
import libCom from '../Common/Library/CommonLibrary';
import IsCompleteAction from '../WorkOrders/Complete/IsCompleteAction';

export default function DiscardAction(context) {
    let assnTypeLevel;
    let action = Promise.resolve();

    let actionName = '/SAPAssetManager/Actions/DiscardWarningMessage.action';
    if (IsCompleteAction(context)) {
        actionName = {
            'Name': '/SAPAssetManager/Actions/DiscardWarningMessage.action',
            'Properties': {
                'Message': '$(L,shorten_delete_message)',
            },
        };
    }

    return context.executeAction(actionName).then(successResult => {
        if (successResult.data) {
            let erroPageExists = false;
            try {
                if (context.getPageProxy().evaluateTargetPathForAPI('#Page:ErrorArchiveDetailsPage').getActionBinding().ErrorObject) {
                    erroPageExists = true;
                }
            } catch (error) {
                // do nothing
            }
            if (erroPageExists) {
                let readLink = context.getPageProxy().evaluateTargetPathForAPI('#Page:ErrorArchiveDetailsPage').getActionBinding().ErrorObject.ReadLink;
                return context.read('/SAPAssetManager/Services/AssetManager.service', readLink, [], '').then(result => {
                    context.getPageProxy().setActionBinding(result.getItem(0));
                    action = context.getPageProxy().executeAction('/SAPAssetManager/Actions/Common/ErrorArchiveDiscard.action');
                });
            } else {
                const entityName = context.binding['@odata.type'].split('.')[1];
                let serialNumbers = [];
                if (entityName === 'InboundDeliveryItem') {
                    serialNumbers = context.binding.InboundDeliverySerial_Nav;
                } else if (entityName === 'OutboundDeliveryItem') {
                    serialNumbers = context.binding.OutboundDeliverySerial_Nav;
                }
                switch (entityName) {
                    case 'MyWorkOrderHeader':
                        action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/CreateUpdate/WorkOrderDelete.action');
                        break;
                    case 'MyWorkOrderOperation':
                        action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationDelete.action');
                        break;
                    case 'MyWorkOrderSubOperation':
                        action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationDelete.action');
                        break;
                    case 'MyNotificationItemActivity':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemActivityDiscard.action');
                        break;
                    case 'MyNotificationItemTask':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemTaskDiscard.action');
                        break;
                    case 'MyNotificationItemCause':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCauseDiscard.action');
                        break;
                    case 'MyNotificationItem':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemDiscard.action');
                        break;
                    case 'MyNotificationTask':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Task/NotificationTaskDiscard.action');
                        break;
                    case 'MyNotificationActivity':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/Activity/NotificationActivityDiscard.action');
                        break;
                    case 'MyNotificationHeader':
                        action = context.executeAction('/SAPAssetManager/Actions/Notifications/NotificationDiscard.action');
                        break;
                    case 'MeasurementDocument':
                        action = context.executeAction('/SAPAssetManager/Actions/Measurements/MeasurementDocumentDiscard.action');
                        break;
                    case 'CatsTimesheet':
                        action = context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryDiscard.action');
                        break;
                    case 'MyWorkOrderComponent':
                        action = context.executeAction('/SAPAssetManager/Actions/Parts/PartDelete.action');
                        break;
                    case 'MaterialDocument':
                        action = matDocDelete(context); //We handle these differently depending on type
                        break;
                    case 'Confirmation':
                        assnTypeLevel = libCom.getWorkOrderAssnTypeLevel(context);
                        if (assnTypeLevel === 'Header') {
                            action = DiscardOrderMobileStatus(context);
                        } else if (assnTypeLevel === 'Operation') {
                            action = DiscardOperationMobileStatus(context);
                        }
                        break;
                    case 'MyWorkOrderTool':
                        action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/PRT/CreateUpdate/PRTEquipmentDelete.action');
                        break;
                    case 'WorkOrderTransfer':
                        action = context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferDelete.action');
                        break;
                    case 'ChecklistBusObject':
                        action = context.executeAction('/SAPAssetManager/Actions/Checklists/ChecklistDelete.action');
                        break;
                    case 'LAMCharacteristicValue':
                        action = context.executeAction('/SAPAssetManager/Actions/LAM/LAMCharacteristicValueDelete.action');
                        break;
                    case 'LAMObjectDatum':
                        action = context.executeAction('/SAPAssetManager/Actions/LAM/LAMObjectDataDelete.action');
                        break;
                    case 'MaterialDocItem':
                        action = context.executeAction('/SAPAssetManager/Actions/Inventory/MaterialDocumentItem/MaterialDocItemDelete.action');
                        break;
                    case 'InboundDeliveryItem':
                        action = context.executeAction({
                            'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                            'Properties': {
                                'Target': {
                                    'EntitySet': 'InboundDeliveryItems',
                                    'Service': '/SAPAssetManager/Services/AssetManager.service',
                                    'EditLink': context.binding['@odata.readLink'],
                                },
                            },
                        }).then(() => {
                            return updateHeaderStatus(context, context.binding.DeliveryNum).then(() => {
                                let serialNumberCreates = [];
                                if (serialNumbers.length) {
                                    serialNumberCreates = AddSerialNumbersInboundOutbound(context, 'InboundDeliverySerials', 'InboundDeliveryItem_Nav', 'InboundDeliveryItems', serialNumbers);
                                }
                                return Promise.all(serialNumberCreates).then(() => {
                                    return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
                                });
                            });
                        });
                        break;
                    case 'OutboundDeliveryItem':
                        action = context.executeAction({
                            'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                            'Properties': {
                                'Target': {
                                    'EntitySet': 'OutboundDeliveryItems',
                                    'Service': '/SAPAssetManager/Services/AssetManager.service',
                                    'EditLink': context.binding['@odata.readLink'],
                                },
                            },
                        }).then(() => {
                            return updateHeaderStatus(context, context.binding.DeliveryNum).then(() => {
                                let serialNumberCreates = [];
                                if (serialNumbers.length) {
                                    serialNumberCreates = AddSerialNumbersInboundOutbound(context, 'OutboundDeliverySerials', 'OutboundDeliveryItem_Nav', 'OutboundDeliveryItems', serialNumbers);
                                }
                                return Promise.all(serialNumberCreates).then(() => {
                                    return context.executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
                                });
                            });
                        });
                        break;
                    case 'MyFunctionalLocation':
                        action = context.executeAction('/SAPAssetManager/Actions/FunctionalLocation/CreateUpdate/FunctionalLocationDiscard.action');
                        break;
                    case 'OrderISULink':
                        if (userFeaturesLib.isFeatureEnabled(context, context.getGlobalDefinition('/SAPAssetManager/Globals/Features/Meter.global').getValue())) {
                            return meterDiscard(context);
                        }
                        break;
                    case 'MyEquipment':
                        action = context.executeAction('/SAPAssetManager/Actions/Equipment/CreateUpdate/EquipmentDiscard.action');
                        break;
                    case 'PhysicalInventoryDocItem':
                        action = context.executeAction('/SAPAssetManager/Actions/Inventory/PhysicalInventory/PhysicalInventoryDocItemDiscard.action');
                        break;
                    case 'PhysicalInventoryDocHeader':
                        return removePhysicalInventoryDoc(context);
                    default:
                        break;
                }
            }
        }
        return action;
    });
}

function AddSerialNumbersInboundOutbound(context, entityset, navigation, parent, serialNumbers) {
    const result = [];

    serialNumbers.forEach(item => {
        if (!libCom.isCurrentReadLinkLocal(item['@odata.readLink'])) {
            if (item['@sap.isLocal'] === true) {
                result.push(context.executeAction({
                    'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                    'Properties': {
                        'Target': {
                            'EntitySet': entityset,
                            'Service': '/SAPAssetManager/Services/AssetManager.service',
                            'EditLink': item['@odata.readLink'],
                        },
                    },
                }));
            }
        } else {
            result.push(context.executeAction({'Name': '/SAPAssetManager/Actions/Inventory/InboundOutbound/InboundOutboundDeliverySerialDelete.action', 'Properties': {
                'Target': {
                    'EntitySet': entityset,
                    'Service': '/SAPAssetManager/Services/AssetManager.service',
                    'ReadLink':  item['@odata.readLink'],
                },
                'Properties': {
                    'SerialNumber': item.SerialNumber,
                },
                'DeleteLinks': [{
                    'Property': navigation,
                    'Target':
                    {
                        'EntitySet': parent,
                        'ReadLink': context.binding['@odata.readLink'],
                    },
                }],
            }}));
        }
    });

    return result;
}


function DiscardOperationMobileStatus(context) {
    let action = context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationDelete.action').then(() => {
        if (context.binding.WorkOrderOperation.OperationMobileStatus_Nav.MobileStatus === 'COMPLETED' && context.binding.WorkOrderOperation.OperationMobileStatus_Nav['@odata.editLink']) {
            //add return or not?
             return context.read('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatusHistories', [], `$filter=sap.islocal() and ObjectKey eq '${context.binding.WorkOrderOperation.OperationMobileStatus_Nav.ObjectKey}'`).then(record => {
                let linksHis = [];
                if (record && record.length > 0) {
                    for (let i = 0; i < record.length; i++) {
                        let editLink = record.getItem(i)['@odata.editLink'];

                        linksHis.push(context.executeAction({
                            'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                            'Properties': {
                            'Target': {
                                'EntitySet': 'PMMobileStatusHistories',
                                'Service': '/SAPAssetManager/Services/AssetManager.service',
                               // 'EditLink': record.getItem(0)['@odata.editLink'],
                                'EditLink': editLink,
                                },
                            },
                        }));
                    }
                }
                return Promise.all(linksHis).then(() => {
                    return context.executeAction({
                        'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                        'Properties': {
                            'Target': {
                                'EntitySet': 'PMMobileStatuses',
                                'Service': '/SAPAssetManager/Services/AssetManager.service',
                                'EditLink': context.binding.WorkOrderOperation.OperationMobileStatus_Nav['@odata.editLink'],
                            },
                        },
                    });
                });                  
            });
            
        } else {
            // Nothing
            return Promise.resolve(true);
        }
    });
 return action;
}


function DiscardOrderMobileStatus(context) {
    let action = context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationDelete.action').then(() => {
        if (context.binding.WorkOrderHeader.OrderMobileStatus_Nav.MobileStatus === 'COMPLETED' && context.binding.WorkOrderHeader.OrderMobileStatus_Nav['@odata.editLink']) {
            //add return or not?
             return context.read('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatusHistories', [], `$filter=sap.islocal() and ObjectKey eq '${context.binding.WorkOrderHeader.OrderMobileStatus_Nav.ObjectKey}'`).then(record => {
                let linksHis = [];
                if (record && record.length > 0) {
                    for (let i = 0; i < record.length; i++) {
                        let editLink = record.getItem(i)['@odata.editLink'];

                        linksHis.push(context.executeAction({
                            'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                            'Properties': {
                            'Target': {
                                'EntitySet': 'PMMobileStatusHistories',
                                'Service': '/SAPAssetManager/Services/AssetManager.service',
                               // 'EditLink': record.getItem(0)['@odata.editLink'],
                                'EditLink': editLink,
                                },
                            },
                        }));
                    }
                }
                return Promise.all(linksHis).then(() => {
                    return context.executeAction({
                        'Name': '/SAPAssetManager/Actions/Common/GenericDiscard.action', 
                        'Properties': {
                            'Target': {
                                'EntitySet': 'PMMobileStatuses',
                                'Service': '/SAPAssetManager/Services/AssetManager.service',
                                'EditLink': context.binding.WorkOrderHeader.OrderMobileStatus_Nav['@odata.editLink'],
                            },
                        },
                    });
                });                  
            });
            
        } else {
            // Nothing
            return Promise.resolve(true);
        }
    });
 return action;
}
