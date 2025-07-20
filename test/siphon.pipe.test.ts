import { of, Subject } from "rxjs";
import { siphon } from "../src";

describe("siphon", () => {
    let instance: any;

    beforeEach(() => {
        instance = {};
    });

    it("should complete observable when destroy$ emits", (done) => {
        const destroy$ = new Subject<void>();
        const results: number[] = [];

        of(1, 2, 3)
            .pipe(siphon(destroy$))
            .subscribe({
                next: (val) => results.push(val),
                complete: () => {
                    expect(results).toEqual([1, 2, 3]);
                    done();
                },
            });

        destroy$.next();
    });

    it('should patch ngOnDestroy and call destroy$.next, complete, and original ngOnDestroy if present', () => {
        const originalDestroy = jest.fn();
        instance.ngOnDestroy = originalDestroy;

        // Call siphon to patch instance
        siphon(instance);

        // Get internal destroy$ subject
        const destroy$ = (global as any).destroySubjects?.get?.(instance); // for debugging only
        // Instead, we check effects by spying

        // Spy on Subject methods
        const nextSpy = jest.spyOn(Subject.prototype, 'next');
        const completeSpy = jest.spyOn(Subject.prototype, 'complete');

        // Call patched ngOnDestroy
        instance.ngOnDestroy();

        expect(nextSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
        expect(originalDestroy).toHaveBeenCalled();

        // Check that subject has been removed
        // As destroySubjects is a WeakMap in the same module, we can't access it directly
        // But we can safely call siphon again and make sure a new Subject is created (no error thrown)
        expect(() => siphon(instance)).not.toThrow();
    });

    it('should handle absence of original ngOnDestroy gracefully', () => {
        // No original ngOnDestroy
        expect(instance.ngOnDestroy).toBeUndefined();

        siphon(instance);

        const nextSpy = jest.spyOn(Subject.prototype, 'next');
        const completeSpy = jest.spyOn(Subject.prototype, 'complete');

        // Call patched ngOnDestroy
        instance.ngOnDestroy();

        expect(nextSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
    });
});
