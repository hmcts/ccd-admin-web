export class UserProfile {
    public id: string;
    public currentJurisdiction: string;
    public jurisdictionname: string;
    public caseType: string;
    public state: string;
    constructor(id: string, currentJurisdiction: string, jurisdictionname: string, caseType: string, state: string) {
        this.id = id;
        this.currentJurisdiction = currentJurisdiction;
        this.jurisdictionname = jurisdictionname;
        this.currentJurisdiction = currentJurisdiction;
        this.caseType = caseType;
        this.state = state;
    }
}
