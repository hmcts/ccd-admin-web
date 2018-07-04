export class Validator {
    field: string;
    constructor(field: string) {
        this.field = field;
    }
    isEmpty() {
        return !this.field ? true:false;
    }
}