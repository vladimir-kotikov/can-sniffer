
import * as Serial from "serialport";

const serial = new Serial("COM3", {
    baudRate: 57600,
    autoOpen: true
});

serial.on("open", () => console.log("Port is opened"));

serial.on("data", (data: Buffer) => {
    const len = data.readInt8(1);
    const arbID = data.readInt32BE(2);
    const message = data.subarray(4, 4 + len);
    console.log(data.toString("hex"));
});

serial.on("error", err => console.error(err));
