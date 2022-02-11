// import { GameBoard } from '@app/classes/gameboard.class';
// import { Player } from '@app/classes/player';
// import { PlacementCommandInfo } from '@app/command-info';
// import { Coordinate } from '@app/coordinate';
// import { Letter } from '@common/letter';
// import { expect } from 'chai';
// import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import { LetterPlacementService } from './letter-placement.service';
// import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class'

// describe.only('Letter Placement Service', () => {
//     let player: Player;
//     let commandInfo: PlacementCommandInfo;
//     let letterA: Letter;
//     let letterB: Letter;
//     let gameboard: SinonStubbedInstance<GameBoard>;
//     let placementService: LetterPlacementService;

//     beforeEach(() => {
//         letterA = { stringChar: 'a', points: 1 } as Letter;
//         letterB = { stringChar: 'b', points: 2 } as Letter;

//         player = { rack: [letterA, letterB], score: 0, name: 'test', room: 'testRoom' };
//         commandInfo = {
//             firstCoordinate: { x: 0, y: 0 } as Coordinate,
//             direction: 'h',
//             lettersPlaced: ['a', 'l', 'l'],
//         } as PlacementCommandInfo;

//         gameboard = createStubInstance(GameBoard);
//         placementService = new LetterPlacementService();
//     });

//     it('should return deep copy of playerRack', () => {
//         const copyRack = placementService['createTempRack'](player);
//         expect(copyRack).to.not.equal(player.rack);
//         expect(copyRack).to.deep.equal(player.rack);
//     });

//     context('associateLettersWithRack() should...', () => {
//         let letterC: Letter;
//         beforeEach(() => {
//             letterC = { stringChar: 'c', points: 3 } as Letter;

//         });

//         it('return a list of letter', () => {
//             const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//             expect(placementService['associateLettersWithRack'](letters, player).length).to.eql(letters.length);
//         });

//         it('return empty list if letters are not in the rack', () => {
//             const letters : GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
//             expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
//         });

//         it('return empty list if not every letters match the rack', () => {
//             const letters : GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
//             expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
//         });
//     });
// });
