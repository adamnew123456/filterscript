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
         * Passes the whole of the message, in RFC822 format, into the
         * filter.
         */
        apply: function (headers, action, listener, type, messageWindow) {
            for (var i=0; i < headers.length; i++) {
                var header = headers.queryElementAt(i, Components.interfaces.nsIMsgDBHdr);
                var header_uri = header.folder.getUriForMsg(header);

                var messenger = Components.classes["@mozilla.org/messenger;1"
                                ].createInstance(Components.interfaces.nsIMessenger);
                var message_svc = messenger.messageServiceFromURI(header_uri);
                var message_stream = Components.classes["@mozilla.org/network/sync-stream-listener;1"
                                     ].createInstance();
                var message_stream_if = message_stream.QueryInterface(Components.interfaces.nsIInputStream);
                var script_stream = Components.classes["@mozilla.org/scriptableinputstream;1"
                                    ].createInstance();
                var script_stream_if = script_stream.QueryInterface(Components.interfaces.nsIScriptableInputStream);

                script_stream_if.init(message_stream_if);
                message_svc.streamMessage(header_uri, message_stream, messageWindow, null, false, null);
                FilterScript.runFilter(script_stream_if);
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
