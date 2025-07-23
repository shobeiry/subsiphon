# SubSiphon

[![npm version](https://img.shields.io/npm/v/subsiphon)](https://www.npmjs.com/package/subsiphon)
[![npm downloads](https://img.shields.io/npm/dm/subsiphon)](https://www.npmjs.com/package/subsiphon)
[![License](https://img.shields.io/npm/l/subsiphon)](https://github.com/shobeiry/subsiphon/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/shobeiry/subsiphon/branch/main/graph/badge.svg)](https://codecov.io/gh/shobeiry/subsiphon)


`SubSiphon` is a TypeScript helper class designed to help you manage multiple RxJS `Subscription` objects in an organized manner. It simplifies adding, accessing, and unsubscribing by combining the functionalities of arrays and objects through a Proxy.
## Installation

```bash
npm install subsiphon
```

## Usage Example

```typescript
import { Subscription, interval } from 'rxjs';
import { SubSiphon } from 'subsiphon';

const sub = new SubSiphon();

// Add subscriptions as array elements
sub.siphon = interval(1000).subscribe(val => console.log('Interval 1:', val));
sub.siphon[1] = interval(500).subscribe(val => console.log('Interval 2:', val));

// Add subscriptions as named properties
sub.siphon.myNamedSubscription = interval(1500).subscribe(val => console.log('Named Interval:', val));
sub.siphon["myNamedSubscription2"] = interval(2000).subscribe(val => console.log('Named Interval2:', val));

// Access subscriptions
console.log('Array of subscriptions:', sub.siphon);
console.log('First subscription:', sub.siphon[0]);
console.log('Named subscription:', sub.siphon.myNamedSubscription);

// Unsubscribe all objects
sub.unsubscribe();

// To completely destroy and clear all subscriptions:
sub.destroy();
```

### Angular Integration
You can use `SubSiphon` as a service:

```typescript
import { Injectable } from "@angular/core";
import { SubSiphon } from "subsiphon";

@Injectable()
export class SubSiphonService extends SubSiphon {
}
```

#### Siphon Decorator
You can use the `@Siphon()` decorator to automatically unsubscribe from properties (even arrays of subscriptions) when a component or service is destroyed:

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
  template: `Check console for log`,
})
export class DemoComponent implements OnInit {
  intervalSub?: Subscription;
  list: Subscription[] = [];
  keepAlive?: Subscription;

  ngOnInit(): void {
    this.intervalSub = interval(1000).subscribe(console.log);

    this.list.push(
      interval(2000).subscribe(val => console.log('A', val)),
      interval(3000).subscribe(val => console.log('B', val))
    );

    this.keepAlive = interval(4000).subscribe(val => console.log('KeepAlive', val));
  }

  ngOnDestroy(): void {
    console.log('Component destroyed');
  }
}

```

##### Decorator Options
```typescript
@Siphon(options?: {
  include?: string[];
  exclude?: string[];
  log?: boolean;
})
```
##### Behavior
- **include**: Only unsubscribe the listed properties.
- **exclude**: Exclude these properties from unsubscribing.
- **log**: Log each unsubscribed property to the console.
- **If** a property is an array, each element is checked for .unsubscribe() and handled accordingly.

#### siphon Pipe Operator

You can also use the `siphon()` RxJS operator in any stream inside Angular components or services. It automatically unsubscribes from the observable when the component is destroyed:
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
    console.log('StreamComponent destroyed');
  }
}

```

No need to manually manage a `destroy$` subject or call `unsubscribe()`.



## Features

`SubSiphon` offers a flexible way to manage your RxJS `Subscriptions`, allowing you to group and manipulate them in a way that makes sense for your application:

- ✅ Add subscriptions as array items or named properties.
- ✅ Uses a Proxy to manage and track all subscriptions internally.
- ✅ Warns you if non-Subscription objects are added.
- ✅ unsubscribe() to stop all active streams.
- ✅ destroy() to clear and reset all subscriptions.
- ✅ @Siphon() decorator to automatically unsubscribe on ngOnDestroy.
- ✅ Supports options to include/exclude specific keys, handle arrays of subscriptions, and enable logging.

## API
### Constructor
```typescript
sub = new SubSiphon()
```
Creates a new instance of `SubSiphon`.

### Properties
- `sub.siphon: Siphon` (setter/getter)

  - Setter: `sub.siphon = sub1: Subscription` - Adds a `Subscription` to the `SubSiphon`. A warning will be issued if `sub1` is not an instance of `Subscription`.
  - Getter: `sub.siphon: Siphon` - Returns a `Siphon` object, which is a combination of array-like and object-like subscriptions. This allows access to subscriptions by both index (e.g., `siphon.siphon[0]`) and by name (e.g., `siphon.siphon.mySub`).

### Methods
- `unsubscribe(): void`
  - Unsubscribes all active Subscriptions (those not yet `closed`) that have been added to the SubSiphon.
- `destroy(): void`
  - Unsubscribes all Subscriptions and then removes all references to them from the `SubSiphon`. This method effectively resets the `SubSiphon` to an empty state.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
