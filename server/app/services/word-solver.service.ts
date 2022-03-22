import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree, LetterTreeNode } from '@app/classes/trie/letter-tree.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Coordinate } from '@common/interfaces/coordinate';
import { Container, Service } from 'typedi';
import { DictionaryValidationService, ValidateWordReturn } from './dictionary-validation.service';

const ALPHABET_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;
const INDEX_NOT_FOUND = -1;
const LIMIT = 7;
// TODO: NEED 100% COVERAGE

// Temporary function, waiting for refactor.
@Service()
export class WordSolverService {
    private trie: LetterTree;
    private gameboard: Gameboard;
    private crossCheckResults: Map<Coordinate, string[]> = new Map();
    private isHorizontal: boolean;
    private commandInfoList: CommandInfo[] = new Array();

    constructor() {
        const dictionary = Container.get(DictionaryValidationService);
        this.trie = dictionary.trie;
    }

    setGameboard(gameboard: Gameboard) {
        this.gameboard = gameboard;
    }

    findAllOptions(rack: string[]): CommandInfo[] {
        this.commandInfoList.length = 0;
        for (const direction of [true, false]) {
            this.isHorizontal = direction;
            this.firstTurnOrEmpty(this.gameboard, rack);
            const anchors = this.gameboard.findAnchors();
            this.crossCheckResults = this.crossCheck();
            for (const anchor of anchors) {
                const leftToAnchor: Coordinate | null = this.decrementCoord(anchor.coordinate, this.isHorizontal);
                if (leftToAnchor === null) continue;
                if (this.gameboard.getLetterTile(leftToAnchor).isOccupied) {
                    const partialWord = this.buildPartialWord(leftToAnchor);
                    const partialWordNode: LetterTreeNode | null = this.trie.lookUp(partialWord);
                    if (partialWordNode !== null) {
                        this.extendRight(partialWord, partialWordNode, rack, anchor.coordinate, false);
                    }
                } else this.findLeftPart('', this.trie.root, anchor.coordinate, rack, this.getLimitNumber(leftToAnchor, anchors));
            }
        }
        return this.commandInfoList;
    }

    commandInfoScore(commandInfoList: CommandInfo[]): Map<CommandInfo, number> {
        const dictionaryService: DictionaryValidationService = Container.get(DictionaryValidationService);
        const commandInfoMap: Map<CommandInfo, number> = new Map();
        commandInfoList.forEach((commandInfo) => {
            const word = new Word(commandInfo, this.gameboard);
            this.placeLettersOnBoard(word, commandInfo);
            const placementScore: ValidateWordReturn = dictionaryService.validateWord(word, this.gameboard);
            commandInfoMap.set(commandInfo, placementScore.points);
            this.removeLetterFromBoard(word);
        });
        return commandInfoMap;
    }

    placeLettersOnBoard(word: Word, commandInfo: CommandInfo) {
        const commandLettersCopy = commandInfo.letters.slice();
        word.newLetterCoords.forEach((coord) => {
            this.gameboard.placeLetter(coord, commandLettersCopy[0]);
            if (commandLettersCopy[0] === commandLettersCopy[0].toUpperCase()) this.gameboard.getLetterTile(coord).points = 0;
            commandLettersCopy.shift();
        });
    }

    removeLetterFromBoard(word: Word) {
        word.newLetterCoords.forEach((coord) => {
            this.gameboard.removeLetter(coord);
        });
    }

    private createCommandInfo(word: string, lastPosition: Coordinate) {
        let wordIndex = word.length - 1;
        let wordCopy = word.slice();
        const placedLetters: string[] = [];
        let firstCoordinate: Coordinate = lastPosition;
        while (wordIndex >= 0) {
            if (!this.gameboard.getLetterTile(lastPosition).isOccupied) {
                firstCoordinate = lastPosition;
                placedLetters.unshift(wordCopy.slice(wordCopy.length - 1));
            }
            wordCopy = wordCopy.slice(0, INDEX_NOT_FOUND);
            wordIndex--;
            if (wordIndex >= 0) lastPosition = this.decrementCoord(lastPosition, this.isHorizontal) as Coordinate;
        }
        const commandInfo: CommandInfo = {
            firstCoordinate,
            isHorizontal: this.isHorizontal,
            letters: placedLetters,
        };
        this.commandInfoList.push(commandInfo);
    }

