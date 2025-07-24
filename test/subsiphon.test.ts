import { createSubSiphon } from "../src";
import { Subscription } from "rxjs";

describe("SubSiphon (with Proxy)", () => {
    let siphon: ReturnType<typeof createSubSiphon>;

    beforeEach(() => {
        siphon = createSubSiphon();
    });

    it("should add a valid Subscription by custom key", () => {
        const sub = new Subscription();
        siphon.test = sub;

        expect(siphon.test).toBe(sub);
    });

    it("should add a valid Subscription using auto index", () => {
        const sub1 = new Subscription();
        const sub2 = new Subscription();
        siphon.add = sub1;
        expect(siphon[0]).toBe(sub1);
        siphon.add = sub2;
        expect(siphon[1]).toBe(sub2);
        const keys = Object.keys(siphon);
        expect(keys).toContain("0");
        expect(keys).toContain("1");
    });

    it("should clear all subscriptions after destroy", () => {
        siphon.test = new Subscription();
        expect(Object.keys(siphon).length).toBe(1);
        siphon.destroy();
        expect(Object.keys(siphon).length).toBe(0);
    });

    it("should error and not add when a non-Subscription value is set", () => {
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => {
            // @ts-ignore - intentionally inserting invalid type
            siphon["invalid"] = "not a subscription";
        }).toThrow(TypeError);
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Attempted to add non-Subscription value to SubSiphon:"),
            "not a subscription",
        );
        expect(siphon["invalid"]).toBeUndefined();
        errorSpy.mockRestore();
    });

    it("should return undefined when getting a nonexistent property", () => {
        expect(Object.getOwnPropertyDescriptor(siphon, "nonExistent")).toBeUndefined();
        expect(siphon.nonExistentKey).toBeUndefined();
    });

    it("should unsubscribe and delete property when key exists", () => {
        const sub = new Subscription();
        const spy = jest.spyOn(sub, "unsubscribe");
        siphon.test = sub;
        const result = delete siphon.test;
        expect(result).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect("test" in siphon).toBe(false);
    });

    it("should return true when deleting non-existent property", () => {
        expect(delete siphon.nonExistent).toBe(true);
    });

    it("unsubscribe should call unsubscribe on all subscriptions", () => {
        const sub1 = new Subscription();
        const sub2 = new Subscription();
        const spy1 = jest.spyOn(sub1, "unsubscribe");
        const spy2 = jest.spyOn(sub2, "unsubscribe");

        siphon.one = sub1;
        siphon.two = sub2;

        siphon.unsubscribe();

        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it("should error and not allow when a Subscription is set class methods", () => {
        const sub = new Subscription();
        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => {
            // @ts-ignore - intentionally inserting invalid type
            siphon["unsubscribe"] = sub;
        }).toThrow(TypeError);
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Attempted to add Subscription value to SubSiphon class methods:"),
            expect.any(Subscription),
        );
        errorSpy.mockRestore();
    });

    it("should unsubscribe previous subscription when overwriting same key", () => {
        const oldSub = new Subscription();
        const newSub = new Subscription();
        const spy = jest.spyOn(oldSub, "unsubscribe");
        siphon.sameKey = oldSub;
        siphon.sameKey = newSub;
        expect(spy).toHaveBeenCalledTimes(1);
        expect(siphon.sameKey).toBe(newSub);
    });

    it("should return true/false correctly for 'in' operator", () => {
        siphon.sub1 = new Subscription();
        expect("sub1" in siphon).toBeTruthy();
    });
});
