import {z} from "zod";

export const numberIdSchema = z.object({
    id: z.preprocess((val) => {
        // Convert strings and numbers to a number
        if (typeof val === 'string' || typeof val === 'number') {
            return Number(val);
        }
        throw new Error("Unsupported type for id"); // Explicitly throw for unsupported types
    }, z.number().positive({
        message: 'must be a positive number',
    })),
});

export function formatZodErrorsToString(errors: { path: (string | number)[], message: string }[]): string {
    return errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
}

const ValidationUtils = {
    numberIdSchema,
    formatZodErrorsToString,
};

export { ValidationUtils };

