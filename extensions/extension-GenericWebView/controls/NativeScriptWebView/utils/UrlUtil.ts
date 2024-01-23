export function appendUrlParam(url: string, key: string, value: any): string {
  let newUrl = url || "";
  if (url && key) {
    if (url.indexOf("?") > 0) {
      newUrl = url.replace("?", `?${key}=${value}&`);
    } else if (url.indexOf("#") > 0) {
      newUrl = url.replace("#", `?${key}=${value}#`);
    } else {
      newUrl = `${url}?${key}=${value}`;
    }
  }
  return newUrl;
}

export function removeUrlParam(url: string, key: string): string {
  if (url && key) {
    let startPos = url.indexOf(`?${key}=`);
    if (startPos < 0) {
      startPos = url.indexOf(`&${key}=`);
    }
    if (startPos < 0) {
      return url;
    }
    let endPos = url.indexOf("&", startPos);
    if (endPos < 0) {
      endPos = url.indexOf("#", startPos);
    }
    if (endPos < 0) {
      endPos = url.length;
    }
    let newUrl = url.substring(0, startPos) + url.substring(endPos);
    if (newUrl.indexOf("&") >= 0 && newUrl.indexOf("?") < 0) {
      newUrl = newUrl.replace("&", "?");
    }
    return newUrl;
  } else {
    return url;
  }
}
