import { Status } from '@grpc/grpc-js/build/src/constants';

export class GrpcError extends Error {
    name = this.constructor.name;
    code: Status;
    base = 'GrpcError';

    constructor(message?: string, code: Status = Status.UNKNOWN) {
        super(message);
        this.code = code;
    }

    toString(): string {
        if (this.message === this.base) {
            return this.message;
        } else {
            return `${this.base}: ${this.message}`;
        }
    }
}

export class InvalidArgumentError extends GrpcError {
    base = INVALID_ARGUMENT;
    constructor(message = INVALID_ARGUMENT) {
        super(message, Status.INVALID_ARGUMENT);
    }
}

export class NotFoundError extends GrpcError {
    base = NOT_FOUND;
    constructor(message = NOT_FOUND) {
        super(message, Status.NOT_FOUND);
    }
}

export class PermissionError extends GrpcError {
    base = PERMISSION_DENIED;
    constructor(message = PERMISSION_DENIED) {
        super(message, Status.PERMISSION_DENIED);
    }
}

export class UnauthenticatedError extends GrpcError {
    base = UNAUTHENTICATED;
    constructor(message = UNAUTHENTICATED) {
        super(message, Status.UNAUTHENTICATED);
    }
}

const INVALID_ARGUMENT = 'Invalid Argument';
const NOT_FOUND = 'Not Found';
const PERMISSION_DENIED = 'Permission denied';
const UNAUTHENTICATED = 'Unauthenticated';
