import { Subscription } from "rxjs";

export class SubSiphon {
    private subs: Record<PropertyKey, Subscription> = {};
    private index: number = 0;

    constructor() {
        return new Proxy(this, {
            set(self: SubSiphon, prop: PropertyKey, sub: any): boolean {
                if (prop in self) {
                    if (prop === "add") {
                        self.add = sub;
                        return true;
                    }
                    console.error(
                        `Attempted to add Subscription value to SubSiphon class methods: ${String(prop)} =`,
                        sub,
                    );
                    return false;
                }
                if (!(sub instanceof Subscription)) {
                    console.error(`Attempted to add non-Subscription value to SubSiphon: ${String(prop)} =`, sub);
                    return false;
                }
                if (prop in self.subs) {
                    self.subs[prop].unsubscribe();
                    delete self.subs[prop];
                }
                self.subs[prop] = sub;

                return true;
            },
            get(self: SubSiphon, prop: PropertyKey): any {
                if (prop in self) {
                    return (self as any)[prop];
                }
                if (self.subs.hasOwnProperty(prop)) {
                    return self.subs[prop];
                }
                return undefined;
            },
            has: (self: SubSiphon, prop: PropertyKey): boolean => prop in self.subs,
            deleteProperty: (self: SubSiphon, prop: PropertyKey): boolean => {
                if (self.subs[prop]) {
                    self.subs[prop].unsubscribe();
                    delete self.subs[prop];
                }
                return true;
            },
            ownKeys: (self: SubSiphon): ArrayLike<string | symbol> => Object.keys(self.subs),
            getOwnPropertyDescriptor(self: SubSiphon, prop: PropertyKey) {
                if (prop in self.subs) {
                    return {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: self.subs[prop],
                    };
                }
                return undefined;
            },
        }) as SubSiphon & Record<PropertyKey, Subscription>;
    }

    public set add(sub: Subscription) {
        let index = this.index;
        while (index in this.subs) {
            index += 1;
        }
        this.index = index;
        this.subs[index] = sub;
    }

    public unsubscribe(): void {
        for (const key in this.subs) {
            this.subs[key].unsubscribe();
        }
    }

    public destroy(): void {
        for (const key in this.subs) {
            this.subs[key].unsubscribe();
            delete this.subs[key];
        }
    }
}

export function createSubSiphon(): SubSiphon & Record<PropertyKey, Subscription> {
    return new SubSiphon() as any;
}
