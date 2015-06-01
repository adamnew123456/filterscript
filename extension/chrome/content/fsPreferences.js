Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import('resource://filterscript/core.jsm');

function getValue(id) {
    return document.getElementById(id).value;
}

function setValue(id, value) {
    document.getElementById(id).value = value;
}

function onLoad() {
    dump("filterscript: Loading preferences\n");

    setValue('prefs.script', FilterScript.getFilterScript());

    dump("filterscript: Done loading preferences\n");
}

function onAccept() {
    dump("filterscript: Applying preferences\n");

    FilterScript.setFilterScript(getValue('prefs.script'));

    dump("filterscript: Done applying preferences\n");
}

var nsIFilePicker = Components.interfaces.nsIFilePicker;
function openScriptDialog() {
    var picker = Components.classes["@mozilla.org/filepicker;1"
                          ].createInstance(nsIFilePicker);
    picker.displayDirectory = FileUtils.Home;
    picker.init(window, "Select An Executable", nsIFilePicker.modeOpen);
    picker.appendFilters(nsIFilePicker.filterAll);

    var result = picker.show();
    if (result == nsIFilePicker.returnOK)
        setValue('prefs.script', picker.file.path);
}