    private firstTurnOrEmpty(gameboard: Gameboard, rack: string[]) {
        if (!gameboard.findAnchors().length) {
            const anchor: Coordinate = { x: 8, y: 8 } as Coordinate;
            this.findLeftPart('', this.trie.root, anchor, rack, LIMIT);
        }
    }

    // Tested
    private findLeftPart(partialWord: string, currentNode: LetterTreeNode, anchor: Coordinate, rack: string[], limit: number) {
        this.extendRight(partialWord, currentNode, rack, anchor, false);
        if (limit > 0) {
            for (const nextLetter of currentNode.children.keys()) {
                const isBlankLetter: boolean = rack.includes('*') ? true : false;
                if (rack.includes(nextLetter) || isBlankLetter) {
                    const letterToRemove = rack.includes(nextLetter) ? nextLetter : '*';
                    const letter = letterToRemove === '*' ? nextLetter.toUpperCase() : nextLetter;
                    rack.splice(rack.indexOf(letterToRemove), 1);
                    this.findLeftPart(partialWord + letter, currentNode.children.get(nextLetter) as LetterTreeNode, anchor, rack, limit - 1);
                    rack.push(letterToRemove);
                }
            }
        }
    }

    // eslint-disable-next-line complexity
    private extendRight(partialWord: string, currentNode: LetterTreeNode, rack: string[], nextPosition: Coordinate, anchorFilled: boolean) {
        if (currentNode.isWord && this.verifyConditions(nextPosition) && anchorFilled)
            this.createCommandInfo(partialWord, this.decrementCoord(nextPosition, this.isHorizontal) as Coordinate);
        if (nextPosition === null) return; // means that position is out of bounds
        if (!this.gameboard.getLetterTile(nextPosition).isOccupied) {
            for (const nextLetter of currentNode.children.keys()) {
                const isBlankLetter: boolean = rack.includes('*') ? true : false;
                const crossCheckVerif = this.crossCheckResults.get(this.gameboard.getLetterTile(nextPosition).coordinate)?.includes(nextLetter);
                if ((rack.includes(nextLetter) || isBlankLetter) && crossCheckVerif) {
                    const letterToRemove = rack.includes(nextLetter) ? nextLetter : '*';
                    const letter = letterToRemove === '*' ? nextLetter.toUpperCase() : nextLetter;
                    rack.splice(rack.indexOf(letterToRemove), 1); // remove to letter from the rack to avoid reusing it
                    const nextPos = this.isHorizontal ? { x: nextPosition.x + 1, y: nextPosition.y } : { x: nextPosition.x, y: nextPosition.y + 1 };
                    this.extendRight(
                        partialWord + letter,
                        currentNode.children.get(nextLetter.toLocaleLowerCase()) as LetterTreeNode,
                        rack,
                        nextPos,
                        true,
                    );
                    rack.push(letterToRemove);
                }
            }
        } else {
            const existingLetter: string = this.gameboard.getLetterTile(nextPosition).letter;
            if (currentNode.children.has(existingLetter)) {
                const nextPos = this.isHorizontal ? { x: nextPosition.x + 1, y: nextPosition.y } : { x: nextPosition.x, y: nextPosition.y + 1 };
                this.extendRight(partialWord + existingLetter, currentNode.children.get(existingLetter) as LetterTreeNode, rack, nextPos, true);
            }
        }
    }

    private verifyConditions(nextPosition: Coordinate) {
        if (nextPosition.x > COLUMN_NUMBERS || nextPosition.y > ROW_NUMBERS) return true;
        if (!this.gameboard.getLetterTile(nextPosition).isOccupied) return true;
        return false;
    }

