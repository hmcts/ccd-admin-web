export class Definition {
  public jurisdictionId: string;
  public caseTypes: string;
  public description: string;
  public data: string;
  public author: string;
  constructor(jurisdictionId: string, description: string, data: string, author: string, caseTypes?: string) {
    this.jurisdictionId = jurisdictionId;
    this.caseTypes = caseTypes;
    this.description = description;
    this.data = data;
    this.author = author;
  }
}
