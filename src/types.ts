type Query = 'Query';
type QueryAll = 'QueryAll';
type Mode = Query | QueryAll;
type Children = Record<string, Schema>;
type Scope = [Mode, string];
type QueryResult = undefined | Element | Element[];

interface Schema {
    scope: Scope;
    children?: Children;
}

interface PageObject {
    (el?: Element): QueryResult;
}
