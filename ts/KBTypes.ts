/**
 * The types allowed to used on a instance of KBCommandModifiers.
 */
export type KBTypes = "string" | "number" | "boolean";

/**
 * The base type for command modifiers.
 */
export type KBCommandModifiers = { [key: string]: KBTypes; } | undefined;