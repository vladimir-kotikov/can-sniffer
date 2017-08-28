
import * as fs from "fs";
import * as path from "path";
import * as Serial from "serialport";
import * as stripComments from "strip-json-comments";

import { CanMessage } from "./src/CanMessage";
import { Filters } from "./src/Filters";

const DEFAULT_PORT: { [platform: string]: string } = {
    win32: "COM3",
    darwin: "/dev/cu.SLAB_USBtoUART",
    linux: "/dev/ttyUSB0",
};

let FILTERS = new Filters();
const DEBUG = process.argv.indexOf("--debug") >= 2;
const FILTER_FILE = path.resolve("./.canfilters");

if (fs.existsSync(FILTER_FILE)) {
    loadFilters(FILTERS, FILTER_FILE);

    fs.watch(FILTER_FILE, "utf8", () => {
        loadFilters(FILTERS, FILTER_FILE);
    });

    console.log(`Watching for filters from ${FILTER_FILE}`);
} else {
    console.log(`Can't find filters in ${FILTER_FILE}. Create one if you want to filter can messages`);
}

const serial = new Serial(DEFAULT_PORT[process.platform], {
    baudRate: 57600,
    autoOpen: true
});

serial.on("open", () => console.log("Port is opened"));
serial.on("error", err => console.error(err));

serial.on("data", (data: Buffer) => {
    if (DEBUG) {
        console.log("[DEBUG] Raw parcel", data.toString("hex"));
        console.log(`[DEBUG] LEN: ${data.readUInt16BE(0)} IDH: ${data.readUInt16BE(2)} IDL: ${data.readUInt16BE(4)}`);
    }

    const message = CanMessage.fromRawParcel(data);
    if (FILTERS.get().indexOf(message.ecuId) >= 0) {
        return;
    }

    let str = `EcuID: ${message.ecuId.toString(16)} : ${message.dataAsHexString()}`;

    if (message.extended) {
        str += " EXT: 1"
    }

    if (message.rtr) {
        str += " RTR: 1"
    }

    console.log(str);
});

function loadFilters(filters: Filters, filterFile: string): void {
    let content: any[];
    try {
        content = JSON.parse(stripComments(fs.readFileSync(filterFile, "utf8")));
        if (!Array.isArray(content)) {
            return;
        }

        content = content
            .map(int => parseInt(int))
            .filter(int => !isNaN(int));

        filters.set(content);

        let str = `Loaded ${content.length} filters`;
        if (DEBUG) {
            str += `: ${content.map(n => "0x" + n.toString(16))}`;
        }

        console.log(str);
    } catch (err) {
        return;
    }
}
