import { readBit, readBits } from "./binaryUtils";

function padLeft(str: string, expectedWidth: number, char: string = " ") {
    let result = str;
    while (result.length < expectedWidth) {
        result = char + result;
    }

    return result;
}
export class CanMessage {
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

        const header = (parcel.readInt16LE(2) << 16) | parcel.readInt16LE(4);
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
