import { Unsubscribable } from "rxjs";

export interface SiphonOptions {
    include?: string[];
    exclude?: string[];
    log?: boolean;
}

const isUnsubscribable = (value: any): value is Unsubscribable => value && typeof value.unsubscribe === "function";

const tryUnsubscribe = (value: any, key: string, options: SiphonOptions): void => {
    if (isUnsubscribable(value)) {
        try {
            value.unsubscribe();
            if (options.log) {
                console.debug(`[Siphon] Unsubscribed: ${key}`);
            }
        } catch (err) {
            console.error(`[Siphon] Error unsubscribing ${key}`, err);
        }
    } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (isUnsubscribable(item)) {
                try {
                    item.unsubscribe();
                    if (options.log) {
                        console.debug(`[Siphon] Unsubscribed: ${key}[${i}]`);
                    }
                } catch (err) {
                    console.error(`[Siphon] Error unsubscribing ${key}[${i}]`, err);
                }
            } else if (options.log) {
                console.warn(`[Siphon] Skipped non-unsubscribable item in ${key}[${i}]`);
            }
        }
    } else if (options.log) {
        console.warn(`[Siphon] ${key} is not unsubscribable`);
    }
};

export function Siphon(options: SiphonOptions = {}): ClassDecorator {
    return function (target: any) {
        const originalDestroy = target.prototype.ngOnDestroy;

        target.prototype.ngOnDestroy = function () {
            const instance = this;
            const allKeys = Object.keys(instance);
            const keysToCheck = options.include
                ? options.include
                : allKeys.filter((key) => !options.exclude?.includes(key));

            for (const key of keysToCheck) {
                if (!allKeys.includes(key)) {
                    console.warn(`[Siphon] Property "${key}" does not exist on instance.`);
                    continue;
                }

                tryUnsubscribe(instance[key], key, options);
            }

            if (typeof originalDestroy === "function") {
                originalDestroy.apply(this);
            }
        };
    };
}
