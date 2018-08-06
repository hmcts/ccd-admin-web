export class UserProfile {
    public id: string;
    public jurisdictionname: string;
    public caseType: string;
    public state: string;
    constructor(id: string, jurisdictionname: string, caseType: string, state: string) {
        this.id = id;
        this.jurisdictionname = jurisdictionname;
        this.caseType = caseType;
        this.state = state;
    }
}
