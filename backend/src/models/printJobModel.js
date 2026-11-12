export class PrintJob {
  constructor({
    id,
    printerId,
    modelId,
    modelName,
    settings,
    status = "pending",
    createdAt,
    startedAt = null,
    completedAt = null
  }) {
    this.id = id;
    this.printerId = printerId;
    this.modelId = modelId;
    this.modelName = modelName;
    this.settings = settings;
    this.status = status;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
  }

  toJSON() {
    return {
      id: this.id,
      printerId: this.printerId,
      modelId: this.modelId,
      modelName: this.modelName,
      settings: this.settings,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt
    };
  }
}