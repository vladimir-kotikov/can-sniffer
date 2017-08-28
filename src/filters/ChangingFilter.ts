
import { BaseFilter, IFilter } from "./BaseFilter";
import { CanMessage } from "../CanMessage";

export class ChangingFilter extends BaseFilter implements IFilter {
    public static configName = "changing";

    private capturedMessages: { [ecuId: number]: number[] };

    constructor(data: any) {
        super();
        this.capturedMessages = { };
    }

    passes(message: CanMessage): boolean {
        if (this.capturedMessages[message.ecuId] &&
            arrayEqual(this.capturedMessages[message.ecuId], message.data)) {

            return false;
        }

        this.capturedMessages[message.ecuId] = message.data;
        return true;
    }
}

function arrayEqual(arr1: number[], arr2: number[]) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
