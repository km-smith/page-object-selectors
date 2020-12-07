import { isSchema } from './utils';

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

function resolveElement(scope: Element, mode: Mode, selector: string, children?: Children): Element | Element[] {
    switch (mode) {
        case 'Query':
            const element = scope.querySelector(selector);
            if (!element) {
                throw new Error('Element not found');
            }
            return createElementProxy(element, children);
        case 'QueryAll':
            return Array.from(scope.querySelectorAll(selector)).map(element => {
                return createElementProxy(element, children);
            });
    }
}

function createElementResolver(mode: Mode, selector: string, children?: Children) {
    return function(scope?: Element): Element | Element[] {
        return resolveElement(scope ?? document.body, mode, selector, children);
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

export function query(schema: string | Schema, children?: Children): Schema {
    if (isSchema(schema)) {
        return {
            ...schema,
            selector: ['Query', schema.selector[1]],
        };
    }

    return {
        selector: ['Query', schema],
        children,
    };
}

export function queryAll(schema: string | Schema, children?: Children): Schema {
    if (isSchema(schema)) {
        return {
            ...schema,
            selector: ['QueryAll', schema.selector[1]],
        };
    }

    return {
        selector: ['QueryAll', schema],
        children,
    };
}
