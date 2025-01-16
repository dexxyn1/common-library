export function formatZodErrorsToString(errors: { path: (string | number)[], message: string }[]): string {
    return errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
}
