import ComLib from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import valLib from '../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';
import Logger from '../../SAPAssetManager/Rules/Log/Logger';
import NotificationUpdateSuccess from '../../SAPAssetManager/Rules/Notifications/CreateUpdate/NotificationUpdateSuccess';
import IsPhaseModelEnabled from '../../SAPAssetManager/Rules/Common/IsPhaseModelEnabled';
import GetPlanningPlant from '../../SAPAssetManager/Rules/Common/GetPlanningPlant';
import GenerateNotificationID from '../../SAPAssetManager/Rules/Notifications/GenerateNotificationID';
import NotificationLibrary from '../../SAPAssetManager/Rules/Notifications/NotificationLibrary';
import BreakdownSwitchValue from '../../SAPAssetManager/Rules/Notifications/BreakdownSwitchValue';
import NotificationCreateUpdateQMCodeGroupValue from '../../SAPAssetManager/Rules/Notifications/CreateUpdate/NotificationCreateUpdateQMCodeGroupValue';
import NotificationCreateUpdateQMCodeValue from '../../SAPAssetManager/Rules/Notifications/CreateUpdate/NotificationCreateUpdateQMCodeValue';
import NotificationCreateUpdateQMCatalog from '../../SAPAssetManager/Rules/Notifications/CreateUpdate/NotificationCreateUpdateQMCatalog';
import NotificationCreateSuccess from '../../SAPAssetManager/Rules/Notifications/CreateUpdate/NotificationCreateSuccess';
import GetMalfunctionStartDate from '../../SAPAssetManager/Rules/Notifications/MalfunctionStartDate';
import GetMalfunctionStartTime from '../../SAPAssetManager/Rules/Notifications/MalfunctionStartTime';
import GetMalfunctionEndDate from '../../SAPAssetManager/Rules/Notifications/MalfunctionEndDate';
import GetMalfunctionEndTime from '../../SAPAssetManager/Rules/Notifications/MalfunctionEndTime';
import GetCurrentDate from '../../SAPAssetManager/Rules/Confirmations/BlankFinal/GetCurrentDate';

