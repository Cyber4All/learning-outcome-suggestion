import { Reason } from './reason';

export interface ClientError {
  error: any;
  message: string;
  status: Reason;
}
