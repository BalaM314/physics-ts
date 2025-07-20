/*!license
Copyright © <BalaM314>, 2024. GNU General Public License.
*/
export class MessageError extends Error {
    constructor() {
        super(...arguments);
        this.name = "Message";
    }
}
export function fail(message) {
    throw new MessageError(message);
}
/**
 * Use for unrecoverable errors.
 * Called when an invariant is violated, or when there is a mistake in the code.
 */
export function crash(message, ...extra) {
    if (extra.length > 0 && typeof console != "undefined")
        console.error(...extra);
    throw new Error(message);
}
/**
 * Use this function to mark cases that are obviously unreachable.
 * If the case is unreachable because a variable has type `never`, use {@link unreachable()} instead.
 * If there is a specific reason why the code is unreachable, use {@link crash()} instead.
 */
export function impossible() {
    throw new Error(`this shouldn't be possible...`);
}
/**
 * Use this function to mark cases that are completely unreachable because a value has type `never`.
 */
export function unreachable(input, message) {
    throw new Error(message ?? `Entered unreachable code: expected a variable to have type never, but a value was produced: ${String(input)}`);
}
export function splitArray(arr, split) {
    const output = [];
    for (const [i, item] of arr.entries()) {
        if (typeof split == "function"
            ? split(item, i, arr)
            : split[0] == arr[i]) {
            output.push({
                group: [],
                splitter: item
            });
        }
        else {
            if (i == 0) {
                output.push({
                    group: [item]
                });
            }
            else {
                output.at(-1).group.push(item);
            }
        }
    }
    return output;
}
export function weave(...arrays) {
    const out = [];
    for (let j = 0;; j++) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < arrays.length; i++) {
            if (j >= arrays[i].length)
                return out;
            out.push(arrays[i][j]);
        }
    }
}
export function* zip(...iters) {
    while (true) {
        const values = iters.map(i => i.next());
        if (values.some(v => v.done))
            break;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        yield values.map(v => v.value);
    }
}
/** Consider running .map(l => l.trim()) on the input */
export function trimArray(input) {
    if (input.length == 0)
        return [];
    /** Index of the first non-empty line in the array. */
    let start = 0;
    while (start < input.length && input[start].length == 0) {
        start++;
    }
    /** Index of the last non-empty line in the array. */
    let end = input.length - 1;
    while (end > 0 && input[end].length == 0) {
        end--;
    }
    return input.slice(start, end + 1);
}
export function groupArray(input, size) {
    const output = [[]];
    for (const el of input) {
        if (output.at(-1).length == size)
            output.push([]);
        output.at(-1).push(el);
    }
    return output;
}
export function match(value, clauses, defaultValue) {
    return value in clauses ? clauses[value] : defaultValue;
}
export function convertNaN(value, fallback) {
    return isNaN(value) ? fallback : value;
}
export function getElement(id, type) {
    const element = document.getElementById(id);
    if (element instanceof type)
        return element;
    else if (element instanceof HTMLElement)
        crash(`Element with id ${id} was fetched as type ${type.name}, but was of type ${element.constructor.name}`);
    else
        crash(`Element with id ${id} does not exist`);
}
export const Mathf = {
    frac(x) {
        return x - Math.floor(x);
    }
};
