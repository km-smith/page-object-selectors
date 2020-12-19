import { expect, fixture, html } from '@open-wc/testing';
import { query, queryAll, createPageObject } from './index';

describe('query', () => {
    it('returns the expected schema with no children', async () => {
        const schema: Schema = query('.foo');
        expect(schema).to.eql({
            scope: ['Query', '.foo'],
            children: undefined,
        });
    });

    it('returns the expected schema with children', async () => {
        const schema: Schema = query('.foo', {
            biz: query('.biz'),
        });
        expect(schema).to.eql({
            scope: ['Query', '.foo'],
            children: {
                biz: {
                    scope: ['Query', '.biz'],
                    children: undefined
                }
            },
        });
    });

    it('returns the expected schema while overriding an existing schema', async () => {
        const wrapped: Schema = queryAll('.foo', {
            biz: queryAll('.biz'),
        });
        const schema: Schema = query(wrapped);
        expect(schema).to.eql({
            scope: ['Query', '.foo'],
            children: {
                biz: {
                    scope: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });

    it('returns the expected schema while overriding an existing scope and schema', async () => {
        const wrapped: Schema = queryAll('.foo', {
            biz: queryAll('.biz'),
        });
        const schema: Schema = query('.buz', wrapped);
        expect(schema).to.eql({
            scope: ['Query', '.buz'],
            children: {
                biz: {
                    scope: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });
});

describe('queryAll', () => {
    it('returns the expected schema with no children', async () => {
        const schema: Schema = queryAll('.foo');
        expect(schema).to.eql({
            scope: ['QueryAll', '.foo'],
            children: undefined,
        });
    });

    it('returns the expected schema with children', async () => {
        const schema: Schema = queryAll('.foo', {
            biz: queryAll('.biz'),
        });
        expect(schema).to.eql({
            scope: ['QueryAll', '.foo'],
            children: {
                biz: {
                    scope: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });

    it('returns the expected schema while overriding an existing schema', async () => {
        const wrapped: Schema = query('.foo', {
            biz: queryAll('.biz'),
        });
        const schema: Schema = queryAll(wrapped);
        expect(schema).to.eql({
            scope: ['QueryAll', '.foo'],
            children: {
                biz: {
                    scope: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });

    it('returns the expected schema while overriding an existing scope and schema', async () => {
        const wrapped: Schema = query('.foo', {
            biz: queryAll('.biz'),
        });
        const schema: Schema = queryAll('.buz', wrapped);
        expect(schema).to.eql({
            scope: ['QueryAll', '.buz'],
            children: {
                biz: {
                    scope: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });
});

describe('query', () => {
    it('returns the expected root element', async () => {
        await fixture(html`
            <div>
                <div class="foo">Foo</div>
            </div>
        `);
        const schema = query('.foo');
        const pageObject = createPageObject(schema);
        expect((pageObject() as Element).textContent).to.equal('Foo');
    });

    it('returns undefined when it cant find the root element', async () => {
        await fixture(html`
            <div>
                <div class="foo">Foo</div>
            </div>
        `);
        const schema = query('.wont-find-me');
        const pageObject = createPageObject(schema);
        expect(pageObject()).to.equal(undefined);
    });

    it('returns the expected child element', async () => {
        await fixture(html`
            <div>
                <div class="foo">
                    <div class="biz">This</div>
                </div>
                <div class="biz">Not this</div>
            </div>
        `);
        const schema = query('.foo', {
            biz: query('.biz'),
            wontFindMe: query('.wont-find-me'),
        });
        const pageObject = createPageObject(schema);
        // @ts-ignore
        expect(pageObject.biz.textContent).to.equal('This');
        // @ts-ignore
        expect(pageObject.wontFindMe).to.equal(undefined);
    });
});

describe('queryAll', () => {
    it('returns the expected root element', async () => {
        await fixture(html`
            <div>
                <div class="foo">One</div>
                <div class="foo">Two</div>
            </div>
        `);
        const schema = queryAll('.foo');
        const pageObject = createPageObject(schema);
        expect((pageObject() as Element[]).length).to.equal(2);
        expect((pageObject() as Element[])[0].textContent).to.equal('One');
        expect((pageObject() as Element[])[1].textContent).to.equal('Two');
    });

    it('returns undefined when it cant find the root element', async () => {
        await fixture(html`
            <div>
                <div class="foo">One</div>
                <div class="foo">Two</div>
            </div>
        `);
        const schema = queryAll('.wont-find-me');
        const pageObject = createPageObject(schema);
        expect(pageObject()).to.equal(undefined);
    });

    it('returns the expected child element', async () => {
        await fixture(html`
            <div>
                <div class="foo">
                    <div class="biz">One</div>
                    <div class="biz">Two</div>
                </div>
                <div class="foo">
                    <div class="biz">Three</div>
                    <div class="biz">Four</div>
                </div>
                <div class="biz">Five</div>
                <div class="biz">Six</div>
            </div>
        `);
        const schema = queryAll('.foo', {
            biz: queryAll('.biz'),
            wontFindMe: queryAll('.wont-find-me'),
        });
        const pageObject = createPageObject(schema);
        // @ts-ignore
        expect(pageObject().length).to.equal(2);
        // @ts-ignore
        expect(pageObject()[0].biz.length).to.equal(2);
        // @ts-ignore
        expect(pageObject()[0].biz[0].textContent).to.equal('One');
        // @ts-ignore
        expect(pageObject()[0].biz[1].textContent).to.equal('Two');
        // @ts-ignore
        expect(pageObject()[1].biz.length).to.equal(2);
        // @ts-ignore
        expect(pageObject()[1].biz[0].textContent).to.equal('Three');
        // @ts-ignore
        expect(pageObject()[1].biz[1].textContent).to.equal('Four');
        // @ts-ignore
        expect(pageObject().wontFindMe).to.equal(undefined);
    });
});
