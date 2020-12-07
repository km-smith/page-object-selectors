import { expect, fixture, html } from '@open-wc/testing';
import { query, queryAll, createPageObject } from './index';

describe('query', () => {
    it('returns the expected schema with no children', async () => {
        const schema: Schema = query('.foo');
        expect(schema).to.eql({
            selector: ['Query', '.foo'],
            children: undefined,
        });
    });

    it('returns the expected schema with children', async () => {
        const schema: Schema = query('.foo', {
            biz: query('.biz'),
        });
        expect(schema).to.eql({
            selector: ['Query', '.foo'],
            children: {
                biz: {
                    selector: ['Query', '.biz'],
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
            selector: ['QueryAll', '.foo'],
            children: undefined,
        });
    });

    it('returns the expected schema with children', async () => {
        const schema: Schema = queryAll('.foo', {
            biz: queryAll('.biz'),
        });
        expect(schema).to.eql({
            selector: ['QueryAll', '.foo'],
            children: {
                biz: {
                    selector: ['QueryAll', '.biz'],
                    children: undefined
                }
            },
        });
    });
});
