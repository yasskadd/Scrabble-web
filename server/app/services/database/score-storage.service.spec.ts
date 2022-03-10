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
        score: 3,
    },
    {
        score: 600,
    },
    {
        score: 500000000,
    },
];

const TOP_SCORES_CLASSIC = [
    {
        username: 'Paul',
        type: 'Classique',
        score: 0,
        position: 1,
    },
    {
        username: 'MARC',
        type: 'Classique',
        score: 20,
        position: 2,
    },
    {
        username: 'Luc',
        type: 'Classique',
        score: 30,
        position: 3,
    },
    {
        username: 'Jean',
        type: 'Classique',
        score: 600,
        position: 4,
    },
    {
        username: 'Jules',
        type: 'Classique',
        score: 500000000,
        position: 5,
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
    it('getTopScoresPosition() should return the position of the score', () => {
        const TEST_SCORE = 100;
        const EXPECTED_POSTITION = 3;
        // eslint-disable-next-line dot-notation
        const scoresClassic = scoreStorageService['getTopScoresPosition'](TOP_SCORES, TEST_SCORE);
        // eslint-disable-next-line dot-notation
        expect(scoresClassic).to.be.deep.equal(EXPECTED_POSTITION);
    });

    it('isNameAlreadyThere() should return true if the position in the ranking already has the name of the player', () => {
        const PLAYER_NAME = 'Paul';
        // eslint-disable-next-line dot-notation
        const playerNameAlready = scoreStorageService['isNameAlreadyThere'](TOP_SCORES_CLASSIC[0].username, PLAYER_NAME);
        // eslint-disable-next-line dot-notation
        expect(playerNameAlready).to.be.deep.equal(true);
    });

    it('isNameAlreadyThere() should return false if the position in the ranking does not already has the name of the player', () => {
        const PLAYER_NAME = 'Paul';
        // eslint-disable-next-line dot-notation
        const playerNameAlready = scoreStorageService['isNameAlreadyThere'](TOP_SCORES_CLASSIC[1].username, PLAYER_NAME);
        // eslint-disable-next-line dot-notation
        expect(playerNameAlready).to.be.deep.equal(false);
    });
    it("populateDb() should populate the database if it's not populated", async () => {
        databaseServiceStub.fetchDocuments.resolves([]);
        databaseServiceStub.addDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['populateDb']();
        // eslint-disable-next-line dot-notation
        for (let i = 1; i < ScoreStorageService['lastElement']; i++) {
            expect(
                databaseServiceStub.addDocument.withArgs({ username: 'Tarnished', type: 'Classique', score: 0, position: i }).callCount,
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
    it("addTopScores() should replace a top score with the score info if it's legible ", async () => {
        const POSITION = 3;
        const scoreInfo = {
            username: 'Arararagi',
            type: 'Classique',
            score: 50,
        };
        Sinon.stub(scoreStorageService, 'populateDb' as never);
        const topScoresPositionStub = Sinon.stub(scoreStorageService, 'getTopScoresPosition' as never);
        topScoresPositionStub.returns(POSITION);
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES_CLASSIC);
        databaseServiceStub.replaceDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['addTopScores'](scoreInfo);
        // eslint-disable-next-line dot-notation
        expect(databaseServiceStub.replaceDocument.withArgs({ position: POSITION }, { ...scoreInfo, position: POSITION }).callCount).to.be.equal(1);
    });

    it('addTopScores() should add the name of the player if he has the same score of someone else ', async () => {
        const POSITION = 3;
        const scoreInfo = {
            username: 'Luc',
            type: 'Classique',
            score: 30,
        };
        const infoPlayer = {
            type: 'Classique',
            score: 30,
        };
        Sinon.stub(scoreStorageService, 'populateDb' as never);
        const topScoresPositionStub = Sinon.stub(scoreStorageService, 'getTopScoresPosition' as never);
        topScoresPositionStub.returns(POSITION);
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES_CLASSIC);
        databaseServiceStub.replaceDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['addTopScores'](scoreInfo);
        // eslint-disable-next-line dot-notation
        expect(
            databaseServiceStub.replaceDocument.withArgs(
                { position: POSITION },
                { ...infoPlayer, username: TOP_SCORES_CLASSIC[2].username + ' - ' + scoreInfo.username, position: POSITION },
            ).callCount,
        ).to.be.equal(0);
    });

    it('addTopScores() should not add the name of the player if he did already in the leaderboard at this position ', async () => {
        const POSITION = 3;
        const scoreInfo = {
            username: 'Paul',
            type: 'Classique',
            score: 30,
        };
        const infoPlayer = {
            type: 'Classique',
            score: 30,
        };
        Sinon.stub(scoreStorageService, 'populateDb' as never);
        const topScoresPositionStub = Sinon.stub(scoreStorageService, 'getTopScoresPosition' as never);
        topScoresPositionStub.returns(POSITION);
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES_CLASSIC);
        databaseServiceStub.replaceDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['addTopScores'](scoreInfo);
        // eslint-disable-next-line dot-notation
        expect(
            databaseServiceStub.replaceDocument.withArgs(
                { position: POSITION },
                { ...infoPlayer, username: TOP_SCORES_CLASSIC[2].username + ' - ' + scoreInfo.username, position: POSITION },
            ).callCount,
        ).to.be.equal(1);
    });
    it("addTopScores() shouldn't replace a top score with the score info if it's illegible ", async () => {
        const POSITION = 6;
        const scoreInfo = {
            username: 'HelloWorld',
            type: 'LOG2990',
            score: 300,
        };
        Sinon.stub(scoreStorageService, 'populateDb' as never);
        const topScoresPositionStub = Sinon.stub(scoreStorageService, 'getTopScoresPosition' as never);
        topScoresPositionStub.returns(POSITION);
        databaseServiceStub.fetchDocuments.resolves(TOP_SCORES);
        databaseServiceStub.replaceDocument.resolves();
        // eslint-disable-next-line dot-notation
        await scoreStorageService['addTopScores'](scoreInfo);
        // eslint-disable-next-line dot-notation
        expect(databaseServiceStub.replaceDocument.callCount).to.be.equal(0);
    });
});
