# SubSiphon

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

It can also be used as a service in Angular, like the code below:

```typescript
import {Injectable} from '@angular/core';

@Injectable()
export class SubSiphonService extends SubSiphon {
}
```

## Features

`SubSiphon` offers a flexible way to manage your RxJS `Subscriptions`, allowing you to group and manipulate them in a way that makes sense for your application:

- Array and Object Management: You can add `Subscriptions` both as array elements (using `siphon.siphon = sub`) and as named properties (like `siphon.siphon.mySub = sub`).
- Internal Proxy: `SubSiphon` uses a Proxy to transparently manage the addition and access of `Subscriptions`.
- Non-Subscription Value Warning: If you attempt to add a non-Subscription value, a warning message will be logged to the console.
- `unsubscribe()`: This method unsubscribes all added `Subscriptions`, stopping their data streams.
- `destroy()`: In addition to unsubscribing, this method removes all `Subscriptions` from the `SubSiphon`, returning it to its initial state.

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
