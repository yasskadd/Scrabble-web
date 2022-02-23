import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree, LetterTreeNode } from '@app/classes/trie/letter-tree.class';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

@Service()
export class WordSolverService {
    private crossCheckResults: Map<Coordinate, string[]> = new Map();
    constructor(private trie: LetterTree) {}

    printWord(word: string, lastPosition: Coordinate) {
        console.log(`Word found : ${word}`);
        const letterList = word.split('');
        let playPosition = lastPosition;
        let wordIndex = word.length - 1;
        const coordList: LetterTile[] = [];
        while (wordIndex >= 0) {
            const letterTile: LetterTile = new LetterTile(playPosition.x, playPosition.y, { value: letterList.pop() } as Letter);
            coordList.push(letterTile);
            wordIndex--;
            playPosition = { x: playPosition.x - 1, y: playPosition.y } as Coordinate;
        }
        coordList.reverse();
        // coordList.forEach((tile) => {
        //     console.log(tile);
        // });
    }

    findLeftPart(partialWord: string, currentNode: LetterTreeNode, anchor: Coordinate, rack: string[], gameboard: Gameboard, limit: number) {
        this.extendRight(partialWord, currentNode, rack, anchor, gameboard, false);
        if (limit > 0) {
            for (const nextLetter of currentNode.children.keys()) {
                if (rack.includes(nextLetter)) {
                    rack.splice(rack.indexOf(nextLetter), 1);
                    this.findLeftPart(
                        partialWord + nextLetter,
                        currentNode.children.get(nextLetter) as LetterTreeNode,
                        anchor,
                        rack,
                        gameboard,
                        limit - 1,
                    );
                    rack.push(nextLetter);
                }
            }
        }
    }

    // Recursive function
    extendRight(
        partialWord: string,
        currentNode: LetterTreeNode,
        rack: string[],
        nextPosition: Coordinate,
        gameboard: Gameboard,
        anchorFilled: boolean,
    ) {
        if (currentNode.isWord && !gameboard.getCoord(nextPosition).isOccupied && anchorFilled)
            this.printWord(partialWord, { x: nextPosition.x - 1, y: nextPosition.y });
        if (nextPosition.x <= 15 && nextPosition.y <= 15) {
            if (!gameboard.getCoord(nextPosition).isOccupied) {
                for (const nextLetter of currentNode.children.keys()) {
                    if (rack.includes(nextLetter) && this.crossCheckResults.get(gameboard.getCoord(nextPosition))?.includes(nextLetter)) {
                        // Remove letter from rack so it doesnt reuse it for the same word
                        rack.splice(rack.indexOf(nextLetter), 1);
                        // Recursion to get the next letter
                        this.extendRight(
                            partialWord + nextLetter,
                            currentNode.children.get(nextLetter) as LetterTreeNode,
                            rack,
                            {
                                x: nextPosition.x + 1,
                                y: nextPosition.y,
                            } as Coordinate,
                            gameboard,
                            true,
                        );
                        // re-add letter for next words
                        rack.push(nextLetter);
                    }
                }
            } else {
                const existingLetter: string = gameboard.getCoord(nextPosition).letter.value;
                if (currentNode.children.has(existingLetter)) {
                    this.extendRight(
                        partialWord + existingLetter,
                        currentNode.children.get(existingLetter) as LetterTreeNode,
                        rack,
                        {
                            x: nextPosition.x + 1,
                            y: nextPosition.y,
                        } as Coordinate,
                        gameboard,
                        true,
                    );
                }
            }
        }
    }

    crossCheck(gameboard: Gameboard) {
        const result: Map<Coordinate, string[]> = new Map();
        for (const position of gameboard.gameboardCoords) {
            if (!position.isOccupied) {
                let lettersUp = '';
                let scanPos = { x: position.x, y: position.y - 1 } as Coordinate;
                while (gameboard.getCoord(scanPos).isOccupied && Object.keys(gameboard.getCoord(scanPos)).length !== 0) {
                    lettersUp = gameboard.getCoord(scanPos).letter.value + lettersUp;
                    scanPos = { x: scanPos.x, y: scanPos.y - 1 };
                }
                let lettersDown = '';
                scanPos = { x: position.x, y: position.y + 1 } as Coordinate;
                while (gameboard.getCoord(scanPos).isOccupied && Object.keys(gameboard.getCoord(scanPos)).length !== 0) {
                    lettersDown = lettersDown + gameboard.getCoord(scanPos).letter.value;
                    scanPos = { x: scanPos.x, y: scanPos.y + 1 };
                }
                let legalHere: string[];
                if (lettersUp.length === 0 && lettersDown.length === 0) legalHere = 'abcdefghijklmnopqrstuvwxyz'.split('');
                else {
                    legalHere = [];
                    for (const letter of 'abcdefghijklmnopqrstuvwxyz'.split('')) {
                        if (this.trie.isWord(lettersUp + letter + lettersDown)) legalHere.push(letter);
                    }
                }
                result.set(position, legalHere);
            }
        }
        return result;
    }

    findAllOptions(gameboard: Gameboard, rack: string[]) {
        const anchors = gameboard.findAnchors();
        this.crossCheckResults = this.crossCheck(gameboard);
        for (const anchor of anchors) {
            // look to the left of that anchor
            if (gameboard.getCoord({ x: anchor.x - 1, y: anchor.y } as Coordinate).isOccupied) {
                // scan to the left
                let currentCoord = { x: anchor.x - 1, y: anchor.y } as Coordinate;
                let partialWord = '';
                while (gameboard.getCoord(currentCoord).isOccupied && Object.keys(gameboard.getCoord(currentCoord)).length !== 0) {
                    partialWord = gameboard.getCoord(currentCoord).letter.value + partialWord;
                    currentCoord = { x: currentCoord.x - 1, y: currentCoord.y };
                }
                const partialWordNode: LetterTreeNode | null = this.trie.lookUp(partialWord);
                if (partialWordNode !== null) this.extendRight(partialWord, partialWordNode, rack, anchor, gameboard, false);
            } else {
                let limit = 0;
                let scanPos = { x: anchor.x - 1, y: anchor.y };
                while (
                    !gameboard.getCoord(scanPos).isOccupied &&
                    Object.keys(gameboard.getCoord(scanPos)).length !== 0 &&
                    !anchors.includes(gameboard.getCoord(scanPos))
                ) {
                    scanPos = { x: scanPos.x - 1, y: scanPos.y } as Coordinate;
                    limit++;
                }
                this.findLeftPart('', this.trie.root, anchor, rack, gameboard, limit);
            }
        }
    }
}
