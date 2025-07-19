/*!license
Copyright © <BalaM314>, 2024. GNU General Public License.
*/
export type U2I<T> = (T extends unknown ? ((_: T) => void) : never) extends (_: infer O) => void ? O : never;
