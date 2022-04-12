import { DatabaseCollection } from '@app/classes/database-collection.class';
import { Dictionary } from '@app/interfaces/dictionary';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { stub } from 'sinon';
import { DatabaseService } from './database.service';
import { DictionaryStorageService } from './dictionary-storage.service';

type CollectionStub = Sinon.SinonStubbedInstance<DatabaseCollection>;

const DICTIONARIES = [
    { title: 'Premier dictonnaire', description: 'Un dictionnaire', words: ['string'] },
    { title: 'Deuxième dictonnaire', description: 'Un dictionnaire', words: ['string'] },
    { title: 'Troisième dictonnaire', description: 'Un dictionnaire', words: ['string'] },
];

const DICTIONARIES_INFO = [
    { title: 'Premier dicitonnaire', description: 'Un dictionnaire' },
    { title: 'Deuxieme dicitonnaire', description: 'Un dictionnaire' },
    { title: 'Troisieme dicitonnaire', description: 'Un dictionnaire' },
];

const SELECTED_DICTIONARY = [{ title: 'Mon dictionnaire', description: 'Un dictionnaire' }];

describe('dictionaryStorage Service', () => {
    let databaseServiceStub: Sinon.SinonStubbedInstance<DatabaseService>;
    let dictionaryStorageService: DictionaryStorageService;

    beforeEach(async () => {
        databaseServiceStub = Sinon.createStubInstance(DatabaseService);
        databaseServiceStub.dictionaries = Sinon.createStubInstance(DatabaseCollection) as never;
        dictionaryStorageService = new DictionaryStorageService(databaseServiceStub as unknown as DatabaseService);
    });
    afterEach(async () => {
        Sinon.reset();
    });

    it('getAllDictionary() should return all the dictionaries from the database', async () => {
        (databaseServiceStub.dictionaries as unknown as CollectionStub).fetchDocuments.resolves(DICTIONARIES);
        const dictionaries = await dictionaryStorageService.getAllDictionary();
        expect(dictionaries).to.be.deep.equal(DICTIONARIES);
    });

    it('getAllDictionaryInfo() should return all the dictionaries title and description from the database', async () => {
        (databaseServiceStub.dictionaries as unknown as CollectionStub).fetchDocuments.resolves(DICTIONARIES_INFO);
        const dictionaries = await dictionaryStorageService.getAllDictionaryInfo();
        expect(dictionaries).to.be.deep.equal(DICTIONARIES_INFO);
    });

    it('selectDictionaryInfo() should return the dictionary with that match the title passed as param from the database', async () => {
        (databaseServiceStub.dictionaries as unknown as CollectionStub).fetchDocuments.resolves(SELECTED_DICTIONARY);
        const dictionary = await dictionaryStorageService.selectDictionaryInfo('Mon dictionnaire');
        expect(dictionary).to.be.deep.equal(SELECTED_DICTIONARY);
    });

    it('addDictionary() should not call addDocument of DatabaseService if dictionary to add is already in the database', async () => {
        const dictionaryIsInDbSpy = stub(dictionaryStorageService, 'dictionaryIsInDb');
        dictionaryIsInDbSpy.resolves(true);
        await dictionaryStorageService.addDictionary({} as Dictionary);
        expect((databaseServiceStub.dictionaries as unknown as CollectionStub).addDocument.called).to.equal(false);
    });

    it('addDictionary() should call addDocument of DatabaseService if dictionary to add is not in the database', async () => {
        const dictionaryIsInDbSpy = stub(dictionaryStorageService, 'dictionaryIsInDb');
        dictionaryIsInDbSpy.resolves(false);
        await dictionaryStorageService.addDictionary({} as Dictionary);
        expect((databaseServiceStub.dictionaries as unknown as CollectionStub).addDocument.called).to.equal(true);
        expect((databaseServiceStub.dictionaries as unknown as CollectionStub).addDocument.calledWith({} as Dictionary)).to.equal(true);
    });

    it('removeDictionary() should not call removeDocument of DatabaseService if dictionary to remove is not in the database', async () => {
        const dictionaryIsInDbSpy = stub(dictionaryStorageService, 'dictionaryIsInDb');
        dictionaryIsInDbSpy.resolves(false);
        await dictionaryStorageService.removeDictionary({} as Dictionary);
        expect((databaseServiceStub.dictionaries as unknown as CollectionStub).removeDocument.called).to.equal(false);
    });

    it('removeDictionary() should call removeDocument of DatabaseService if dictionary to remove is in the database', async () => {
        const dictionaryIsInDbSpy = stub(dictionaryStorageService, 'dictionaryIsInDb');
        dictionaryIsInDbSpy.resolves(true);
        await dictionaryStorageService.removeDictionary({ title: 'Mon dictionnaire' } as Dictionary);
        expect((databaseServiceStub.dictionaries as unknown as CollectionStub).removeDocument.called).to.equal(true);
        expect(
            (databaseServiceStub.dictionaries as unknown as CollectionStub).removeDocument.calledWith({ title: 'Mon dictionnaire' } as Dictionary),
        ).to.equal(true);
    });

    it('dictionaryIsInDb() should return true if dictionary title exist in the database', async () => {
        (databaseServiceStub.dictionaries as unknown as CollectionStub).fetchDocuments.resolves([DICTIONARIES[0]]);
        const dictionaryIsInDb = await dictionaryStorageService.dictionaryIsInDb(DICTIONARIES[0].title);
        expect(dictionaryIsInDb).to.equal(true);
    });

    it('dictionaryIsInDb() should return false if dictionary title does not exist in the database', async () => {
        (databaseServiceStub.dictionaries as unknown as CollectionStub).fetchDocuments.resolves([]);
        const dictionaryIsInDb = await dictionaryStorageService.dictionaryIsInDb('Mon dictionnaire');
        expect(dictionaryIsInDb).to.equal(false);
    });
});
