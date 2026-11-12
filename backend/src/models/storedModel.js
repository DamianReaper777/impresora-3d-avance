export class StoredModel {
  constructor({
    id,
    name,
    size,
    uploadedAt
  }) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.uploadedAt = uploadedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      uploadedAt: this.uploadedAt
    };
  }
}