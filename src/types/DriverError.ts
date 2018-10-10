import { DriverReason } from './reason';

export class DriverError extends Error {
  reason: DriverReason;

  constructor(message: string, reason: DriverReason) {
    super(message);
    this.reason = reason;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DriverError.prototype);
  }
}
