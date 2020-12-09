type Query = 'Query';
type QueryAll = 'QueryAll';
type Mode = Query | QueryAll;

type Children = Record<string, Schema>;
type Scope = [Mode, string];

interface Schema {
    scope: Scope;
    children?: Children;
}

interface PageObject {
    (el?: Element): Element | Element[]
}
