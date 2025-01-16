import {z} from "zod";

export const idSchema = z.object({
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

export interface IdPayload {
    id: number;
}