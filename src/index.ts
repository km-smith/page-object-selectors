import { isSchema } from './utils';

function createElementProxy(element: Element, children: Children = {}): Element {
    return new Proxy(element, {
        get(target, prop) {
            if (typeof prop === 'string' && Object.keys(children).includes(prop)) {
                const child = children[prop];
                const [mode, selector] = child.scope;
                return resolveElement(element, mode, selector, child.children);
            }
            const value = Reflect.get(target, prop);
            if (typeof value === 'function') {
                return value.bind(target);
            }
            return value;
        },
        set(target: Element, prop: string, value: any) {
            return Reflect.set(target, prop, value);
        }
    });
}

function resolveElement(el: Element, mode: Mode, selector: string, children?: Children): QueryResult {
    switch (mode) {
        case 'Query':
            const element = el.querySelector(selector);
            if (!element) {
                return undefined;
            }
            return createElementProxy(element, children);
        case 'QueryAll':
            return Array.from(el.querySelectorAll(selector)).map(element => {
                return createElementProxy(element, children);
            });
    }
}


function createElementResolver(mode: Mode, selector: string, children?: Children) {
    return function(el?: Element): QueryResult {
        return resolveElement(el ?? document.body, mode, selector, children);
    }
}

export function createPageObject(schema: Schema): PageObject  {
    const [mode, selector] = schema.scope;
    return new Proxy(createElementResolver(mode, selector, schema.children), {
        get(target, prop) {
            const children = schema.children ?? {};
            if (typeof prop === 'string' && Object.keys(children).includes(prop)) {
                const child = children[prop];
                const [mode, selector] = child.scope;
                return resolveElement(target() as Element, mode, selector, child.children);
            }
            return Reflect.get(target, prop);
        },
    });
}

export function query(scope: string | Schema, children?: Children | Schema): Schema {
    if (isSchema(scope)) {
        const schema: Schema = scope;
        const selector = schema.scope[1];
        return {
            scope: ['Query', selector],
            children: schema.children,
        };
    }

    if (isSchema(children)) {
        const schema: Schema = children;
        return {
            scope: ['Query', scope],
            children: schema.children,
        };
    }

    return {
        scope: ['Query', scope],
        children,
    };
}

export function queryAll(scope: string | Schema, children?: Children | Schema): Schema {
    if (isSchema(scope)) {
        const schema: Schema = scope;
        return {
            scope: ['QueryAll', schema.scope[1]],
            children: schema.children,
        };
    }

    if (isSchema(children)) {
        const schema: Schema = children;
        return {
            scope: ['QueryAll', scope],
            children: schema.children,
        };
    }

    return {
        scope: ['QueryAll', scope],
        children,
    };
}
