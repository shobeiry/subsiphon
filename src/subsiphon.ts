import {Subscription} from 'rxjs';

type Siphon = any;

export class SubSiphon {
    private index: number = 0;
    private proxy = new Proxy({} as Siphon, {
        set(target: Siphon, p: string | symbol, newValue: any): boolean {
            if (!(newValue instanceof Subscription)) {
                console.warn(`Attempted to add non-Subscription value to SubSiphon: ${String(p)} =`, newValue);
                return false;
            }
            target[p] = newValue;
            return true;
        },
        get(target: Siphon, p: string | symbol): any {
            if (target.hasOwnProperty(p)) {
                return target[p];
            }
            return undefined;
        },
        has: (target: Siphon, p: string | symbol): boolean => p in target,
        deleteProperty: (target: Siphon, p: string | symbol): boolean => delete target[p]
    });

    set siphon(sub: Subscription) {
        let index = this.index;
        while (index in this.proxy) {
            index += 1;
        }
        this.index = index;
        this.proxy[index] = sub;
    }

    get siphon(): Siphon {
        return this.proxy;
    }

    public unsubscribe(): void {
        for (const key in this.proxy) {
            this.proxy[key]?.unsubscribe();
        }
    }

    public destroy(): void {
        this.unsubscribe();
        for (const key in this.proxy) {
            delete this.proxy[key];
        }
    }
}