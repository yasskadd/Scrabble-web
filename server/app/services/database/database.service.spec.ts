/* eslint-disable dot-notation*/
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { DatabaseService } from './database.service';

describe('Database Service', () => {
    let databaseService: DatabaseService;
    let mongod: MongoMemoryServer;

    beforeEach(async () => {
        mongod = await MongoMemoryServer.create();
        mongod.start();
        databaseService = new DatabaseService();
        DatabaseService['dbName'] = mongod.instanceInfo?.dbName as string;
        DatabaseService['dbUrl'] = mongod.getUri();
    });

    afterEach(async () => {
        await mongod.stop();
    });

    it('the first connect() should connect to the server', async () => {
        await databaseService['connect']();
        expect(databaseService['isConnected']).to.be.equal(true);
    });

    it("connect() shouldn't change isConnected in case of no connection to the server", async () => {
        DatabaseService['dbName'] = '';
        DatabaseService['dbUrl'] = '';
        await databaseService['connect']();
        expect(databaseService['isConnected']).to.be.equal(false);
    });

    it('addDocument() should add a document to the collection', async () => {
        await databaseService['addDocument']({ tests: 'I hate tests', helloWorld: 'WorldHello' });

        const documentCount = await databaseService['collection'].countDocuments({});

        expect(documentCount).to.be.equal(1);
    });

    it('removeDocument() should remove a document from the collection', async () => {
        await databaseService['connect']();
        await databaseService['collection'].insertOne({ tests: 'I hate tests', helloWorld: 'WorldHello' });

        const documentCount = await databaseService['collection'].countDocuments({});

        await databaseService['removeDocument']({ tests: 'I hate tests' });

        const currentCount = await databaseService['collection'].countDocuments({});

        expect(currentCount).to.be.equal(documentCount - 1);
    });

    it('resetDatabase() should remove all documents from the collection', async () => {
        await databaseService['connect']();
        await databaseService['collection'].insertOne({ tests: 'I hate tests', helloWorld: 'WorldHello' });

        await databaseService['collection'].insertOne({ tests: 'I hate 2 tests' });

        const documentCount = await databaseService['collection'].countDocuments({});

        expect(documentCount).to.be.equal(2);
        await databaseService['resetDatabase']();
        const currentCount = await databaseService['collection'].countDocuments({});

        expect(currentCount).to.be.equal(0);
    });

    it('fetchDocuments() should return all documents with the correct parameters', async () => {
        const TEST_DOCUMENT = { tests: 'I hate tests', helloWorld: 'WorldHello' };
        await databaseService['connect']();
        await databaseService['collection'].insertOne(TEST_DOCUMENT);
        await databaseService['collection'].insertOne({ tests: 'I hate 2 tests' });

        const currentDocuments = await databaseService['fetchDocuments']({ tests: 'I hate tests' }, { projection: { tests: 1, _id: 0 } });

        expect(currentDocuments).to.be.deep.equal([{ tests: 'I hate tests' }]);
    });

    it('replaceDocument() should replace the correct document in the database', async () => {
        const TEST_DOCUMENT = { tests: 'I hate tests', helloWorld: 'WorldHello' };
        await databaseService['connect']();
        await databaseService['collection'].insertOne({ tests: 'I hate tests' });

        await databaseService['replaceDocument']({ tests: 'I hate tests' }, TEST_DOCUMENT);
        const currentDocuments = await databaseService['collection'].find({}, { projection: { _id: 0 } }).toArray();
        expect(currentDocuments).to.be.deep.equal([TEST_DOCUMENT]);
    });
});
