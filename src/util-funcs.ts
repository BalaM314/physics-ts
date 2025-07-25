/*!license
Copyright © <BalaM314>, 2024. GNU General Public License.
*/

export class MessageError extends Error {
	name = "Message";
}

export function fail(message:string):never {
	throw new MessageError(message);
}

/**
 * Use for unrecoverable errors.
 * Called when an invariant is violated, or when there is a mistake in the code.
 */
export function crash(message:string, ...extra:unknown[]):never {
	if(extra.length > 0 && typeof console != "undefined") console.error(...extra);
	throw new Error(message);
}
/**
 * Use this function to mark cases that are obviously unreachable.
 * If the case is unreachable because a variable has type `never`, use {@link unreachable()} instead.
 * If there is a specific reason why the code is unreachable, use {@link crash()} instead.
 */
export function impossible():never {
	throw new Error(`this shouldn't be possible...`);
}
/**
 * Use this function to mark cases that are completely unreachable because a value has type `never`.
 */
export function unreachable(input:never, message?:string):never {
	throw new Error(message ?? `Entered unreachable code: expected a variable to have type never, but a value was produced: ${String(input)}`);
}

export function splitArray<T>(arr:T[], split:[T] | ((item:T, index:number, array:T[]) => boolean)):Array<{ group:T[]; splitter?:T; }> {
	const output:Array<{ group:T[]; splitter?:T; }> = [];
	for(const [i, item] of arr.entries()){
		if(
			typeof split == "function"
				? split(item, i, arr)
				: split[0] == arr[i]
		){
			output.push({
				group: [],
				splitter: item
			});
		} else {
			if(i == 0){
				output.push({
					group: [item]
				});
			} else {
				output.at(-1)!.group.push(item);
			}
		}
	}
	return output;
}

export function weave<T>(...arrays:ReadonlyArray<readonly T[]>):T[] {
	const out:T[] = [];
	for(let j = 0 ;; j ++){
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for(let i = 0; i < arrays.length; i ++){
			if(j >= arrays[i]!.length) return out;
			out.push(arrays[i]![j]!);
		}
	}
}

type Iterators<T extends unknown[]> = {
	[P in keyof T]: Iterator<T[P]>;
};
export function* zip<T extends unknown[]>(...iters:Iterators<T>):IterableIterator<T> {
	while(true){
		const values = iters.map(i => i.next());
		if(values.some(v => v.done)) break;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		yield values.map(v => v.value) as T;
	}
}

/** Consider running .map(l => l.trim()) on the input */
export function trimArray(input:string[]):string[] {
	if(input.length == 0) return [];

	/** Index of the first non-empty line in the array. */
	let start = 0;
	while(start < input.length && input[start]!.length == 0){
		start ++;
	}
	/** Index of the last non-empty line in the array. */
	let end = input.length - 1;
	while(end > 0 && input[end]!.length == 0){
		end --;
	}
	return input.slice(start, end + 1);
}

export function groupArray<T>(input:T[], size:number):T[][] {
	const output:T[][] = [[]];
	for(const el of input){
		if(output.at(-1)!.length == size) output.push([]);
		output.at(-1)!.push(el);
	}
	return output;
}

export function match<K extends PropertyKey, O extends Record<K, unknown>>(value:K, clauses:O):O[K];
export function match<K extends PropertyKey, const O extends Partial<Record<K, unknown>>, D>(value:K, clauses:O, defaultValue:D):O[K & keyof O] | D;
export function match(value:PropertyKey, clauses:Record<PropertyKey, unknown>, defaultValue?:unknown):unknown {
	return value in clauses ? clauses[value] : defaultValue;
}

export function convertNaN(value:number, fallback:number){
	return isNaN(value) ? fallback : value;
}

export function getElement<T extends typeof HTMLElement>(id:string, type:T){
	const element = document.getElementById(id) as unknown;
	if(element instanceof type) return element as T["prototype"];
	else if(element instanceof HTMLElement) crash(`Element with id ${id} was fetched as type ${type.name}, but was of type ${element.constructor.name}`);
	else crash(`Element with id ${id} does not exist`);
}

export const Mathf = {
	frac(x:number){
		return x - Math.floor(x);
	}
};

