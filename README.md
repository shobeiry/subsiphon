# SubSiphon

[![npm version](https://img.shields.io/npm/v/subsiphon)](https://www.npmjs.com/package/subsiphon)
[![npm downloads](https://img.shields.io/npm/dm/subsiphon)](https://www.npmjs.com/package/subsiphon)
[![License](https://img.shields.io/npm/l/subsiphon)](https://github.com/shobeiry/subsiphon/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/shobeiry/subsiphon/branch/master/graph/badge.svg)](https://codecov.io/gh/shobeiry/subsiphon)

`SubSiphon` is a lightweight utility to manage multiple RxJS `Subscription`s. It lets you add subscriptions via numeric indexes or named keys and provides easy `unsubscribe()` and `destroy()` methods to clean them up.

---

## Installation

```bash
npm install subsiphon
```

---

## Usage

### Basic Example

```typescript
import { interval } from 'rxjs';
import { createSubSiphon } from 'subsiphon';

const siphon = createSubSiphon();

// Add subscriptions via index
siphon[0] = interval(1000).subscribe(val => console.log('Index 0:', val));

// Add subscriptions via "add" setter (auto-increment index)
siphon.add = interval(1500).subscribe(val => console.log('Auto index:', val));

// Add named subscriptions
siphon.anyName1 = interval(500).subscribe(val => console.log('Named:', val));
siphon.anyName2 = interval(500).subscribe(val => console.log('Named:', val));

// Access subscriptions
console.log('Keys:', Object.keys(siphon)); // ["0", "anyName1", "anyName2"]

// Unsubscribe all
siphon.unsubscribe();

// unsubscribe and clear all and reset
siphon.destroy();
```

---

### Angular Decorator

Use the `@Siphon()` decorator to automatically unsubscribe properties (including arrays) on `ngOnDestroy`:

```typescript
import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Siphon } from 'subsiphon';

@Siphon({
    log: true,
    exclude: ['keepAlive']
})
@Component({
    selector: 'app-demo',
    template: `Check console for logs`,
})
export class DemoComponent implements OnInit {
    intervalSub?: Subscription;
    keepAlive?: Subscription;
    list: Subscription[] = [];

    ngOnInit(): void {
        this.intervalSub = interval(1000).subscribe(console.log);
        this.keepAlive = interval(4000).subscribe(console.log);

        this.list.push(
            interval(2000).subscribe(console.log),
            interval(3000).subscribe(console.log)
        );
    }

    ngOnDestroy(): void {
        console.log('Component destroyed');
    }
}
```

---

### RxJS `siphon` Pipe Operator

You can also use the `siphon()` pipe operator to auto-unsubscribe observables:

```typescript
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { siphon } from 'subsiphon';

@Component({
    selector: 'app-stream',
    template: `<p>Streaming...</p>`
})
export class StreamComponent implements OnInit {
    ngOnInit(): void {
        interval(1000)
            .pipe(siphon(this))
            .subscribe(val => console.log('Tick:', val));
    }

    ngOnDestroy(): void {
        console.log('Component destroyed');
    }
}
```

---

## Features

* Add subscriptions using numeric indexes or named keys.
* Auto-increment `add` setter to append subscriptions easily.
* `unsubscribe()` to stop all active subscriptions.
* `destroy()` to clear and reset all subscriptions.
* Decorator `@Siphon()` for automatic Angular lifecycle management.
* `siphon()` RxJS operator to simplify auto-unsubscription.

---

## API

### `createSubSiphon()`

Factory method to create a proxied `SubSiphon` instance:

```typescript
const siphon = createSubSiphon();
```

---

### Methods

* **`unsubscribe(): void`**

    * Unsubscribes from all active subscriptions.

* **`destroy(): void`**

    * Unsubscribes and clears all internal references (resets the container).

---

### Adding Subscriptions

#### Numeric

```typescript
siphon[0] = interval(1000).subscribe();
```

#### Auto Increment

```typescript
siphon.add = interval(500).subscribe(); // assigns to first free numeric index
```

#### Named Keys

```typescript
siphon.myStream = interval(2000).subscribe();
```

---

## Contributing

Pull requests and suggestions are welcome! Please file issues or submit PRs on [GitHub](https://github.com/shobeiry/subsiphon).

---

## License

Licensed under the [MIT License](https://github.com/shobeiry/subsiphon/blob/master/LICENSE).