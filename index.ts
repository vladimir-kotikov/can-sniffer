
import * as Serial from "serialport";
import { CanMessage } from "./src/CanMessage";

const DEFAULT_PORT: { [platform: string]: string } = {
    win32: "COM3",
    darwin: "/dev/cu.SLAB_USBtoUART",
    linux: "/dev/ttyUSB0",
};

const DEBUG = process.argv.indexOf("--debug") >= 2;

const serial = new Serial(DEFAULT_PORT[process.platform], {
    baudRate: 57600,
    autoOpen: true
});

serial.on("open", () => console.log("Port is opened"));
serial.on("error", err => console.error(err));

serial.on("data", (data: Buffer) => {
    if (DEBUG) {
        console.log("[DEBUG] Raw parcel", data.toString("hex"));
        console.log(`[DEBUG] LEN: ${data.readInt16BE(0)} IDH: ${data.readInt16BE(2)} IDL: ${data.readInt16BE(4)}`);
    }

    const message = CanMessage.fromRawParcel(data);
    let str = `ArbID: ${message.arbitrationId ? message.arbitrationId.toString(16) : "---"} ` +
        `EcuID: ${message.ecuId.toString(16)} : ` +
        `${message.dataAsHexString()}`;

    if (message.extended) {
        str += " EXT: 1"
    }

    if (message.rtr) {
        str += " RTR: 1"
    }

    console.log(str);
});
