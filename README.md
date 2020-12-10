# Page Object Selectors
Page object selectors is a small, focused library used to model a web app's UI to provide a clean interface for test code. 

## Installation
```text
yarn add --dev @kysmith/page-object-selectors
```

## Basic usage
Creating a page object is a two-step process. The first step involves generating a consumable schema using `query` and `queryAll`. In the second step the schema is passed to `createPageObject` to generate the final page object.

```html
<div class="my-component">
    <header class="header">
        <h1 class="title">Hello</h1>
    </header>
</div>
```

```javascript
import { query, createPageObject } from '@kysmith/page-object-selectors';

export const myComponent = query('.my-component', {
    header: query('.header', {
        title: query('.title'),
    }),
});

export const pageObject = createPageObject(myComponent);
```
Now that we have the page object created we can use it in some test code. Beware, pseudo code incoming...
```javascript
import { pageObject } from '../pages/components/my-component';

describe('my-component', () => {
    it('has the expected title', async () => {
        render(`<MyComponent />`);
        expect(pageObject.header.title.textContent).to.equal('Hello');
    });
});
```
### So what just happened?
The page object is a Proxy that tracks property lookups. As the lookups occur, the page object checks with the schema and queries the DOM to retrieve elements matching the defined selectors. The resulting element(s) are each wrapped in a Proxy.  The proxy detects property lookups corresponding to keys at the appropriate level in the schema and performs further DOM queries. This process is recursive and can repeat as deep as desired to model any UI. Taking a closer look at the test example above, the magic line is:
```
expect(pageObject.header.title.textContent).to.equal('Hello');
```
Taking it step-by-step, this is how the statement inside the `expect` function works. Executing the `pageObject.header.title.textContent` statement queries the DOM (`document.body` as the root element) using `querySelector` with the selector `.my-component.` The resulting element (`<div class="my-component">`) is now the new root element. A second query using `querySelector` with the selector `.header` retrieves the header element (`<header class="header">`) and sets it as the new root element. A third query using `querySelector` with the selector `.title` retrieves the title element (`<h1 class="title">Hello</h1>`) and sets it as the new root element. When the property lookup for `textContent` happens, it does not match any properties inside the schema.
When that occurs, the lookup is reflected on the current root element. As a result, the string `"Hello"` is the result, and the test passes.

### Accessing the root element
To get the root element (`<div class="my-component">`), call the page object as a function.

```javascript
import { pageObject } from '../pages/components/my-component';

describe('my-component', () => {
    it('passes render smoke test', async () => {
        render(`<MyComponent />`);
        expect(pageObject()).to.be.visible;
    });
});
```

## Composing page objects
In most modern web frameworks, components are widely used as the primary way UI code is reused across an application. Page objects pair nicely with this model because you can model each component once and compose the page object with other page objects exactly the same way components work. Let's look at an example:

```html
<!-- components/contact-card -->
<div class="contact-card">
    <p class="name">{name}</p>
</div>
```

```html
<!-- components/my-contacts -->
<ul class="my-contacts">
    <li>
        <ContactCard name="Eva" />
    </li>
    <li>
        <ContactCard name="Marry" />
    </li>
    <li>
        <ContactCard name="Bob" />
    </li>
</ul>
```
We have two components `contact-card` and `my-contacts`. The `contact-card` component is used in `my-contacts` a few times. We could model these components as such.

```javascript
// pages/components/contact-card.js
import { query, createPageObject } from '@kysmith/page-object-selectors';

export const contactCard = query('.contact-card', {
    name: query('.name'),
});

export const pageObject = createPageObject(contactCard);
```

```javascript
// pages/components/my-contacts.js
import { query, queryAll, createPageObject } from '@kysmith/page-object-selectors';
import { contactCard } from './contact-card';

export const myContacts = query('.my-contacts', {
    cards: queryAll(contactCard),
});

export const pageObject = createPageObject(myContacts);
```
Then in the test for `my-contacts` we can leverage the existing page object for `contact-card`. 
```javascript
import { pageObject } from '../pages/components/my-contacts';

describe('my-component', () => {
    it('passes render smoke test', async () => {
        render(`<MyContacts />`);
        expect(pageObject.cards.lenght).to.equal(3);
        expect(pageObject.cards[0].name.textContent).to.equal('Eva');
        expect(pageObject.cards[1].name.textContent).to.equal('Marry');
        expect(pageObject.cards[2].name.textContent).to.equal('Bob');
    });
});
```

## Creating the schema
There are two supported methods, `query` and `queryAll`, which perform either a querySelector or querySelectorAll to find elements in the DOM. Any selector supported by querySelector or querySelectorAll can be used. The interfaces for `query` and `queryAll` are the same and can be called in the following ways:

```javascript
// No children
query('.my-component')
```

```javascript
// With children
query('.my-selector', {
    foo: query('.foo'),
});
```

```javascript
// Convert between query/queryAll
const card = query('.card', {
    title: query('.title'),
});
queryAll(card);
```

```javascript
// Convert between query/queryAll and override the selector
const card = query('.card', {
    title: query('.title'),
});
queryAll('.left-sidebar-cards', card);
```