export default function NotificationCreateUpdateOnCommit(clientAPI) {

    //Temporary Workaround for an issue where the hierarchy list picker is wiping out the binding on the page. MDK issue logged https://jira.tools.sap/browse/MDKBUG-585.
    //Get the binding from the formcellcontainer

    let formCellContainer = clientAPI.getControl('FormCellContainer');
    
    if (valLib.evalIsEmpty(clientAPI.binding)) {
        clientAPI._context.binding = formCellContainer.binding;
    }

    // Prevent double-pressing done button
    clientAPI.showActivityIndicator('');

    //Determine if we are on edit vs. create
    let onCreate = ComLib.IsOnCreate(clientAPI);
    let type = ComLib.getListPickerValue(formCellContainer.getControl('TypeLstPkr').getValue());
    ComLib.setStateVariable(clientAPI, 'NotificationType', type); // Saving type to later use for EAMOverallStatusConfigs
    let descr = formCellContainer.getControl('NotificationDescription').getValue();
    let breakdownStart = ComLib.getControlProxy(clientAPI,'BreakdownStartSwitch').getValue();
    let breakdownEnd = ComLib.getControlProxy(clientAPI,'BreakdownEndSwitch').getValue();
    let notifCategoryPromise = NotificationLibrary.getNotificationCategory(clientAPI,type).then(notifCategory => {
        ComLib.setStateVariable(clientAPI, 'NotificationCategory', notifCategory);
        return notifCategory;
    });
    let workcenter = ComLib.getListPickerValue(formCellContainer.getControl('MainWorkCenterLstPkr').getValue());
    let workcenterplant = ComLib.getListPickerValue(formCellContainer.getControl('WorkCenterPlantLstPkr').getValue());;

    if (onCreate) {
        // If we're creating a Notification, we will always be doing a ChangeSet
        ComLib.setStateVariable(clientAPI, 'ObjectCreatedName', 'Notification');
        if (!valLib.evalIsEmpty(type) && !valLib.evalIsEmpty(descr)) {
            let promises = [];
            promises.push(GenerateNotificationID(clientAPI));
            //promises.push(NotificationLibrary.NotificationCreateMainWorkCenter(clientAPI));

            if (IsPhaseModelEnabled(clientAPI)) {
                promises.push(NotificationCreateUpdateQMCatalog(clientAPI));
            }
            
            promises.push(notifCategoryPromise);
            promises.push(NotificationLibrary.NotificationCreateUpdateFunctionalLocationLstPkrValue(clientAPI));
            promises.push(NotificationLibrary.NotificationCreateUpdateEquipmentLstPkrValue(clientAPI));

            return Promise.all(promises).then(results => {
                ////The number of promises is different when phase model is on we need to re-arrange the order
                let notifNum = results[0];
                let qmcatalog = '';
                let floc = results[2];
                let equip = results[3];
               if (IsPhaseModelEnabled(clientAPI)) {
                    qmcatalog = results[1];
                    floc = results[3];
                    equip = results[4];
                }
                
                
                let notificationCreateProperties = {
                    'PlanningPlant': GetPlanningPlant(),
                    'NotificationNumber' : notifNum,
                    'NotificationDescription' : descr,
                    'NotificationType' : type,
                    'Priority' : NotificationLibrary.NotificationCreateUpdatePrioritySegValue(clientAPI),
                    'HeaderFunctionLocation' : floc,
                    'HeaderEquipment' : equip,
                    'BreakdownIndicator' : BreakdownSwitchValue(clientAPI),
                    'MainWorkCenter' : workcenter,
                    'MainWorkCenterPlant': workcenterplant,
                    'ReportedBy': ComLib.getSapUserName(clientAPI),
                    'CreationDate': GetCurrentDate(clientAPI),
                };

                if (IsPhaseModelEnabled(clientAPI)) {
                    notificationCreateProperties.QMCodeGroup = NotificationCreateUpdateQMCodeGroupValue(clientAPI);
                    notificationCreateProperties.QMCode = NotificationCreateUpdateQMCodeValue(clientAPI);
                    notificationCreateProperties.QMCatalog = qmcatalog;
                }

                if (breakdownStart) {
                    notificationCreateProperties.MalfunctionStartDate = GetMalfunctionStartDate(clientAPI);
                    notificationCreateProperties.MalfunctionStartTime = GetMalfunctionStartTime(clientAPI);
                }

                if (breakdownEnd) {
                    notificationCreateProperties.MalfunctionEndDate = GetMalfunctionEndDate(clientAPI);
                    notificationCreateProperties.MalfunctionEndTime = GetMalfunctionEndTime(clientAPI);
                }

                //Update property InspectionLot.
                if (clientAPI.binding && clientAPI.binding['@odata.type'] === '#sap_mobile.InspectionCharacteristic') {
                    notificationCreateProperties.InspectionLot = clientAPI.binding.InspectionLot;
                }

                return clientAPI.executeAction({
                    'Name': '/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationCreate.action',
                    'Properties': {
                        'Properties': notificationCreateProperties,
                        'Headers':
                        {
                            'OfflineOData.RemoveAfterUpload': 'true',
                            'OfflineOData.TransactionID': notifNum,
                        },
                    },
                }).then(actionResult => {
                    // Store created notification
                    ComLib.setStateVariable(clientAPI, 'CreateNotification', JSON.parse(actionResult.data));
                    return NotificationCreateSuccess(clientAPI, JSON.parse(actionResult.data));
                }).catch(() => {
                    clientAPI.dismissActivityIndicator();
                    return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
                });
            }).catch(err => {
                Logger.error('Notification', err);
                clientAPI.dismissActivityIndicator();
                return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
            });

        } else {
            clientAPI.dismissActivityIndicator();
            Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryNotifications.global').getValue(), 'One of the required controls did not return a value OnCreate');
            return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ODataCreateFailureMessage.action');
        }
    } else {
        let promises = [];
        if (IsPhaseModelEnabled(clientAPI)) {
            promises.push(NotificationCreateUpdateQMCatalog(clientAPI));
        }
        promises.push(notifCategoryPromise);
        return Promise.all(promises).then(results => {
            let notificationUpdateProperties = {
                'NotificationDescription' : descr,
                'NotificationType' : type,
                'Priority' : NotificationLibrary.NotificationCreateUpdatePrioritySegValue(clientAPI),
                'HeaderFunctionLocation' : NotificationLibrary.NotificationCreateUpdateFunctionalLocationLstPkrValue(clientAPI),
                'HeaderEquipment' : NotificationLibrary.NotificationCreateUpdateEquipmentLstPkrValue(clientAPI),
                'BreakdownIndicator' : BreakdownSwitchValue(clientAPI),
            };

            if (breakdownStart) {
                notificationUpdateProperties.MalfunctionStartDate = GetMalfunctionStartDate(clientAPI);
                notificationUpdateProperties.MalfunctionStartTime = GetMalfunctionStartTime(clientAPI);
            }

            if (breakdownEnd) {
                notificationUpdateProperties.MalfunctionEndDate = GetMalfunctionEndDate(clientAPI);
                notificationUpdateProperties.MalfunctionEndTime = GetMalfunctionEndTime(clientAPI);
            }

            if (IsPhaseModelEnabled(clientAPI)) {
                notificationUpdateProperties.QMCodeGroup = NotificationCreateUpdateQMCodeGroupValue(clientAPI);
                notificationUpdateProperties.QMCode = NotificationCreateUpdateQMCodeValue(clientAPI);
                notificationUpdateProperties.QMCatalog = results[0];
            }
            return clientAPI.executeAction({
                'Name' : '/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationUpdate.action',
                'Properties': {
                    'Properties': notificationUpdateProperties,
                    'OnSuccess' : '',
                },
            }).then(() => {
                return clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/UpdateNotificationChangeLocation.action')
            }).then(() => {
                // eslint-disable-next-line brace-style
                let createItem = !!(function() { try { return (clientAPI.evaluateTargetPath('#Control:PartDetailsLstPkr/#SelectedValue') && clientAPI.evaluateTargetPath('#Control:PartGroupLstPkr/#SelectedValue')); } catch (exc) { return ''; } })();
                if (createItem) {
                    return clientAPI.executeAction({
                        'Name': '/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreate.action',
                        'Properties': {
                            'OnSuccess' : '',
                        },
                    });
                } else {
                    return Promise.reject(); // Skip item and cause create
                }
            }).then(actionResult => {
                // eslint-disable-next-line brace-style
                let createCause = !!(function() { try { return (clientAPI.evaluateTargetPath('#Control:CodeLstPkr/#SelectedValue') && clientAPI.evaluateTargetPath('#Control:CauseGroupLstPkr/#SelectedValue')); } catch (exc) { return ''; } })();
                if (createCause) {
                    let data = JSON.parse(actionResult.data);
                    return clientAPI.executeAction({
                        'Name': '/SAPAssetManager/Actions/Notifications/Item/NotificationItemCauseCreate.action',
                        'Properties': {
                            'Properties':
                            {
                                'NotificationNumber': data.NotificationNumber,
                                'ItemNumber' : data.ItemNumber,
                                'CauseSequenceNumber' : '0001',
                                'CauseText' : clientAPI.evaluateTargetPath('#Control:CauseDescription/#Value') || '',
                                // eslint-disable-next-line brace-style
                                'CauseCodeGroup': (function() { try { return clientAPI.evaluateTargetPath('#Control:CauseGroupLstPkr/#SelectedValue'); } catch (e) {return '';} })(),
                                // eslint-disable-next-line brace-style
                                'CauseCode' : (function() { try { return clientAPI.evaluateTargetPath('#Control:CodeLstPkr/#SelectedValue'); } catch (e) {return '';} })(),
                                'CauseSortNumber' : '0001',
                            },
                            'Headers':
                            {
                                'OfflineOData.RemoveAfterUpload': 'true',
                                'OfflineOData.TransactionID': data.NotificationNumber,
                            },
                            'CreateLinks':
                            [{
                                'Property' : 'Item',
                                'Target':
                                {
                                    'EntitySet' : 'MyNotificationItems',
                                    'ReadLink' : data['@odata.readLink'],
                                },
                            }],
                            'OnSuccess' : '',
                        },
                    });
                } else {
                    return Promise.reject(); // Skip cause create
                }
            }).catch(() => {
                return Promise.resolve(); // Continue action chain
            }).then(() => {
                return NotificationUpdateSuccess(clientAPI);
            });
        }).catch(() => {
            clientAPI.dismissActivityIndicator();
            return clientAPI.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/UpdateEntityFailureMessage.action');
        });
    }
}
