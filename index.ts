enum Mode {
    Query,
    QueryAll,
}

type Children = Record<string, Schema>;

interface Schema {
    selector: [Mode, string];
    children?: Children;
}

function createElementProxy(element: Element, children: Children = {}): Element {
    return new Proxy(element, {
        get(target, prop) {
            if (typeof prop === 'string' && Object.keys(children).includes(prop)) {
                const child = children[prop];
                const [mode, selector] = child.selector;
                return resolveElement(element, mode, selector, child.children);
            }
            const value = Reflect.get(target, prop);
            if (typeof value === 'function') {
                return value.bind(target);
            }
            return value;
        },
    });
}

function resolveElement(scope: Element | Document, mode: Mode, selector: string, children?: Children): Element | Element[] {
    switch (mode) {
        case Mode.Query:
            const element = scope.querySelector(selector);
            if (!element) {
                throw new Error('Element not found');
            }
            return createElementProxy(element, children);
        case Mode.QueryAll:
            return Array.from(scope.querySelectorAll(selector)).map(element => {
                return createElementProxy(element, children);
            });
    }
}

function createElementResolver(mode: Mode, selector: string, children?: Children) {
    return function(scope?: Element): Element | Element[] {
        return resolveElement(scope ?? document, mode, selector, children);
    }
}

export function createPageObject(schema: Schema)  {
    const [mode, selector] = schema.selector;
    return new Proxy(createElementResolver(mode, selector, schema.children), {
        get(target, prop) {
            const children = schema.children ?? {};
            if (typeof prop === 'string' && Object.keys(children).includes(prop)) {
                const child = children[prop];
                const [mode, selector] = child.selector;
                return resolveElement(target() as Element, mode, selector, child.children);
            }
            return Reflect.get(target, prop);
        },
    });
}

export function query(selector: string, children: Children): Schema {
    return {
        selector: [Mode.Query, selector],
        children,
    };
}

export function queryAll(selector: string, children: Children): Schema {
    return {
        selector: [Mode.QueryAll, selector],
        children,
    };
}
