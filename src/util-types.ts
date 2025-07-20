/*!license
Copyright © <BalaM314>, 2024. GNU General Public License.
*/

export type U2I<T> = (
	T extends unknown ? ((_:T) => void) : never
) extends (_:infer O) => void ? O : never;

/** Makes the property K of T optional. */
export type PartialKey<T, K extends keyof T> = Partial<T> & Omit<T, K>;

/**Sets a variable to be of a particular type. */
export function forceType<T>(input:unknown): asserts input is T {}
