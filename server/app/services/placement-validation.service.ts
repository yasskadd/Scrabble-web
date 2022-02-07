/* eslint-disable prettier/prettier */

import { Coordinate } from 'app/classes/coordinate.class';
import { Letter } from 'app/letter';
import { Service } from 'typedi';
import { GameBoard } from './gameboard.service';

@Service()
export class PlacementValidationService {
    // Logic : after a player's turn, verify if the letters placed by the user respect Scrabble rules
    // letters placed need all to be in the same line or same column
    //

    validatePlacement(lettersPlaced: string[], firstCoord: Coordinate, direction: string, gameboard: GameBoard) {
        // Validate firstCoord
        if (!this.isFirstCoordValid(firstCoord, gameboard)) {
            return { isValid: false, coordList: null };
        }
        // verify if out of bounds
        let stringLength: number = lettersPlaced.length;
        let currentCoord: Coordinate = gameboard.getCoord(firstCoord);
        const coordList : Coordinate[] = [];
        switch (direction) {
            case 'h':
                while (stringLength !== 0) {
                    if (!gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                        stringLength--;
                        const x: number = currentCoord.x;
                        const y: number = currentCoord.y;
                        const letter : Letter = {}
                        currentCoord = new Coordinate(x+1, y, new Letter());
                        coordList.push(
                    }
                    if (currentCoord.x > 14) {
                        return false;
                    }
                }
                break;
            case 'v':
                while (stringLength !== 0) {
                    if (!gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                        stringLength--;
                        const x: number = currentCoord.x;
                        const y: number = currentCoord.y;
                        currentCoord = new Coordinate(x, y + 1);
                    }
                    if (currentCoord.x > 14) {
                        return false;
                    }
                }
                break;
            case '':
                if (gameboard.getCoord(currentCoord).isOccupied) {
                    return false;
                }
        }
    }

    isFirstCoordValid(firstCoord: Coordinate, gameboard: GameBoard) {
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }