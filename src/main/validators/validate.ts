export class Validator {
    private field: string;
    constructor(field: string) {
        this.field = field;
    }
    public isEmpty() {
        return !this.field ? true : false;
    }
}
