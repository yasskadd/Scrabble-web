import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { DatabaseService } from './database.service';

describe.only('Database Service', () => {
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

    // it('the first connect() should connect to the server', async () => {
    //     // eslint-disable-next-line dot-notation
    //     databaseService['addDocument']({ godOfWar: 'kratos' });
    //     // eslint-disable-next-line dot-notation
    //     expect(databaseService['collection'] !== undefined).to.be.equal(true);
    // });
});
