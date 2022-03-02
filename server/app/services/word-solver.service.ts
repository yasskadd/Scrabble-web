import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree, LetterTreeNode } from '@app/classes/trie/letter-tree.class';
import { CommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const ALPHABET_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;

@Service()
export class WordSolverService {
    private crossCheckResults: Map<Coordinate, string[]> = new Map();
    private isHorizontal: boolean;
    private index: number = 0;
    private commandInfoList: CommandInfo[] = new Array();
    constructor(private trie: LetterTree, private gameboard: Gameboard) {}

    findAllOptions(rack: string[]): CommandInfo[] {
        this.commandInfoList.length = 0;
        for (const direction of [true, false]) {
            this.isHorizontal = direction;
            const anchors = this.gameboard.findAnchors();
            this.crossCheckResults = this.crossCheck();
            for (const anchor of anchors) {
                const leftToAnchor: Coordinate | null = this.decrementCoord(anchor, this.isHorizontal);
                if (leftToAnchor === null) continue;
                if (this.gameboard.getCoord(leftToAnchor).isOccupied) {
                    const partialWord = this.buildPartialWord(leftToAnchor);
                    const partialWordNode: LetterTreeNode | null = this.trie.lookUp(partialWord);
                    if (partialWordNode !== null) this.extendRight(partialWord, partialWordNode, rack, anchor, false);
                } else this.findLeftPart('', this.trie.root, anchor, rack, this.getLimitNumber(leftToAnchor, anchors));
            }
        }
        console.log(this.commandInfoList.length);
        return this.commandInfoList;
    }

    private createCommandInfo(word: string, lastPosition: Coordinate) {
        console.log(`${this.index++} Word found : ${word}`);
        let playPosition = lastPosition;
        let wordIndex = word.length - 1;
        const coordList: Coordinate[] = [];
        let wordCopy = word.slice();
        const placedLetters: string[] = [];
        while (wordIndex >= 0) {
            if (!this.gameboard.getCoord(playPosition).isOccupied) {
                coordList.unshift(playPosition);
                placedLetters.unshift(wordCopy.slice(wordCopy.length - 1));
            }
            wordCopy = wordCopy.slice(0, -1);
            wordIndex--;
            playPosition = this.decrementCoord(playPosition, this.isHorizontal) as Coordinate;
        }
        const commandInfo: CommandInfo = {
            firstCoordinate: this.gameboard.getCoord(coordList[0]),
            direction: this.isHorizontal ? 'h' : 'v',
            lettersPlaced: placedLetters,
        };
        this.commandInfoList.push(commandInfo);
    }

    private findLeftPart(partialWord: string, currentNode: LetterTreeNode, anchor: Coordinate, rack: string[], limit: number) {
        this.extendRight(partialWord, currentNode, rack, anchor, false);
        if (limit > 0) {
            for (const nextLetter of currentNode.children.keys()) {
                if (rack.includes(nextLetter)) {
                    rack.splice(rack.indexOf(nextLetter), 1);
                    this.findLeftPart(partialWord + nextLetter, currentNode.children.get(nextLetter) as LetterTreeNode, anchor, rack, limit - 1);
                    rack.push(nextLetter);
                }
            }
        }
    }

    private extendRight(partialWord: string, currentNode: LetterTreeNode, rack: string[], nextPosition: Coordinate, anchorFilled: boolean) {
        if (currentNode.isWord && this.verifyConditions(nextPosition) && anchorFilled)
            this.createCommandInfo(partialWord, this.decrementCoord(nextPosition, this.isHorizontal) as Coordinate);
        if (nextPosition === null) return; // means that position is out of bounds
        if (!this.gameboard.getCoord(nextPosition).isOccupied) {
            for (const nextLetter of currentNode.children.keys()) {
                if (rack.includes(nextLetter) && this.crossCheckResults.get(this.gameboard.getCoord(nextPosition))?.includes(nextLetter)) {
                    rack.splice(rack.indexOf(nextLetter), 1); // remove to letter from the rack to avoid reusing it
                    const nextPos = this.isHorizontal ? { x: nextPosition.x + 1, y: nextPosition.y } : { x: nextPosition.x, y: nextPosition.y + 1 };
                    this.extendRight(partialWord + nextLetter, currentNode.children.get(nextLetter) as LetterTreeNode, rack, nextPos, true);
                    rack.push(nextLetter);
                }
            }
        } else {
            const existingLetter: string = this.gameboard.getCoord(nextPosition).letter.value;
            if (currentNode.children.has(existingLetter)) {
                const nextPos = this.isHorizontal ? { x: nextPosition.x + 1, y: nextPosition.y } : { x: nextPosition.x, y: nextPosition.y + 1 };
                this.extendRight(partialWord + existingLetter, currentNode.children.get(existingLetter) as LetterTreeNode, rack, nextPos, true);
            }
        }
    }

    private verifyConditions(nextPosition: Coordinate) {
        if (nextPosition.x > COLUMN_NUMBERS || nextPosition.y > ROW_NUMBERS) return true;
        if (!this.gameboard.getCoord(nextPosition).isOccupied) return true;
        return false;
    }

    private crossCheck(): Map<Coordinate, string[]> {
        const result: Map<Coordinate, string[]> = new Map();
        for (const position of this.gameboard.gameboardCoords) {
            if (!position.isOccupied) {
                let lettersUp = '';
                let scanPos = this.decrementCoord(position, !this.isHorizontal) as Coordinate;
                while (this.gameboard.getCoord(scanPos).isOccupied) {
                    lettersUp = this.gameboard.getCoord(scanPos).letter.value + lettersUp;
                    scanPos = this.decrementCoord(scanPos, !this.isHorizontal) as Coordinate;
                }
                let lettersDown = '';
                scanPos = this.incrementCoord(position, !this.isHorizontal) as Coordinate;
                while (this.gameboard.getCoord(scanPos).isOccupied) {
                    lettersDown = lettersDown + this.gameboard.getCoord(scanPos).letter.value;
                    scanPos = this.incrementCoord(scanPos, !this.isHorizontal) as Coordinate;
                }
                let legalHere: string[] = [];
                if (lettersUp.length === 0 && lettersDown.length === 0) legalHere = ALPHABET_LETTERS.split('');
                else for (const letter of ALPHABET_LETTERS.split('')) if (this.trie.isWord(lettersUp + letter + lettersDown)) legalHere.push(letter);
                result.set(position, legalHere);
            }
        }
        return result;
    }

    private getLimitNumber(startPosition: Coordinate, anchors: LetterTile[]): number {
        let limit = 0;
        while (!this.gameboard.getCoord(startPosition).isOccupied && !anchors.includes(this.gameboard.getCoord(startPosition))) {
            limit++;
            startPosition = this.decrementCoord(startPosition, this.isHorizontal) as Coordinate;
            if (startPosition === null) break;
        }
        return limit;
    }

    private buildPartialWord(scanCoord: Coordinate): string {
        let partialWord = '';
        while (this.gameboard.getCoord(scanCoord).isOccupied) {
            partialWord = this.gameboard.getCoord(scanCoord).letter.value + partialWord;
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
