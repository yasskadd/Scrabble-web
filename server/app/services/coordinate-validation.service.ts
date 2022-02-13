// import { Gameboard } from '@app/classes/gameboard.class';
// import { PlacementCommandInfo } from '@app/command-info';
// import { Coordinate } from '@common/coordinate';
// import { Letter } from '@common/letter';
// import { LetterTile } from '@common/letter-tile.class';
// import { Service } from 'typedi';

// @Service()
// export class GameboardCoordinateValidationService {
//     validateGameboardCoordinate(commandInfo: PlacementCommandInfo, gameboard: Gameboard) {
//         // Validate firstCoord
//         if (!this.isFirstCoordValid(commandInfo.firstCoordinate, gameboard)) return [];

//         const coordOfLetters = new Array();
//         let stringLength: number = commandInfo.lettersPlaced.length;
//         const currentCoord: Coordinate = commandInfo.firstCoordinate.coordinate;
//         const direction = commandInfo.direction;
//         if (direction === 'h') {
//             while (stringLength !== 0) {
//                 if (Object.keys(gameboard.getLetterTile(currentCoord)).length === 0 || gameboard.getLetterTile(currentCoord) === undefined) return [];
//                 if (!gameboard.getLetterTile(currentCoord).isOccupied) {
//                     const letter = { stringChar: commandInfo.lettersPlaced.shift() as string } as Letter;
//                     coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
//                     stringLength--;
//                 }
//                 currentCoord.coordinate.x++;
//             }
//         } else if (direction === 'v') {
//             while (stringLength !== 0) {
//                 if (Object.keys(gameboard.getLetterTile(currentCoord)).length === 0 || gameboard.getLetterTile(currentCoord) === undefined) return [];
//                 if (!gameboard.getLetterTile(currentCoord).isOccupied) {
//                     const letter = { stringChar: commandInfo.lettersPlaced.shift() as string } as Letter;
//                     coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
//                     stringLength--;
//                 }
//                 currentCoord.y++;
//             }
//         } else {
//             const letter = { stringChar: commandInfo.lettersPlaced.shift() as string } as Letter;
//             coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
//         }
//         return coordOfLetters;
//     }
//     isFirstCoordValid(firstCoord: LetterTile, gameboard: Gameboard) {
//         if (Object.keys(gameboard.getLetterTile(firstCoord)).length === 0 || gameboard.getLetterTile(firstCoord) === undefined) return false;
//         return gameboard.getLetterTile(firstCoord).isOccupied ? false : true;
//     }
// }
