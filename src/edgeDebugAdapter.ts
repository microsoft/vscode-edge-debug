/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ChromeDebugAdapter, Utils, Logger} from 'vscode-chrome-debug-core';
import * as edgeUtils from './utilities';
import {spawn, ChildProcess} from 'child_process';
import * as path from 'path';

export class EdgeDebugAdapter extends ChromeDebugAdapter {
    private _proxyProc: ChildProcess;

    public constructor() {
        super();
    }

    public attach(args: any): Promise<void> {
        if (args.port == null) {
            return Utils.errP('The "port" field is required in the attach config.');
        }

        this.initializeLogging('attach-edge', args);

        // Check exists?
        const adapterPath = args.runtimeExecutable || edgeUtils.getAdapterPath();
        if (!adapterPath) {
            if (Utils.getPlatform() == Utils.Platform.Windows) {
                return Utils.errP(`No Edge Diagnostics Adapter was found. Install an iOS proxy (https://github.com/Microsoft/edge-diagnostics-launch) and specify a valid 'adapterExecutable' path`);
            } else {
                return Utils.errP(`Edge debugging is only supported on Windows 10.`);
            }
        }

        // Start with remote debugging enabled
        const adapterPort = args.port || 9222;
        const adapterArgs: string[] = [];

        let launchUrlArg: string;
        launchUrlArg = '--launch=';
        if (args.file) {
            launchUrlArg += 'file:///' + path.resolve(args.cwd, args.file);
        } else if (args.url) {
            launchUrlArg += args.url;
        }
        adapterArgs.push(launchUrlArg);

        if (args.proxyArgs) {
            // Add additional parameters
            adapterArgs.push(...args.proxyArgs);
        }

        Logger.log(`spawn('${adapterPath}', ${JSON.stringify(adapterArgs) })`);
        this._proxyProc = spawn(adapterPath, adapterArgs, {
            detached: true,
            stdio: ['ignore']
        });
        (<any>this._proxyProc).unref();
        this._proxyProc.on('error', (err) => {
            Logger.log('device proxy error: ' + err);
            this.terminateSession();
        });

        var attachArgs = {
            port: adapterPort,
            cwd: ""
        }

        return super.attach(attachArgs);
    }

    public clearEverything(): void {
        if (this._proxyProc) {
            this._proxyProc.kill('SIGINT');
            this._proxyProc = null;
        }

        super.clearEverything();
    }
}

