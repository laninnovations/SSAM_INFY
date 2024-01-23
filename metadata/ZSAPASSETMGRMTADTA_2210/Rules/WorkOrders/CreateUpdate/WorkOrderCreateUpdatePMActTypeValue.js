import {WorkOrderControlsLibrary as LibWoControls} from '../WorkOrderLibrary';

export default function WorkOrderCreateUpdatePMActTypeValue(pageProxy) {
    return LibWoControls.getPMActivityType(pageProxy);
}
