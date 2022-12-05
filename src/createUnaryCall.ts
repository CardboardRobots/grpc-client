import * as grpc from '@grpc/grpc-js';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { GrpcError, InvalidArgumentError, NotFoundError, PermissionError, UnauthenticatedError } from './GrpcError';

type CallResponse<TCall> = TCall extends (
    argument: any,
    callback: (error: any, result?: infer TResponse | undefined) => void
) => grpc.ClientUnaryCall
    ? TResponse
    : never;

type CallRequest<TCall> = TCall extends (
    argument: infer TRequest,
    callback: (error: any, result?: any | undefined) => void
) => grpc.ClientUnaryCall
    ? TRequest
    : never;

type ClientUnaryCall<
    TCall extends (argument: any, callback: (error: any, result?: any | undefined) => void) => grpc.ClientUnaryCall
> = (request: CallRequest<TCall>) => Promise<CallResponse<TCall>>;

export function createUnaryCall<
    TCall extends (argument: any, callback: (error: any, result?: any | undefined) => void) => grpc.ClientUnaryCall
>(call: TCall) {
    return (request: CallRequest<TCall>) => {
        return new Promise<CallResponse<TCall>>(async (resolve, reject) => {
            call(request, (error, result) => {
                if (error) {
                    let _error: GrpcError;
                    if ('code' in error) {
                        switch (error.code as Status) {
                            case Status.INVALID_ARGUMENT:
                                _error = new InvalidArgumentError(error?.details ?? error?.message);
                                break;
                            case Status.NOT_FOUND:
                                _error = new NotFoundError(error?.details ?? error?.message);
                                break;
                            case Status.PERMISSION_DENIED:
                                _error = new PermissionError(error?.details ?? error?.message);
                                break;
                            case Status.UNAUTHENTICATED:
                                _error = new UnauthenticatedError(error?.details ?? error?.message);
                                break;
                            case Status.UNKNOWN:
                            default:
                                _error = new GrpcError(error?.details ?? error?.message);
                                break;
                        }
                    } else {
                        _error = new GrpcError(error?.details ?? error?.message);
                    }
                    reject(_error);
                } else if (!result) {
                    const _error = new GrpcError();
                    reject(_error);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

type WrappedClient<
    TClient extends Record<
        string,
        (argument: any, callback: (error: any, result?: any | undefined) => void) => grpc.ClientUnaryCall
    >
> = {
    [Property in keyof TClient]: ClientUnaryCall<TClient[Property]>;
};

export function wrapClient<
    TClient extends Record<
        string,
        (argument: any, callback: (error: any, result?: any | undefined) => void) => grpc.ClientUnaryCall
    >
>(client: TClient, thisArg: any): WrappedClient<TClient> {
    return Object.entries(client).reduce((result, [key, value]) => {
        result[key as keyof WrappedClient<TClient>] = createUnaryCall(value.bind(thisArg));
        return result;
    }, {} as WrappedClient<TClient>);
}

export function pick<TObject extends Record<string, any>, TKey extends keyof TObject>(
    object: TObject,
    ...keys: TKey[]
): Pick<TObject, TKey> {
    return keys.reduce((result, key) => {
        result[key] = object[key];
        return result;
    }, {} as Pick<TObject, TKey>);
}

export function getHttpStatus(error: any) {
    if (!error) {
        return 200;
    }

    if (error instanceof Error) {
        switch (error.name) {
            case InvalidArgumentError.name:
                return 406;
            case NotFoundError.name:
                return 404;
            case PermissionError.name:
                return 403;
            case UnauthenticatedError.name:
                return 401;
            default:
                return 404;
        }
    }

    return 404;
}
