import { EventHandler } from 'mdk-core/EventHandler';
import { IContext } from 'mdk-core/context/IContext';
import { BaseWebView } from './BaseWebView';

@NativeClass()
class WKScriptMessageHandlerImpl extends NSObject implements WKScriptMessageHandler, WKScriptMessageHandlerWithReply {
    public static ObjCProtocols: any = [WKScriptMessageHandler, WKScriptMessageHandlerWithReply];
    public locationPromise: any;
    protected _context: any;
    protected _submissionHandler: string;

    public static init(): WKScriptMessageHandlerImpl {
        const handler = <WKScriptMessageHandlerImpl>WKScriptMessageHandlerImpl.new();
        return handler;
    }

    set context(context) {this._context = context;}
    get context() {return this._context;}
    set submissionHandler(submissionHandler) {this._submissionHandler = submissionHandler;}
    get submissionHandler() {return this._submissionHandler;}

    public userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void {
        let jsonData: any;
        try {
            jsonData = JSON.parse(message.body);
        } catch (error) {
            // TODO: Log this
            return;
        }
        const communicationType: string = jsonData['communication-type'];
        const data: string = jsonData.data;
        const eventHandler: any = new EventHandler();

        if ((communicationType === 'isFormDataSafe')) {
            ReusableWebView.reusableWebView.isFormDataSafe = (data === 'true');
            ReusableWebView.reusableWebView.isFormDataSafeReturned(ReusableWebView.reusableWebView.isFormDataSafe);
        } else {
            if (this._submissionHandler) {
                if (this._context) {
                    this._context.binding = jsonData;
                }
                return eventHandler.executeActionOrRule(this._submissionHandler, this._context)
                    .catch ((error) => {
                        // TODO: log this
                    });
            } else {
                // TODO: log error message for no submission handler
            }
        }
    }

