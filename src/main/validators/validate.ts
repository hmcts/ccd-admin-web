export class Validator {
    private field: string;
    constructor(field: string) {
        this.field = field;
    }
    public isEmpty() {
        return !this.field;
    }

    public isAlphanumber() {
        if (!this.isEmpty()) {
            return /^[a-zA-Z0-9-_]+$/.test(this.field);
        } else {
            return false;
        }
    }
}
