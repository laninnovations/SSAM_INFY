export function JsonToXml(json) {
    const testxml = '<foo><bar>foo bar test value</bar></foo>';
    return `<json>${json instanceof Array ? parseArray(json): parseObject(json)}${testxml}</json>`;
}

function parseArray(json) {
    return json.reduce((xml, obj) => {
        return xml + `<_>${obj instanceof Array? parseArray(obj) : typeof obj === 'object' ? parseObject(obj) : escapeForXml(obj)}</_>`
    },'');
}

function parseObject(json) {
    return Object.entries(json).reduce((xml, [key, value]) => {
        return xml + `<${escapeForXml(key)}>${value instanceof Array? parseArray(value) : typeof value === 'object' ? parseObject(value) : escapeForXml(value)}</${escapeForXml(key)}>`;
    },'');
}

function escapeForXml(str) {
    return String(str).replace(/'/g,'\\\'').replace(/\@/g,'');
}