    public userContentControllerDidReceiveScriptMessageReplyHandler(userContentController: WKUserContentController, message: WKScriptMessage, replyHandler: any): any {
        let jsonData: any;
        try {
            jsonData = JSON.parse(message.body);
        } catch (error) {
            // TODO: Log this
            return;
        }

        const communicationType: string = jsonData['communication-type'];
        const data: string = jsonData.data;
        const eventHandler: any = new EventHandler();

        // return Promise.resolve().then(() => {
        //     replyHandler(NSString.stringWithString("Hello World").description, null);
        //     return null;
        // });
        if ((communicationType === 'isFormDataSafe')) {
            ReusableWebView.reusableWebView.isFormDataSafe = (data === 'true');
            ReusableWebView.reusableWebView.isFormDataSafeReturned(ReusableWebView.reusableWebView.isFormDataSafe);
        } else {
            if (this._submissionHandler) {
                if (this._context) {
                    this._context.binding = jsonData;
                }
                //const response = '{"MyEquipments":[{"EquipId":"10001528","Description":"20190710063915"},{"EquipId":"10067887","Description":"Equipment test with workcenter without d"},{"EquipId":"10118236","Description":"SE_ED_JI_TESTs"},{"EquipId":"10000259","Description":"HVAC"},{"EquipId":"10049962","Description":"Initload_plantload8"},{"EquipId":"10013262","Description":"REA High Tech DP -162 Ser"},{"EquipId":"10001568","Description":"200 Series Description"},{"EquipId":"10000652","Description":"LABORATORY OVEN (UNIT-4)"},{"EquipId":"10001047","Description":"TEST in english"},{"EquipId":"10068273","Description":"FORKLIFT CHESS C500-M55 PROPANE JPT1"},{"EquipId":"10068911","Description":"Shared 03"},{"EquipId":"10001553","Description":"REACTOR (UNIT-3)"},{"EquipId":"10071185","Description":"Test Equ"},{"EquipId":"10268399","Description":"Equipment 2205 - TJ 2"},{"EquipId":"10000308","Description":"GAS MASK (CHEMICAL)"},{"EquipId":"10050046","Description":"Test Equipment for notification hir"},{"EquipId":"10012853","Description":"LIGHTING"},{"EquipId":"10013365","Description":"160GB SATA 10K SFF 2nd HDD"},{"EquipId":"10000914","Description":"Cl 3"},{"EquipId":"10052285","Description":"eq =X fl =X."},{"EquipId":"10000245","Description":"LABORATORY OVEN (UNIT-3)"},{"EquipId":"10000991","Description":"EAM QVB test 01"},{"EquipId":"10000386","Description":"HEATER"},{"EquipId":"10000762","Description":"ACTUATION"},{"EquipId":"10013258","Description":"REA High Tech DP -162 Ser"},{"EquipId":"10000866","Description":"PRT Equipment 2"},{"EquipId":"10000646","Description":"LABORATORY OVEN (UNIT-2)"},{"EquipId":"10032989","Description":"Gas Meter 140"},{"EquipId":"10000764","Description":"CURVE MI 19.038-19.354"},{"EquipId":"10001614","Description":"Test Equipment with Classification"},{"EquipId":"10068310","Description":"UNIT 2 STORAGE TANK 2 JPT3"},{"EquipId":"10068363","Description":"throwaway"},{"EquipId":"10000849","Description":"VG VENTILATION HOOD 03"},{"EquipId":"10068770","Description":"UNIT 2 STORAGE TANK 2 JPT3.18.00011"},{"EquipId":"10001626","Description":"EQP KAR AC INT 0718 x4 des new AC naya2"},{"EquipId":"10118487","Description":"test equip"},{"EquipId":"10035286","Description":"EQUIP-toSVB-modified in ERP"},{"EquipId":"10019148","Description":"Forklift III 0214x1"},{"EquipId":"10001738","Description":"160GB SATA 10K SFF 2nd HDD"},{"EquipId":"10000279","Description":"WATER CONDENSER"},{"EquipId":"10118545","Description":"test"},{"EquipId":"10071239","Description":"Test local delete"},{"EquipId":"10024186","Description":"test mat"},{"EquipId":"10071256","Description":"Test Equipment 05"},{"EquipId":"10001397","Description":"SVB_To_DCATEST"},{"EquipId":"10000408","Description":"MACHINE DRIVES"},{"EquipId":"10000614","Description":"Pump II"},{"EquipId":"10000642","Description":"VENTILATION HOOD (UNIT 3)"},{"EquipId":"10000653","Description":"REACTOR (UNIT-4)"},{"EquipId":"10068783","Description":"EQP_TL"},{"EquipId":"10000913","Description":"Standard classification 23"},{"EquipId":"10000922","Description":"Lease Well 122"},{"EquipId":"10000687","Description":"HEAT EXCHANGER"},{"EquipId":"10118557","Description":"yest"},{"EquipId":"10071242","Description":"Desription"},{"EquipId":"10000729","Description":"UNIT 2 STORAGE TANK 1"},{"EquipId":"10000298","Description":"CIRCULATION PUMP 01"},{"EquipId":"10000924","Description":"Lease Well 124"},{"EquipId":"10118238","Description":"Test"},{"EquipId":"10000344","Description":"MECHANICAL LIFTING DEVICES"},{"EquipId":"10037483","Description":"Test"},{"EquipId":"10268360","Description":"test eqp"},{"EquipId":"10000286","Description":"SEPARATOR"},{"EquipId":"10000336","Description":"UNIT 2 WASTE WATER PLANT DEGASIFIER"},{"EquipId":"10067940","Description":"JPT"},{"EquipId":"10000857","Description":"VG LIGHTING 02"},{"EquipId":"10001485","Description":"Sealing Machine 01"},{"EquipId":"10032988","Description":"Gas Meter"},{"EquipId":"10068604","Description":"FORKLIFT CHESS C500-M55 PROPANE JPT1"},{"EquipId":"EQUIPUIID","Description":"Test Equipment UIID"},{"EquipId":"10000948","Description":"PRT Equipment 4"},{"EquipId":"10001562","Description":"test_description"},{"EquipId":"10001523","Description":"TEST FOR DOC IN ACI"},{"EquipId":"10022772","Description":"Test equipment"},{"EquipId":"10000320","Description":"UNIT 2 REACTOR 1"},{"EquipId":"10000864","Description":"VG BOILER 02"},{"EquipId":"10001522","Description":"Documents Testing SVB 11:28:08:07:2019"},{"EquipId":"10036706","Description":"Forklift 0909x9"},{"EquipId":"10071135","Description":"Status change test equ 1"},{"EquipId":"10000287","Description":"WASTE WATER TREATMENT"},{"EquipId":"10000309","Description":"\"GAS MASK - CHEMICAL, BIOLOGICAL\""},{"EquipId":"10052162","Description":"eq rts = 01"},{"EquipId":"10001529","Description":"20190710064228"},{"EquipId":"10052129","Description":"Test EQ FL assign unassign"},{"EquipId":"10073174","Description":"tornado simulator"},{"EquipId":"10017621","Description":"hie1 inbound"},{"EquipId":"10017622","Description":"hie 2"},{"EquipId":"10001314","Description":"RS_equipment_ERP01"},{"EquipId":"10268330","Description":"JKFK"},{"EquipId":"10000732","Description":"UNIT 2 BOILER SAFETY VALVE"},{"EquipId":"10001575","Description":"EQuipment_Description"},{"EquipId":"10049748","Description":"Test Equi 14"},{"EquipId":"10000920","Description":"Oil Tank 110"},{"EquipId":"10118556","Description":"test des"},{"EquipId":"10013580","Description":"200 Series Description"},{"EquipId":"10000258","Description":"FACILITY WATER MAINS"},{"EquipId":"10013265","Description":"REA High Tech DP -162 Ser"},{"EquipId":"10052091","Description":"test iniload"},{"EquipId":"10018759","Description":"Analytics Test B Equipment 6"},{"EquipId":"10000290","Description":"LIGHTING"}]}';
                //const response = '<MyEquipments><_><Description>20190710063915</Description><EquipId>10067887</EquipId></_><_><Description>Equipment test with workcenter without d</Description><EquipId>10001528</EquipId></_><_><Description>SE_ED_JI_TESTs</Description><EquipId>10118236</EquipId></_></MyEquipments>'
                
                //const response64 = NSString.stringWithString(response).dataUsingEncoding(NSUTF8StringEncoding).base64EncodedStringWithOptions(0);
                //replyHandler(response64, null);


                //const semaphore = DispatchSemaphore(value: 2);
                const semaphore = dispatch_semaphore_create(2);

                let replyValue;

                const promise = eventHandler.executeActionOrRule(this._submissionHandler, this._context).then((data) => {
                    //replyHandler(NSString.stringWithString("Hello World").description, null);
                    // const value = NSString.stringWithString(data);
                    // replyHandler(value.description, null);
                    // return Promise.resolve();
                    replyValue = NSString.stringWithString("Hello World").description;
                    dispatch_semaphore_signal(semaphore);
                }).catch ((error) => {
                    // TODO: log this
                });

                const NSEC_PER_SEC = 1000000000; // nanoseconds per second 1e9. for some reason not defined in the typings
                dispatch_semaphore_wait(semaphore, dispatch_time(DISPATCH_WALLTIME_NOW, (5.0 *  NSEC_PER_SEC)));

                replyHandler(replyValue, null);
            } else {
                // TODO: log error message for no submission handler
            }
        }
    }
}

