export function getJamLanguage(context: any): string {
  // const supportedLanguages = context.getSupportedLanguages();
  // console.log('---- mdk languages begin ----');
  // console.log(`---- ${Object.keys(supportedLanguages).length} languages ----`);
  // for (const mdkLanguage of Object.keys(supportedLanguages)) {
  // 	console.log(mdkLanguage);
  // }
  /*
	de
	en-GB
	en
	es-MX
	es
	fr
	it
	ja
	ko
	nl
	pl
	pt-BR
	ru
	zh-Hans
	*/
  // console.log('---- mdk languages end ----');

  let jamLanguage = "";
  const curMdkLanguage = context.getLanguage();
  if (curMdkLanguage) {
    if (curMdkLanguage === "zh-Hans") {
      jamLanguage = "zh-CN";
    } else if (curMdkLanguage === "no") {
      jamLanguage = "nb-NO";
    } else {
      jamLanguage = curMdkLanguage;
    }
  } else {
    jamLanguage = "en";
  }
  return jamLanguage;
}
