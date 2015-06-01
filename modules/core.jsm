/**
 * This is the main part of FilterScript. The lone export is the FilterScript 
 * object, which provides a way to read/write the script path and launch the 
 * script itself.
 */
dump("filterscript: Loading core module\n");

Components.utils.import("resource://gre/modules/FileUtils.jsm");

var EXPORTED_SYMBOLS = [ "FilterScript" ];

var FILTERSCRIPT_PREFS = "extensions.filterscript.";
var SCRIPT_PREF = 'script';

/**
 * Writes the contents of a string to an nsILocalFile object.
 */
function writeFile(file, data) {
    var tmpStream = Components.classes["@mozilla.org/network/file-output-stream;1"
                        ].createInstance(Components.interfaces.nsIFileOutputStream);

    // 0x02 | 0x20 = WRITE_ONLY | TRUNCATE (recommended by the documentation)
    tmpStream.init(file, 0x02 | 0x20, 0666, 0);

    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"
                    ].createInstance(Components.interfaces.nsIConverterOutputStream);
    converter.init(tmpStream, "UTF-8", 0, 0);
    converter.writeString(data);
    converter.close();
}

FilterScript = {
    prefService: null,
    prefs: null,

    /**
     * Initializes the preference service. Note that this is meant to be used
     * lazily (it will also check if it has been run more than once).
     */
    init: function() {
        if (this.prefs !== null)
            return;

        dump("filterscript: Initializing preferences service\n");
        this.prefService = Components.classes["@mozilla.org/preferences-service;1"
                      ].getService(Components.interfaces.nsIPrefService);

        dump("filterscript: Getting user preferences branch\n");
        this.prefs =this.prefService.getBranch(FILTERSCRIPT_PREFS);
    },

    getFilterScript: function() { 
        this.init();
        return this.prefs.getCharPref(SCRIPT_PREF);
    },
    setFilterScript: function(path) { 
        this.init();
        this.prefs.setCharPref(SCRIPT_PREF, path); 
        this.prefService.savePrefFile(null);
    },

    /**
     * Runs the filter program over the given message body.
     */
    runFilter: function(body) {
        dump("filterscript: Retrieving script path\n");

        var program = this.getFilterScript();
        var programFile = new FileUtils.File(program);

        dump("filterscript: Will run " + program + "\n");

        // Write the message out to a temporary file.
        //
        // Unfortunately, we can't easily shove data to the subprocess's
        // standard input - rather, we have to create a temporary file.
        dump("filterscript: Writing data (" + body.length + " chars) to temporary file\n");

        var tmpFile = Components.classes["@mozilla.org/file/local;1"
                        ].createInstance(Components.interfaces.nsILocalFile);

        // This is an abysmal way to create a temporary file - there really 
        // should be a mktemp(), rather than this (which is vulnerable to
        // timing attacks)
        tmpFile.initWithPath("/tmp/mail.tmp");
        tmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE,
                             FileUtils.PERMS_FILE);

        dump("filterscript: Saving message body to " + tmpFile.path + "\n");
        writeFile(tmpFile, body);

        var process = Components.classes["@mozilla.org/process/util;1"
                        ].createInstance(Components.interfaces.nsIProcess);

        dump("filterScript: Running script\n");
        process.init(programFile);
        process.run(true, [tmpFile.path], 1);

        dump("filterScript: Cleaning up temporary file\n");
        tmpFile.remove(false);
    }
};

dump("filterscript: Done loading core module\n");
