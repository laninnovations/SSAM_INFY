import libVal from '../../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';

export default function ErrorArchiveMessage(context) {
    var binding = context.binding;
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'ErrorArchive', [], '$filter=RequestID eq ' + binding.RequestID).then(function(data) {
                          if (!libVal.evalIsEmpty(data)) {
                              try {
                                var message = JSON.parse(JSON.stringify(data.getItem(0).Message).replace(/\\/g,'').slice(1, -1));
                                //var errorMessage = message.error.message.value.match(/^.*Message =(.*$)/)[1];
                                let m;
                                var regex = /Message =\s*(.*?)\s*Type =/g;
                                var lasterrorMessage = message.error.message.value.match(/^.*Message =(.*$)/)[1];
            
                                var matches = [];
                                while (m = regex.exec(message.error.message.value)) {
                                        matches.push(m[1]);
                                    }
                                matches.push(lasterrorMessage);
                                let errorMessage = [...new Set(matches)];

                                return errorMessage;
                              } catch (e) {
                                if (!libVal.evalIsEmpty(data.getItem(0).Message)) {
                                    return data.getItem(0).Message;
                                } else {
                                    return '-';
                                }
                              }
                          }  
                          return '-';
                      });
}
