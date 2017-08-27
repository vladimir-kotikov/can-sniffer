
import * as Serial from "serialport";

const DEFAULT_PORT: { [platform: string]: string } = {
    win32: "COM3",
    darwin: "/dev/cu.SLAB_USBtoUART",
    linux: "/dev/tty-usbserial1",
};

const serial = new Serial(DEFAULT_PORT[process.platform], {
    baudRate: 57600,
    autoOpen: true
});

serial.on("open", () => console.log("Port is opened"));

serial.on("data", (data: Buffer) => {
    const message = CanMessage.fromRawParcel(data);
    let str = `ArbID: ${message.arbitrationId || "---"} EcuID: ${message.ecuId} : ${message.dataAsHexString()}`;
    if (message.extended) {
        str += " EXT: 1"
    }

    if (message.rtr) {
        str += " RTR: 1"
    }

    console.log(str);
});

serial.on("error", err => console.error(err));


class CanMessage {
    public extended: boolean = false;
    public rtr: boolean = false;
    public arbitrationId: number;
    public ecuId: number;
    public length: number = 0;
    public data: number[] = [];

    public static fromRawParcel(parcel: Buffer): CanMessage {
        let result = new CanMessage();
        result.length = parcel.readInt8(0);

        const canExtByte = parcel.readInt8(1);
        result.extended = readBit(7, canExtByte) === 1;
        result.rtr = readBit(7, canExtByte) === 1;

        const header = (parcel.readInt16LE(2) << 16) & parcel.readInt16LE(4);
        result.ecuId = readBits(0, 11, header);
        result.arbitrationId = result.extended ? readBits(12, 29, header) : 0;

        for (var i = 0; i < result.length; i++) {
            result.data[i] = parcel.readInt8(6 + i);
        }

        return result;
    }

    public dataAsHexString(): string {
        return this.data
            .map(byte => byte.toString(16))
            .map(repr => padLeft(repr, 2, "0"))
            .join(" ");
    }
}

export function padLeft(str: string, expectedWidth: number, char: string = " ") {
    let result = str;
    while (result.length < expectedWidth) {
        result = char + result;
    }

    return result;
}

export function readBit(bitNo: number, value: number) {
    return readBits(bitNo, bitNo, value);
}

export function readBits(startBit: number, endBit: number, value: number) {
    let mask = 0;
    for (let i = startBit; i <= endBit; i++)
        mask |= 1 << i;

    return (value & mask) >> startBit;
}


