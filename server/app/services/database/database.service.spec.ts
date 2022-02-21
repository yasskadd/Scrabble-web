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
        // eslint-disable-next-line dot-notation
        DatabaseService['dbName'] = mongod.instanceInfo?.dbName as string;
        // eslint-disable-next-line dot-notation
        DatabaseService['dbUrl'] = mongod.getUri();
    });
    afterEach(async () => {
        await mongod.stop();
    });

    // TODO : add more tests if there's a need to

    it('the first connect() should connect to the server', async () => {
        // eslint-disable-next-line dot-notation
        await databaseService['connect']();
        // eslint-disable-next-line dot-notation
        expect(databaseService['isConnected']).to.be.equal(true);
    });
    it("connect() shouldn't change isConnected in case of no connection to the server", async () => {
        // eslint-disable-next-line dot-notation
        DatabaseService['dbName'] = '';
        // eslint-disable-next-line dot-notation
        DatabaseService['dbUrl'] = '';
        // eslint-disable-next-line dot-notation
        await databaseService['connect']();
        // eslint-disable-next-line dot-notation
        expect(databaseService['isConnected']).to.be.equal(false);
    });
    it('addDocument() should add a document to the collection', async () => {
        // eslint-disable-next-line dot-notation
        await databaseService['addDocument']({ tests: 'I hate tests', helloWorld: 'WorldHello' });
        // eslint-disable-next-line dot-notation
        const documentCount = await databaseService['collection'].countDocuments({});
        expect(documentCount).to.be.equal(1);
    });
    it('removeDocument() should remove a document from the collection', async () => {
        // eslint-disable-next-line dot-notation
        await databaseService['addDocument']({ tests: 'I hate tests', helloWorld: 'WorldHello' });
        // eslint-disable-next-line dot-notation
        const documentCount = await databaseService['collection'].countDocuments({});
        // eslint-disable-next-line dot-notation
        await databaseService['removeDocument']({ tests: 'I hate tests' });
        // eslint-disable-next-line dot-notation
        const currentCount = await databaseService['collection'].countDocuments({});
        expect(currentCount).to.be.equal(documentCount - 1);
    });
    it('resetDatabase() should remove all documents from the collection', async () => {
        // eslint-disable-next-line dot-notation
        await databaseService['addDocument']({ tests: 'I hate tests', helloWorld: 'WorldHello' });
        // eslint-disable-next-line dot-notation
        await databaseService['addDocument']({ tests: 'I hate 2 tests' });
        // eslint-disable-next-line dot-notation
        const documentCount = await databaseService['collection'].countDocuments({});
        expect(documentCount).to.be.equal(2);
        // eslint-disable-next-line dot-notation
        await databaseService['resetDatabase']();
        // eslint-disable-next-line dot-notation
        const currentCount = await databaseService['collection'].countDocuments({});
        expect(currentCount).to.be.equal(0);
    });
});
