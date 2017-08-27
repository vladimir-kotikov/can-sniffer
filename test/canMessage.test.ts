import * as assert from "assert";
import { CanMessage } from "../index";

const sampleParcel = Buffer.from([
    0x08, 0x31, // LEN
    0x00, 0x00, // IDH
    0x25, 0x06, // IDL
    0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

describe("CanMessage", () => {
    it("Should parse from raw data correctly", () => {
        const parcel = CanMessage.fromRawParcel(sampleParcel);
        assert.equal(parcel.length, 8);
        assert.equal(parcel.arbitrationId, 0);
        assert.equal(parcel.ecuId, 0x625);
    });
});
