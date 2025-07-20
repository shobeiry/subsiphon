import { Siphon } from "../src";
import { of, Subscription, Unsubscribable } from "rxjs";

describe("@Siphon", () => {
    let consoleDebugSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log debug, warn, and error messages appropriately', () => {
        class MockSubscription {
            unsubscribe = jest.fn();
        }

        class BrokenSubscription {
            unsubscribe = () => { throw new Error('Unsub failed') };
        }

        @Siphon({ log: true })
        class TestComponent {
            valid = new MockSubscription();
            broken = new BrokenSubscription();
            array = [
                new MockSubscription(),
                {},
                new BrokenSubscription(),
            ];

            ngOnDestroy() {}
        }

        const component = new TestComponent();
        component.ngOnDestroy();

        // Expect valid and array[0] to call unsubscribe and log debug
        expect(component.valid.unsubscribe).toHaveBeenCalled();
        expect(consoleDebugSpy).toHaveBeenCalledWith('[Siphon] Unsubscribed: valid');
        expect(consoleDebugSpy).toHaveBeenCalledWith('[Siphon] Unsubscribed: array[0]');

        // Expect warn on array[1]
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Siphon] Skipped non-unsubscribable item in array[1]');

        // Expect error on broken and array[2]
        expect(consoleErrorSpy).toHaveBeenCalledWith('[Siphon] Error unsubscribing broken', expect.any(Error));
        expect(consoleErrorSpy).toHaveBeenCalledWith('[Siphon] Error unsubscribing array[2]', expect.any(Error));
    });

    it("should log unsubscribed properties with log: true", () => {
        @Siphon({ log: true })
        class TestComponent {
            stream1: Unsubscribable = { unsubscribe: jest.fn() };
            stream2: Unsubscribable = { unsubscribe: jest.fn() };

            ngOnDestroy() {}
        }

        const instance = new TestComponent();
        instance.ngOnDestroy();

        expect(consoleDebugSpy).toHaveBeenCalledWith("[Siphon] Unsubscribed: stream1");
        expect(consoleDebugSpy).toHaveBeenCalledWith("[Siphon] Unsubscribed: stream2");
    });

    it("should warn for non-unsubscribable properties with log: true", () => {
        @Siphon({ log: true })
        class TestComponent {
            value = "not unsubscribable";

            ngOnDestroy() {}
        }

        const instance = new TestComponent();
        instance.ngOnDestroy();

        expect(consoleWarnSpy).toHaveBeenCalledWith("[Siphon] value is not unsubscribable");
    });

    it("should log individual items inside arrays with log: true", () => {
        const unsub1 = { unsubscribe: jest.fn() };
        const unsub2 = { unsubscribe: jest.fn() };
        const invalid = { other: true };

        @Siphon({ log: true })
        class TestComponent {
            streams = [unsub1, unsub2, invalid];

            ngOnDestroy() {}
        }

        const instance = new TestComponent();
        instance.ngOnDestroy();

        expect(consoleDebugSpy).toHaveBeenCalledWith("[Siphon] Unsubscribed: streams[0]");
        expect(consoleDebugSpy).toHaveBeenCalledWith("[Siphon] Unsubscribed: streams[1]");
        expect(consoleWarnSpy).toHaveBeenCalledWith("[Siphon] Skipped non-unsubscribable item in streams[2]");
    });

    it("should warn if a key in include does not exist", () => {
        @Siphon({ include: ["missing"], log: true })
        class TestComponent {
            ngOnDestroy() {}
        }

        const instance = new TestComponent();
        instance.ngOnDestroy();

        expect(consoleWarnSpy).toHaveBeenCalledWith('[Siphon] Property "missing" does not exist on instance.');
    });

    it("should unsubscribe all subscriptions on destroy", () => {
        @Siphon()
        class TestComponent {
            sub1 = of(1).subscribe();
            sub2 = new Subscription();
            nonSub = { hello: "world" };

            ngOnDestroy() {
                // custom destroy logic
            }
        }

        const comp = new TestComponent();
        jest.spyOn(comp.sub1, "unsubscribe");
        jest.spyOn(comp.sub2, "unsubscribe");

        comp.ngOnDestroy();

        expect(comp.sub1.unsubscribe).toHaveBeenCalled();
        expect(comp.sub2.unsubscribe).toHaveBeenCalled();
    });
});
