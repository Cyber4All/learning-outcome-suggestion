export enum REASON {
  BAD_REQUEST = 400,
  METHOD_NOT_IMPLEMENTED = 501,
}
export enum GENERIC_REASON {
  UNEXPECTED_ERROR = 500,
}

export type GenericReason = GENERIC_REASON;

export enum DRIVER_REASON {
  RESOURCE_NOT_FOUND = 404,
}
export type DriverReason = GenericReason | DRIVER_REASON | REASON;

export enum SERVICE_REASON {
  NOT_AUTHORIZED = 403,
}
export type ServiceReason = GenericReason | SERVICE_REASON | REASON;

export type Reason = GenericReason | DriverReason | ServiceReason;