@NativeClass()
class WKScriptConsoleMessageHandlerImpl extends NSObject implements WKScriptMessageHandler {
    public static ObjCProtocols: any = [WKScriptMessageHandler];

    public static init(): WKScriptConsoleMessageHandlerImpl {
        const handler = <WKScriptConsoleMessageHandlerImpl>WKScriptConsoleMessageHandlerImpl.new();
        return handler;
    }

    public userContentControllerDidReceiveScriptMessage(userContentController: WKUserContentController, message: WKScriptMessage): void {
        try {
            console.log(message.body);
        } catch (error) {
            console.log(error);
            return;
        }
    }
}


@NativeClass()
class WKNavigationHandlerImpl extends NSObject implements WKNavigationDelegate {
    public static ObjCProtocols = [WKNavigationDelegate];
    _context: IContext;

    public setContext(context) {
        this._context = context;
    }

    public static init(): WKNavigationHandlerImpl {
        const handler = <WKNavigationHandlerImpl>WKNavigationHandlerImpl.new();
        return handler;
    }

    public decidePolicyForNavigationAction(navigationAction: WKNavigationAction,  decisionHandler: any) {
        console.log('entered decidePolicyForNavigationAction');
        let response = WKNavigationActionPolicy.Allow;
        if (navigationAction.shouldPerformDownload) {
            response = WKNavigationActionPolicy.Download;
        }
        decisionHandler(response);

        console.log('exit decidePolicyForNavigationAction');
    }

