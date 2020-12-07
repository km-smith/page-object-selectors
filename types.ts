type Query = 'Query';
type QueryAll = 'QueryAll';
type Mode = Query | QueryAll;

type Children = Record<string, Schema>;
type Selector = [Mode, string];

interface Schema {
    selector: Selector;
    children?: Children;
}
