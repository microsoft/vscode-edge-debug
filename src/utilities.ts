/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {utils} from 'vscode-chrome-debug-core';
import * as path from 'path';
import * as os from 'os';

const EDGE_ADAPTER_PATH = {
    OSX: '',
    WINx64: path.resolve(__dirname, '../../node_modules/edge-diagnostics-adapter/dist/x64/EdgeDiagnosticsAdapter.exe'),
    WINx86: path.resolve(__dirname, '../../node_modules/edge-diagnostics-adapter/dist/x86/EdgeDiagnosticsAdapter.exe'),
    LINUX: ''
};

export function getAdapterPath(): string {
    const platform = utils.getPlatform();
    // There is no good way to get the system arch so detecting the program files dir
    let arch;
    if(process.env.hasOwnProperty('ProgramFiles(x86)')){
        arch = 'x64';
    } else {
        arch = 'x86';
    }
    if (platform === utils.Platform.Windows) {
        if(arch === 'x64'){
            return EDGE_ADAPTER_PATH.WINx64;
        } else if(arch === 'x86'){
            return EDGE_ADAPTER_PATH.WINx86;
        }
    }
    return null;
}
