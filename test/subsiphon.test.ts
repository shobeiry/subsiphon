import { SubSiphon } from "../src";
import { Subscription } from "rxjs";

describe("SubSiphon", () => {
    let siphon: SubSiphon;

    beforeEach(() => {
        siphon = new SubSiphon();
    });

    it("should add a valid Subscription", () => {
        const sub = new Subscription();
        siphon.siphon = sub;

        const stored = Object.values(siphon.siphon);
        expect(stored).toContain(sub);
    });

    it("should call unsubscribe on all stored subscriptions", () => {
        const sub1 = new Subscription();
        const sub2 = new Subscription();
        const spy1 = jest.spyOn(sub1, "unsubscribe");
        const spy2 = jest.spyOn(sub2, "unsubscribe");

        siphon.siphon = sub1;
        siphon.siphon = sub2;

        siphon.unsubscribe();

        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);
    });

    it("should clear all subscriptions after destroy", () => {
        const sub = new Subscription();
        siphon.siphon = sub;

        expect(Object.keys(siphon.siphon).length).toBe(1);

        siphon.destroy();

        expect(Object.keys(siphon.siphon).length).toBe(0);
    });

    it('should warn and throw when a non-Subscription value is added', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        expect(() => {
            // @ts-ignore - intentionally inserting invalid type
            siphon['siphon'] = 'not a subscription';
        }).toThrow(TypeError);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Attempted to add non-Subscription value to SubSiphon:'),
            'not a subscription'
        );

        warnSpy.mockRestore();
    });

    it('should return undefined when getting a nonexistent property', () => {
        const result = siphon['siphon'].nonExistentKey;
        expect(result).toBeUndefined();
    });
});