    public webViewDidFinishNavigation(webView: WKWebView, navigation: WKNavigation): void {
        console.log('entered webViewDidFinishNavigation');
        ReusableWebView.reusableWebView.reloadWebView(ReusableWebView.reusableWebView.formConfig);

        console.log('exit webViewDidFinishNavigation');
    }
}

export class ReusableWebView extends BaseWebView {

    private _webView: WKWebView;

    private _config: WKWebViewConfiguration;
    private _userContentController: WKUserContentController;
    private _webviewNavigationDelegate: WKNavigationHandlerImpl;
    private _scriptMessageHandler: WKScriptMessageHandlerImpl;
    private _consoleMessageHandler: WKScriptConsoleMessageHandlerImpl;

    set submissionHandler(submissionHandler: string) {this._scriptMessageHandler.submissionHandler = submissionHandler;}
    get submissionHandler(): string {return this._scriptMessageHandler.submissionHandler;}

    set context(context: any) {this._context = context; this._scriptMessageHandler.context = context;}

    public static getReusableWebView(): BaseWebView {
        if (ReusableWebView.reusableWebView) {
            const reusableWebView = <ReusableWebView>ReusableWebView.reusableWebView;
            reusableWebView._reloadRequired = true;
            return reusableWebView;
        } else {
            const reusableWebView = new ReusableWebView();
            ReusableWebView.reusableWebView = reusableWebView;
            //reusableWebView._templateDataMap = new Map();
            reusableWebView._reloadRequired = false;
            reusableWebView.initialize();
            return reusableWebView;
        }
    }

    public webView() {
        return this._webView;
    }

    public getNativeView(): any {
        return this._webView;
    }

    public initialLoadPlatform(htmlFileName: string): void {
        const fileURL = NSBundle.mainBundle.pathForResourceOfTypeInDirectory(htmlFileName, 'htm', 'formrunner');

        this._webView.loadRequest(NSURLRequest.requestWithURL(NSURL.fileURLWithPath(fileURL)));
    }

    public resetHeight(width: number, height: number) {
        if (this._webView) {
            this._webView.frame = CGRectMake(0, 0, width, height);
        }
    }

    protected initialize(): void {

        // initialize user content controller
        this._userContentController = WKUserContentController.new();
        this._scriptMessageHandler = WKScriptMessageHandlerImpl.init();
        this._scriptMessageHandler.context = this._context;
        this._userContentController.addScriptMessageHandlerName(this._scriptMessageHandler, 'formRunner');
        this._userContentController.addScriptMessageHandlerWithReplyContentWorldName(this._scriptMessageHandler, WKContentWorld.pageWorld, 'formRunnerReply');
        this._consoleMessageHandler = WKScriptConsoleMessageHandlerImpl.init();
        this._userContentController.addScriptMessageHandlerName(this._consoleMessageHandler, 'logHandler');

        // setup config
        this._config = WKWebViewConfiguration.new();
        this._config.userContentController = this._userContentController;
        this._webView = WKWebView.alloc().initWithFrameConfiguration(CGRectMake(0, 0, 2000, 2000), this._config);

        this._webviewNavigationDelegate = WKNavigationHandlerImpl.init();
        this._webviewNavigationDelegate.setContext(this._context);
        this._webView.navigationDelegate = this._webviewNavigationDelegate;


        // inject JS to capture console.log output and send to iOS
        const source = "function captureLog(msg) { window.webkit.messageHandlers.logHandler.postMessage(msg); } window.console.log = captureLog;"
        this.evaluateJavaScript(source);
    }

    public evaluateJavaScript(expression: string): void {
        this._webView.evaluateJavaScriptCompletionHandler(NSString.stringWithString(expression).description, (error: NSError) => {
            if (error !== null) {
                console.log("JAVASCRIPT ERROR: " + error)
                console.log("ATTEMPTED EVAL: " + expression);
            }
        });
    }
}