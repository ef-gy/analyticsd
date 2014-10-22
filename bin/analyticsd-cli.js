#!/usr/bin/env nodejs

require('idle-gc').start();

require('../lib/daemon').daemon();
