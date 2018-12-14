import { Responder } from '../../interfaces/interfaces';
import { Response } from 'express';
import { ClientError, GENERIC_REASON } from '../../types';
export class ExpressResponder implements Responder {
  constructor(private res: Response) {}
  sendOperationSuccess(): void {
    this.res.sendStatus(200);
  }
  sendOperationError(error: ClientError): void {
    this.res.status(error && error.error && error.error.reason ? error.error.reason : GENERIC_REASON.UNEXPECTED_ERROR).send(error);
  }
  sendObject(object: any): void {
    this.res.status(200).send(object);
  }

  writeStream(): Response {
    return this.res;
  }
}
