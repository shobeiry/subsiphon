import { MonoTypeOperatorFunction, Subject, takeUntil } from 'rxjs';

const destroySubjects = new WeakMap<object, Subject<void>>();

export function siphon<T>(instance: object): MonoTypeOperatorFunction<T> {
    if (!destroySubjects.has(instance)) {
        const destroy$ = new Subject<void>();
        destroySubjects.set(instance, destroy$);

        const originalDestroy = (instance as any).ngOnDestroy;

        (instance as any).ngOnDestroy = function () {
            destroy$.next();
            destroy$.complete();
            destroySubjects.delete(instance);
            if (typeof originalDestroy === 'function') {
                originalDestroy.apply(this);
            }
        };
    }

    return takeUntil<T>(destroySubjects.get(instance)!);
}