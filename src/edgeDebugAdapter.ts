/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ChromeDebugAdapter, Utils, Logger} from 'vscode-chrome-debug-core';
import * as edgeUtils from './utilities';
import * as childProcess from 'child_process';
import * as path from 'path';

export class EdgeDebugAdapter extends ChromeDebugAdapter {
    private _adapterProc: childProcess.ChildProcess;


    private _launchAdapter(url?:string, port?:number, adapterExePath?:string ):Promise<any> {
        this.initializeLogging('launch-adapter', arguments);
        if (!adapterExePath) {
            adapterExePath = edgeUtils.getAdapterPath();
        }

        // Check exists
        if (!adapterExePath) {
            if (Utils.getPlatform() == Utils.Platform.Windows) {
                return Utils.errP(`No Edge Diagnostics Adapter was found. Install the Edge Diagnostics Adapter (https://github.com/Microsoft/edge-diagnostics-launch) and specify a valid 'adapterExecutable' path`);
            } else {
                return Utils.errP(`Edge debugging is only supported on Windows 10.`);
            }
        }

        let adapterArgs:string[] = [];
        if (!port) {
            port = 9222;
        }
        // We always tell the adpater what port to listen on so there's no shared info between the adapter and the extension
        let portCmdArg = '--port=' + port;
        adapterArgs.push(portCmdArg);

        if(url){
            let launchUrlArg = '--launch='+ url;
            adapterArgs.push(launchUrlArg);
        }

        Logger.log(`spawn('${adapterExePath}', ${JSON.stringify(adapterArgs) })`);
        this._adapterProc = childProcess.execFile(adapterExePath, adapterArgs, (err) => {
                Logger.log(`Adapter error: ${err}`);
                this.terminateSession();
            }, (data) => {
                Logger.log(`Adapter output: ${data}`);
        });

        let attachArgs = {
            port: port,
            cwd: ""
        }

        return Promise.resolve(attachArgs);
    }

    public constructor() {
        super();
    }

    public launch(args: any): Promise<void> {
        this.initializeLogging('launch-edge', arguments);

        let launchUrl: string;
        if (args.file) {
            launchUrl = 'file:///' + path.resolve(args.cwd, args.file);
        } else if (args.url) {
            launchUrl = args.url;
        }

        return this._launchAdapter(launchUrl, args.port, args.runtimeExecutable).then((attachArgs:any) =>{
            return super.attach(attachArgs);
        });
    }

    public attach(args: any): Promise<void> {
        this.initializeLogging('attach-edge', arguments);

        return this._launchAdapter(null, args.port, args.runtimeExecutable).then((attachArgs:any) =>{
            return super.attach(attachArgs);
        });
    }

    public clearEverything(): void {
        if (this._adapterProc) {
            this._adapterProc.kill('SIGINT');
            this._adapterProc = null;
        }

        super.clearEverything();
    }
}

