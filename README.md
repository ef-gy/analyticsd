analyticsd
==========

node.js daemon to classify syslog events and upload them to Google Analytics.
This means that by running this daemon you will be able to analyse some events
that show up in your syslog using Google Analytics, alongside your web site
access statistics.

Log output recognised by this daemon is sent to Google Analytics by means of
the Measurement Protocol. This means you need to have Universal Analytics
enabled for your property.

Installation
============

Use npm to install the package; the package should be installed globally so as
to be usable from the command line:

    # npm install -g analyticsd

If you get an error about npm not being a valid command, install node.js by
following this guide: https://github.com/joyent/node/wiki/installing-node.js-via-package-manager

Usage
=====

You should run analyticsd as root; it will drop privileges automatically - by
default to the user 'daemon' and the group 'adm' which should be able to read
log files. To run the programme, use a command like this:

    # analyticsd --tid UA-XXXXX-Y

The --tid parameter specifies the Google Analytics property to send data to.
Have a look at the Google Analytics Admin panel to get this ID if you've
misplaced yours.

analyticsd will not fork to the background on its own. You could use nohup/& for
this purpose, like so:

    # nohup analyticsd --tid UA-XXXXX-Y &

To launch the daemon at boot time, add a line like the previous to your
/etc/rc.local - before any exit; instructions, if there are any.

Further options may be documented in the daemon's man page:

    $ man analyticsd &

NOTE: You should use a separate ID from your 'normal' Google Analytics ID, at
least while testing. If you later decide to use a single ID for both the events
processed by this daemon and your website, you should set up different views
with different event types - the SSH events alone might drown out your actual
web site accesses otherwise.