    private crossCheck(): Map<Coordinate, string[]> {
        const result: Map<Coordinate, string[]> = new Map();
        for (const letterTile of this.gameboard.gameboardTiles) {
            if (!letterTile.isOccupied) {
                const legalHere: string[] = this.findLettersThatCanBePlacedOnTile(letterTile.coordinate);
                result.set(letterTile.coordinate, legalHere);
            }
        }
        return result;
    }

    private findLettersThatCanBePlacedOnTile(letterTileCoord: Coordinate): string[] {
        let lettersUpwards: string = this.findLetters(letterTileCoord, true);
        let lettersDownwards: string = this.findLetters(letterTileCoord, false);
        return this.setLegalHere(lettersUpwards, lettersDownwards);
    }

    private findLetters(coord: Coordinate, isUp: boolean) {
        let letters: string = '';
        let scanPos = this.setScanPosition(coord, isUp);
        while (this.gameboard.getLetterTile(scanPos).isOccupied) {
            letters = this.addLettertoString(scanPos, letters, false);
            scanPos = this.setScanPosition(scanPos, false);
        }
        return letters;
    }

    private setScanPosition(coord: Coordinate, isUp: boolean): Coordinate {
        return isUp ? (this.decrementCoord(coord, !this.isHorizontal) as Coordinate) : (this.incrementCoord(coord, !this.isHorizontal) as Coordinate);
    }

    private addLettertoString(scanPos: Coordinate, letters: string, isUp: boolean): string {
        return isUp ? this.gameboard.getLetterTile(scanPos).letter + letters : letters + this.gameboard.getLetterTile(scanPos).letter;
    }

    private setLegalHere(lettersUpwards: string, lettersDownwards: string): string[] {
        return lettersUpwards.length === 0 && lettersDownwards.length === 0
            ? ALPHABET_LETTERS.split('')
            : (this.pushLetterToLegalHere(lettersUpwards, lettersDownwards) as string[]);
    }

    private pushLetterToLegalHere(lettersUpwards: string, lettersDownwards: string) {
        const legalHere: string[] = [];
        for (const letter of ALPHABET_LETTERS.split('')) if (this.trie.isWord(lettersUpwards + letter + lettersDownwards)) legalHere.push(letter);
        return legalHere;
    }

    private getLimitNumber(startPosition: Coordinate, anchors: LetterTile[]): number {
        let limit = 0;
        while (!this.gameboard.getLetterTile(startPosition).isOccupied && !anchors.includes(this.gameboard.getLetterTile(startPosition))) {
            limit++;
            startPosition = this.decrementCoord(startPosition, this.isHorizontal) as Coordinate;
            if (startPosition === null) break;
        }
        return limit;
    }

    private buildPartialWord(scanCoord: Coordinate): string {
        let partialWord = '';
        while (this.gameboard.getLetterTile(scanCoord).isOccupied) {
            partialWord = this.gameboard.getLetterTile(scanCoord).letter + partialWord;
            scanCoord = this.decrementCoord(scanCoord, this.isHorizontal) as Coordinate;
        }
        return partialWord;
    }

    private decrementCoord(coord: Coordinate, isHorizontal: boolean) {
        if (isHorizontal && coord.x !== 1) return { x: coord.x - 1, y: coord.y } as Coordinate;
        else if (!isHorizontal && coord.y !== 1) return { x: coord.x, y: coord.y - 1 } as Coordinate;
        return null;
    }

    private incrementCoord(coord: Coordinate, isHorizontal: boolean) {
        if (isHorizontal && coord.x !== COLUMN_NUMBERS) return { x: coord.x + 1, y: coord.y } as Coordinate;
        else if (!isHorizontal && coord.y !== ROW_NUMBERS) return { x: coord.x, y: coord.y + 1 } as Coordinate;
        return null;
    }
}
