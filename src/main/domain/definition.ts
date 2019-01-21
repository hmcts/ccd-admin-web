export class Definition {
  public jurisdictionId: string;
  public caseTypes: string;
  public description: string;
  public version: number;
  public status: string;
  public data: object;
  public author: string;
  constructor(jurisdictionId: string, description: string, data: string, author: string, caseTypes?: string,
              version?: number, status?: string) {
    this.jurisdictionId = jurisdictionId;
    this.caseTypes = caseTypes;
    this.description = description;
    this.version = version;
    this.status = status;
    this.data = JSON.parse(data);
    this.author = author;
  }
}
