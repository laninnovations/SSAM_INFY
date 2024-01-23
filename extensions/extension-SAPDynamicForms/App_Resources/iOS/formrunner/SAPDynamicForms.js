const HTTPCODES = {
    OK: 200,
};

/**
 *
 * @param {*} base64
 * @returns {Uint8Array}
 */
function base64ToBytes(base64) {
    const binString = window.atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

/**
 *
 * @param {*} base64
 * @returns {string}
 */
function base64ToString(base64) {
    return new TextDecoder().decode(base64ToBytes(base64));
}

/**
 *
 * @param {Uint8Array} bytes
 * @returns {string} base64 string
 */
function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join('');
    return window.btoa(binString);
}

/**
 *
 * @param {string} str
 * @returns {string} base64 string
 */
function stringToBase64(str) { // eslint-disable-line no-unused-vars
    return bytesToBase64(new TextEncoder().encode(str));
}

/**
 *
 * @param {string} urlString
 * @param {string} getParam
 * @returns {boolean}
 */
function getQueryParameter(urlString, getParam) {
    try {
        const params = new URL(urlString).searchParams;
        return params.get(getParam) ?? '';
    } catch (err) {
        console.log(`error trying to retrieve get query parameter ${getParam}, returning empty string. ${err}`);
    }
    return '';
}

/**
 * initialize data with possible delay for attaching a debugger
 * @param {string} templateData base64 encoded
 * @param {string} applicationName
 * @param {string} formName
 * @param {string} formId
 * @param {string} formData base64 encoded
 * @param {string} formStatus
 * @param {string} formVersion
 * @param {number} cacheMaxLimit
 * @param {string} fontSize
 * @param {number} mdkTime
 * @param {string} contextXML
 * @param {number} delay
 */
function initData(templateData, // eslint-disable-line no-unused-vars
    applicationName,
    formName,
    formId,
    formData,
    formStatus,
    formVersion,
    cacheMaxLimit,
    fontSize, mdkTime,
    contextXML,
    delay) {
    setTimeout(
        () => {
            initDataNoDelay(templateData,
                applicationName,
                formName,
                formId,
                formData,
                formStatus,
                formVersion,
                cacheMaxLimit,
                fontSize,
                mdkTime,
                contextXML);
        }, delay);
}

/**
 * initialize data
 * @param {string} templateData base64 encoded
 * @param {string} applicationName
 * @param {string} formName
 * @param {string} formId
 * @param {string} formData base64 encoded
 * @param {string} formStatus
 * @param {string} formVersion
 * @param {number} cacheMaxLimit
 * @param {string} fontSize
 * @param {number} mdkTime
 * @param {string} contextXML
 */
function initDataNoDelay(
    templateData,
    applicationName,
    formName,
    formId,
    formData,
    formStatus,
    formVersion,
    cacheMaxLimit,
    fontSize,
    mdkTime,
    contextXML) {
    console.log('initData() function call');
    console.log(`template data bytes: ${templateData.length}`);
    console.log(applicationName);
    console.log(formName);
    console.log(formId);
    console.log(`instance data bytes: ${formData.length}`);
    console.log(formStatus);
    console.log(formVersion);
    console.log(cacheMaxLimit);
    console.log(mdkTime);
    console.log(fontSize);
    console.log(`context bytes: ${(contextXML || '').length}`);
    document.getElementsByTagName('body')[0].classList = ['xforms-ios xforms-mobile'];

    document.getElementsByTagName('body')[0].classList.add('yui-skin-sam');
    if (fontSize !== 'S') {
        document.getElementsByTagName('body')[0].classList.add('large-font');
    }

    // check whether form is in cache or not
    const isFormInCache = window.ORBEON.fr.FormRunnerOffline.isFormInCache(
        applicationName,
        formName,
        Number(formVersion));
    if (isFormInCache) {
        window.ORBEON.fr.FormRunnerOffline.warmupFormIfNeeded(
            applicationName,
            formName,
            Number(formVersion));
    }

    const submissionProvider = SDFSubmissionProvider;

    submissionProvider.formConfig = {
        templateData: templateData,
        applicationName: applicationName,
        formName: formName,
        formId: formId,
        formData: formData,
        formStatus: formStatus || 'New',
        formVersion: formVersion,
        cacheMaxLimit: cacheMaxLimit,
        fontSize: fontSize,
        mdkTime: mdkTime,
        contextXML: contextXML,
        initialWorkflowStage: formStatus || 'New',
    };

    // configure handler class
    window.ORBEON.fr.FormRunnerOffline.configure(
        submissionProvider,
        Number(cacheMaxLimit));

    if (formData === '') {
        window.ORBEON.fr.FormRunnerOffline.renderForm(
            document.querySelector('.orbeon'),
            base64ToBytes(templateData),
            applicationName,
            formName,
            Number(formVersion),
            'new',
            undefined,
            undefined,
            undefined);
    } else {
        window.ORBEON.fr.FormRunnerOffline.renderForm(
            document.querySelector('.orbeon'),
            base64ToBytes(templateData),
            applicationName,
            formName,
            Number(formVersion),
            'edit',
            formId,
            undefined,
            undefined);
    }
};

/**
 * destroy the form
 */
function destroyForm() { // eslint-disable-line no-unused-vars
    console.log('Destroy Form');
    window.ORBEON.fr.FormRunnerOffline.destroyForm(
        document.querySelector('.orbeon'),
    );
}

/**
 * sends a message to the parent webview on if the form is dirty or not
 */
