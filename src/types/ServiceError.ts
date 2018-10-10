import { ServiceReason } from './reason';

export class ServiceError extends Error {
  reason: number;
  constructor(message: string, reason: ServiceReason) {
    super(message);
    this.reason = reason;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}
