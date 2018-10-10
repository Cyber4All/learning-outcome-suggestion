import { Response } from 'express';
import { ClientError } from '../types';
export interface Responder {
  sendOperationSuccess(): void;
  sendOperationError(error: ClientError): void;
  sendObject(object: any): void;

  writeStream(): Response;
}
