export class Printer {
  constructor({
    id,
    name,
    ip,
    status,
    progress = 0,
    remainingSeconds = 0
  }) {
    this.id = id;
    this.name = name;
    this.ip = ip;
    this.status = status;
    this.progress = progress;
    this.remainingSeconds = remainingSeconds;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ip: this.ip,
      status: this.status,
      progress: this.progress,
      remainingSeconds: this.remainingSeconds
    };
  }
}