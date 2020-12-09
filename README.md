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

describe('queryAll', () => {
    it('returns the expected root element', async () => {
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

More to come...