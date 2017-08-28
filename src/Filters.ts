export class Filters {
    constructor(private filters: number[] = []) { }
    get() {
        return this.filters;
    }
    set(newFilters: number[]) {
        this.filters = newFilters;
    }
}
