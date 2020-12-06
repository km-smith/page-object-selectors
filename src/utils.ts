function isMode(mode: any): mode is Mode {
    const Query: Mode = 'Query';
    const QueryAll: Mode = 'QueryAll';
    return [Query, QueryAll].includes(mode);
}

function isSelector(selector: any): selector is Selector {
    return (
        Array.isArray(selector) &&
        isMode(selector[0]) &&
        typeof selector[1] === 'string'
    );
}

export function isSchema(schema: any): schema is Schema {
    return (
        typeof schema === 'object' &&
        isSelector(schema.selector) &&
        (schema.children === undefined || (typeof schema.children === 'object' && Object.values(schema.children).every(isSchema)))
    );
}
