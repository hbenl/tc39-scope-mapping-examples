This repository contains examples for experimenting with the TC39 scope mapping proposal.

You can use them with the [prototype implementation](https://github.com/hbenl/vscode-firefox-debug/tree/tc39-scope-mapping) for the Firefox debug adapter:
- download the [prototype extension](https://github.com/hbenl/vscode-firefox-debug/releases/download/scope-mapping-v1/vscode-firefox-debug-scope-mapping-2.9.10.vsix) and install it in VS Code using "Install from VSIX"
- clone this repository and open it in VS Code
- set a breakpoint in line 5 of `inline-into-function/original.js`
- start the debugger, this will open a Firefox window
- reload the page in Firefox until you hit the breakpoint
