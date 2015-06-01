dump("filterscript: Loading Main UI\n");
Components.utils.import('resource://filterscript/core.jsm');

function openSettings() {
    dump("filterscript: Loading preferences\n");
    window.openDialog("chrome://filterscript/content/fsPreferences.xul", "", "dialog,modal");
}

/**
 * Startup code - since this is loaded for the main page, it is best for it to
 * go here.
 *
 * This is guaranteed to run ASAP, since the main messenger window is the 
 * first thing to load when the user starts Thunderbird.
 */
window.addEventListener("load", function() {
    dump("filterscript: Creating Filter");

    var fsRunScript = {
        id: "adamnew123456#fsRunScript",
        name: "Run Filter Script",
        value: "runscript",

        /**
         * Finds the first message header associated with a plain text body,
         * and passes the body content onto the filter script.
         */
        apply: function (headers, action, listener, type, messageWindow) {
            var found_body = false;
            for (var i=0; i < headers.length; i++) {
                var header = headers.queryElementAt(i, Components.interfaces.nsIMsgDBHdr);

                MsgHdrToMimeMessage(header, null, function(header, message) {
                    if (!found_body && message.coerceBodyToPlaintext) {
                        found_body = true;
                        FilterScript.runFilter(message.coerceBodyToPlaintext());
                    }
                }, true);
            }
        },

        // (The remainder of this interface was cribbed from Enigmail, but
        // stripped because "Run Filter Script" doesn't take any parameters)
        isValidForType: function (type, scope) {
            return true;
        },

        validateActionValue: function (value, folder, type) {
            return type;
        },

        allowDuplicates: false,
        isAsync: false,
        needsBody: true
    };

    dump("filterscript: Registering Filter\n");
    var filterService = Components.classes["@mozilla.org/messenger/services/filters;1"
                                 ].getService(Components.interfaces.nsIMsgFilterService);
    filterService.addCustomAction(fsRunScript);

    dump("filterscript: Done Loading Main UI\n");
}, false);
