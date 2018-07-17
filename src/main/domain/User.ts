export class User {
    public id: string;
    public jurisdictionName: string;
    constructor(id: string, jurisdictionName: string) {
        this.id = id;
        this.jurisdictionName = jurisdictionName;
    }
}
