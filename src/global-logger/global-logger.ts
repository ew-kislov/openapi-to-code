export enum LogLevel {
    Info = 'info',
    Warning = 'warning',
    Error = 'error'
}

let context = {};

export function setGlobalContext(newContext: object) {
    context = { ...newContext };
}

export function log(message: string, level: LogLevel) {
    const logLevelString = getLogLevelString(level);
    const contextMessage = getContextString();

    const logString = `${logLevelString}${message}, ${contextMessage}`;

    switch (level) {
        case LogLevel.Warning:
            console.warn(logString);
            break;
        case LogLevel.Error:
            console.error(logString);
            break;
        default:
            console.log(logString);
            break;
    }
}

function getLogLevelString(level: LogLevel): string {
    switch (level) {
        case LogLevel.Warning:
            return '(Warining) ';
        case LogLevel.Error:
            return 'Error: ';
        default:
            return '';
    }
}

function getContextString() {
    return Object.entries(context).map(([key, value]) => `${key}: ${value}`).join(', ');
}