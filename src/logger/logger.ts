const createLogger = () => {
    const log = (message: string, print: boolean) => {
        if (!print) return;
        console.log(message )
    }
    return {log}
}

export const logger = createLogger();