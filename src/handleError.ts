import { color, ConsoleColor } from '@cardboardrobots/console-style';
import { sendUnaryData } from '@grpc/grpc-js';
import { ValidationError } from 'yup';

import { InvalidArgumentError } from './GrpcError';

export function handleError(error: any, callback: sendUnaryData<any>) {
    if (error instanceof ValidationError || error.name === 'ValidationError') {
        const wrappedError = new InvalidArgumentError(JSON.stringify(error.errors));
        console.error(color(ConsoleColor.Red, wrappedError.stack));
        callback(wrappedError);
    } else {
        const wrappedError = error instanceof Error ? error : new Error(error as any);
        console.error(color(ConsoleColor.Red, wrappedError.stack));
        callback(wrappedError);
    }
}
