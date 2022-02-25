import { expect } from 'chai';
import * as Sinon from 'sinon';
import { DatabaseService } from './database.service';
import { ScoreStorageService } from './score-storage.service';

const TOP_SCORES = [
    {
        score: 0,
    },
    {
        score: -5,
    },
    {
        score: 15,
    },
    {
        score: 3,
    },
    {
        score: 500000000,
    },
    {
        score: 600,
    },
];

describe('scoreStorage Service', () => {
    let databaseServiceStub: Sinon.SinonStubbedInstance<DatabaseService>;
    let scoreStorageService: ScoreStorageService;

    beforeEach(async () => {
        databaseServiceStub = Sinon.createStubInstance(DatabaseService);
        scoreStorageService = new ScoreStorageService(databaseServiceStub as unknown as DatabaseService);
    });
    afterEach(async () => {
        Sinon.reset();
    });

    it('getLOG2990TopScores() should return the LOG2990 top scores from the database', async () => {
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES);
        const scoresLOG2990 = await scoreStorageService.getLOG2990TopScores();
        // eslint-disable-next-line dot-notation
        expect(scoresLOG2990).to.be.deep.equal(TOP_SCORES);
    });
    it('getClassicTopScores() should return the classic top scores from the database', async () => {
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES);
        const scoresClassic = await scoreStorageService.getClassicTopScores();
        // eslint-disable-next-line dot-notation
        expect(scoresClassic).to.be.deep.equal(TOP_SCORES);
    });
    it('getTopScoresPosition() should return the position of the score', async () => {
        const TEST_SCORE = 100;
        const EXPECTED_POSTITION = 3;
        // eslint-disable-next-line dot-notation
        const scoresClassic = scoreStorageService['getTopScoresPosition'](TOP_SCORES, TEST_SCORE);
        // eslint-disable-next-line dot-notation
        expect(scoresClassic).to.be.deep.equal(EXPECTED_POSTITION);
    });
    it("populateDb() should populate the database if it's not populated", async () => {
        databaseServiceStub.fetchDocuments.resolves([]);
        databaseServiceStub.addDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['populateDb']();
        // eslint-disable-next-line dot-notation
        for (let i = 1; i < ScoreStorageService['lastElement']; i++) {
            expect(
                databaseServiceStub.addDocument.withArgs({ username: 'Arararararagi', type: 'Classique', score: 0, position: i }).callCount,
            ).to.be.equal(1);
            expect(databaseServiceStub.addDocument.withArgs({ username: 'EldenLord', type: 'LOG2990', score: 0, position: i }).callCount).to.be.equal(
                1,
            );
        }
    });
    it("populateDb() shouldn't populate the database if it's already populated", async () => {
        databaseServiceStub.fetchDocuments.resolves([{}, {}]);
        databaseServiceStub.addDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['populateDb']();
        // eslint-disable-next-line dot-notation
        expect(databaseServiceStub.addDocument.called).to.be.equal(false);
    });
});