function postMessageIsFormDataSafe() { // eslint-disable-line no-unused-vars
    let sFormData = '';
    const isFormDataSafe = window.ORBEON.fr.API.isFormDataSafe();
    if (isFormDataSafe) {
        sFormData = 'true';
    } else {
        sFormData = 'false';
    }

    try {
        const oJSON = {
            'communication-type': 'isFormDataSafe',
            'data': sFormData,
        };
        webkit.messageHandlers.formRunner.postMessage(JSON.stringify(oJSON));
    } catch (err) {
        console.log(`error updating isFormDataSafe ${err}`);
    }
}

/**
 *
 * @param {*} templateData
 * @param {*} applicationName
 * @param {*} formName
 * @param {*} formVersion
 */
function warmupForm(templateData, applicationName, formName, formVersion) { // eslint-disable-line no-unused-vars
    const isFormInCache = window.ORBEON.fr.FormRunnerOffline.isFormInCache(
        applicationName,
        formName,
        Number(formVersion));
    // if form is already in cache, no need to warm up this form again
    if (!isFormInCache) {
        const newTemplateData = base64ToBytes(templateData);
        window.ORBEON.fr.FormRunnerOffline.compileAndCacheFormIfNeeded(
            newTemplateData,
            applicationName,
            formName,
            Number(formVersion)
        ).then(function(result) {
            window.ORBEON.fr.FormRunnerOffline.warmupFormIfNeeded(
                applicationName,
                formName,
                Number(formVersion));
        });
    }
}

/**
 * attempts to find the save button and click() it
 */
function saveForm() { // eslint-disable-line no-unused-vars
    const button = document.querySelector('.fr-buttons .fr-save-final-button button');
    if (button) {
        button.click();
    }
}

/**
 *
 * @param {string} url
 * @param {string} name get parameter key to retrieve
 * @returns {string} get parameter value
 */
function getParameterByName(url, name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const SDFSubmissionProvider = {
    formConfig: {
        templateData: '',
        applicationName: '',
        formName: '',
        formId: '',
        formData: '',
        formStatus: '',
        formVersion: '',
        cacheMaxLimit: 0,
        fontSize: '',
        mdkTime: 0,
        contextXML: '',
        initialWorkflowStage: '',
    },
    /**
     * async does not currently work
     * @param {*} request
     * @returns {Promise<*>}
     */
    submitAsync: (request) => {
        console.log('Async handler called with method: ', request.method);

        const response = {
            statusCode: HTTPCODES.OK,
            headers: '',
            body: '',
        };

        return Promise.resolve(SDFSubmissionProvider.submit(response));
    },

    /**
     *
     * @param {*} request
     * @returns {*}
     */
    submit: (request) => {
        console.log('myHandler called with method: ', request.method);
        const response = {
            statusCode: HTTPCODES.OK,
            headers: new Headers(),
            body: new Uint8Array(0),
        };

        if (request.method === 'PUT') {
            const formInitState = getParameterByName(request.url.href, 'fr-mode') === 'new';
            const source = getParameterByName(request.url.href, 'source');

            // we do not want to save the data into database when there
            // is a PUT call during form initialization
            if (formInitState === false) {
                console.log('PUT method called');
                try {
                    const oJSON = {
                        'communication-type': 'post',
                        'load': 'formdata',
                        'data': bytesToBase64(request.body),
                        'status': request.headers.get('Orbeon-Workflow-Stage'),
                        'initialStatus': SDFSubmissionProvider.formConfig.initialWorkflowStage,
                        'source': source,
                        'new': SDFSubmissionProvider.formConfig.formData === '' ? true : false,
                        'applicationName': SDFSubmissionProvider.formConfig.applicationName,
                        'formName': SDFSubmissionProvider.formConfig.formName,
                        'formVersion': SDFSubmissionProvider.formConfig.formVersion,
                        'requesturl': request.url.href,
                    };
                    webkit.messageHandlers.formRunner.postMessage(JSON.stringify(oJSON));
                } catch (err) {
                    console.log(err);
                }
            }
            // return response with 200 or 201 with empty body and empty header
            return response;
        } else if (request.method === 'GET') {
            console.log('GET method called!');
            const entityPrefix = '/fr/service/custom/orbeon/controls/entityset/'; // not final
            const contextPrefix = '/blah/service/data'; // for testing only
            if (request.url.pathname.startsWith(entityPrefix)) {
                response.headers = new Headers([
                    ['Content-Type', 'application/xml'],
                ]);

                let body;
                try {
                    const oJSON = {
                        'communication-type': 'get',
                        'data': request.url.pathname.slice(entityPrefix.length),
                        'status': request.headers.get('Orbeon-Workflow-Stage'),
                    };
                    body = webkit.messageHandlers.formRunnerReply.postMessage(JSON.stringify(oJSON));
                } catch (err) {
                    body = Promise.resolve('[]');
                }
                // return body.then((data) => {
                //     response.body = new TextEncoder().encode(base64ToString(data));
                //     return response;
                // });
                // async calls don't work, just give an empty response for now
                response.body = new TextEncoder().encode('<json></json>');
                return response;
            } else if (request.url.pathname === contextPrefix) {
                console.log('got context prefix, sending context xml bytes: ' + SDFSubmissionProvider.formConfig.contextXML.length());
                response.headers = new Headers([
                    ['Content-Type', 'application/xml'],
                ]);

                response.body = new TextEncoder().encode(SDFSubmissionProvider.formConfig.contextXML);
                return response;
            } else {
                response.headers = new Headers([
                    ['Content-Type', 'application/xml'],
                    ['Orbeon-Workflow-Stage', SDFSubmissionProvider.formConfig.formStatus],
                ]);

                const encodedFormData = base64ToString(SDFSubmissionProvider.formConfig.formData);
                response.body = new TextEncoder().encode(encodedFormData);

                return response;
            }
        }
    },
};

