import { Responder } from '../../interfaces/interfaces';
import { Response } from 'express';
import { ClientError } from '../../types';
export class ExpressResponder implements Responder {
  constructor(private res: Response) {}
  sendOperationSuccess(): void {
    this.res.sendStatus(200);
  }
  sendOperationError(error: ClientError): void {
    this.res.status(error.status).send(error.message);
  }
  sendObject(object: any): void {
    this.res.status(200).send(object);
  }

  writeStream(): Response {
    return this.res;
  }
}
