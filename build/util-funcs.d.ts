/*!license
Copyright © <BalaM314>, 2024. GNU General Public License.
*/
export declare class MessageError extends Error {
    name: string;
}
export declare function fail(message: string): never;
/**
 * Use for unrecoverable errors.
 * Called when an invariant is violated, or when there is a mistake in the code.
 */
export declare function crash(message: string, ...extra: unknown[]): never;
/**
 * Use this function to mark cases that are obviously unreachable.
 * If the case is unreachable because a variable has type `never`, use {@link unreachable()} instead.
 * If there is a specific reason why the code is unreachable, use {@link crash()} instead.
 */
export declare function impossible(): never;
/**
 * Use this function to mark cases that are completely unreachable because a value has type `never`.
 */
export declare function unreachable(input: never, message?: string): never;
export declare function splitArray<T>(arr: T[], split: [T] | ((item: T, index: number, array: T[]) => boolean)): Array<{
    group: T[];
    splitter?: T;
}>;
export declare function weave<T>(...arrays: ReadonlyArray<readonly T[]>): T[];
type Iterators<T extends unknown[]> = {
    [P in keyof T]: Iterator<T[P]>;
};
export declare function zip<T extends unknown[]>(...iters: Iterators<T>): IterableIterator<T>;
/** Consider running .map(l => l.trim()) on the input */
export declare function trimArray(input: string[]): string[];
export declare function groupArray<T>(input: T[], size: number): T[][];
export declare function match<K extends PropertyKey, O extends Record<K, unknown>>(value: K, clauses: O): O[K];
export declare function match<K extends PropertyKey, const O extends Partial<Record<K, unknown>>, D>(value: K, clauses: O, defaultValue: D): O[K & keyof O] | D;
export declare function convertNaN(value: number, fallback: number): number;
export declare function getElement<T extends typeof HTMLElement>(id: string, type: T): T["prototype"];
export {};
