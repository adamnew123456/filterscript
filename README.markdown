# FilterScript

FilterScript is a minimal Thunderbird extension for processing messages using
external programs.

## Background

FilterScript came about when I wanted a way to email myself URLs, and have 
them stored in my Firefox bookmarks database. Although I knew how to interact
with Firefox, Thunderbird did not provide an easy way to pass the contents of an
email message to an external program automatically. After several hours of
frustration, this extension was born.

## Installation

Simply run the script `make-xpi.sh` in the main directory - it should generate
a fie called `filterscript@adam.marchetti.xpi`. You should be able to install
this by dragging and dropping this file into the *Thunderbird Add-ons Manager*.

Note that if you have a more recent version than 42, you will need to change the
version string in `install.rdf`. Look for the line:
    
    <em:maxVersion>42.*<em:maxVersion>

Replace this with whatever version you run. I tried to avoid using any 
experimental APIs (although I probably did use a couple deprecated functions),
so FilterScript will probably be runnable on most versions of Thunderbird.
I haven't yet tested with anything but 31.7.0, since that is what Ubuntu is
distributing at the moment.

This extension is not guaranteed to be portable to anything but Linux systems
right now (by virtue of hardcoding `/tmp`).

## Configuration

After installing the extension, a new menu called "FilterScript" will appear on
the main screen. This menu will have one entry, called "Settings."

On this dialog box, simply click the Open button and select the executable file
that you wish to use as the filter script.

Next, open up "Tools > Message Filters" and either create or edit a filter. You
will see that a new message action has been created, called *Run Filter Script*.
Add it to the chain of actions, and the filter script that you specified earlier
will be run on any message that matches the filter. (Note that there isn't yet a
way to assign a different script to each filter - you have to use a single, global
filter script for all your different filters)

## Usage

One of the simplest filter scripts looks like this (in Bourne Shell):

    #!/bin/sh
    cat $1 > /tmp/last-message-body

This illustrates a couple of features about the way that FilterScripts calls
your script:

1. Only the message body is passed to the script (I was initially hoping to get
   the full headers, and all the bodies in RFC 2822 format - if somebody knows
   how to do this, please let me know!)
2. The message body is stored in a temporary file, given as the first command
   line argument (hence the `$1`). Note that FilterScripts will delete the
   temporary file for you, so there is no need to remove it in your script.

In addition, a few further caveats are worth noting:

- The working directory of your script will be (from your perspective), 
  arbitrary - if it is important to access the directory the script is
  accessed in, your script will have to determine where that is and
  `cd` itself.
- The standard output and standard error of your script are effectively
  discarded (Thunderbird may do something with them - but I don't know
  what that is).

## License

To be of the most use possible, I am releasing this under the CC0 license.

## Credits

Big thanks to the authors on MDN, and the authors of Enigmail, which was a
helpful reference for some of the under-documented parts of the Thunderbird 
API.
