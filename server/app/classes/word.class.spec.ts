import { expect } from 'chai';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';

describe('Word', () => {
    let gameboard: Gameboard;
    let word: Word;

    beforeEach(async () => {
        gameboard = new Gameboard();
    });

    describe('Constructor tests', () => {
        describe('setAttributes should build word with string abc if all placedLetters form abc and word is horizontal', () => {
            beforeEach(async () => {
                word = new Word(
                    {
                        firstCoordinate: { x: 1, y: 1 },
                        isHorizontal: true,
                        letters: ['a', 'b', 'c'],
                    },
                    gameboard,
                );
            });

            it('setAttributes should build word with string abc', () => expect(word.stringFormat).to.eql('abc'));
            it('setAttributes should build word with isHorizontal as true', () => expect(word.isHorizontal).to.be.true);
            it('setAttributes should build word with correct newLetterCoords', () =>
                expect(word.newLetterCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ]));
            it('setAttributes should build word with correct wordCoords', () =>
                expect(word.wordCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ]));
        });

        describe('setAttributes should build word with string abc if all placedLetters form abc and word is vertical', () => {
            beforeEach(async () => {
                word = new Word(
                    {
                        firstCoordinate: { x: 1, y: 1 },
                        isHorizontal: false,
                        letters: ['a', 'b', 'c'],
                    },
                    gameboard,
                );
            });

            it('setAttributes should build word with string abc', () => expect(word.stringFormat).to.eql('abc'));
            it('setAttributes should build word with isHorizontal as true', () => expect(word.isHorizontal).to.be.false);
            it('setAttributes should build word with correct newLetterCoords', () =>
                expect(word.newLetterCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                ]));
            it('setAttributes should build word with correct wordCoords', () =>
                expect(word.wordCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                ]));
        });

        describe('setAttributes should build string abc if only a,b are the placedLetters and word is horizontal', () => {
            beforeEach(async () => {
                gameboard.placeLetter({ x: 3, y: 1 }, 'c');
                word = new Word(
                    {
                        firstCoordinate: { x: 1, y: 1 },
                        isHorizontal: true,
                        letters: ['a', 'b'],
                    },
                    gameboard,
                );
            });

            it('setAttributes should build word with string abc', () => expect(word.stringFormat).to.eql('abc'));
            it('setAttributes should build word with isHorizontal as true', () => expect(word.isHorizontal).to.be.true);
            it('setAttributes should build word with correct newLetterCoords', () =>
                expect(word.newLetterCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                ]));
            it('setAttributes should build word with correct wordCoords', () =>
                expect(word.wordCoords).to.eql([
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ]));
        });

        describe('setAttributes should build string aabbcc if there is already occupied squares between placedLetters and word is horizontal', () => {
            beforeEach(async () => {
                gameboard.placeLetter({ x: 3, y: 1 }, 'a');
                gameboard.placeLetter({ x: 5, y: 1 }, 'b');
                gameboard.placeLetter({ x: 7, y: 1 }, 'c');
                word = new Word(
                    {
                        firstCoordinate: { x: 2, y: 1 },
                        isHorizontal: true,
                        letters: ['a', 'b', 'c'],
                    },
                    gameboard,
                );
            });

            it('setAttributes should build word with string abc', () => expect(word.stringFormat).to.eql('aabbcc'));
            it('setAttributes should build word with isHorizontal as true', () => expect(word.isHorizontal).to.be.true);
            it('setAttributes should build word with correct newLetterCoords', () =>
                expect(word.newLetterCoords).to.eql([
                    { x: 2, y: 1 },
                    { x: 4, y: 1 },
                    { x: 6, y: 1 },
                ]));
            it('setAttributes should build word with correct wordCoords', () =>
                expect(word.wordCoords).to.eql([
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 5, y: 1 },
                    { x: 6, y: 1 },
                    { x: 7, y: 1 },
                ]));
        });

        describe('setAttributes should build string aabbcc if there is already occupied squares between placedLetters and word is horizontal', () => {
            beforeEach(async () => {
                gameboard.placeLetter({ x: 1, y: 2 }, 'a');
                gameboard.placeLetter({ x: 1, y: 4 }, 'b');
                gameboard.placeLetter({ x: 1, y: 6 }, 'c');
                word = new Word(
                    {
                        firstCoordinate: { x: 1, y: 3 },
                        isHorizontal: false,
                        letters: ['a', 'b', 'c'],
                    },
                    gameboard,
                );
            });

            it('setAttributes should build word with string abc', () => expect(word.stringFormat).to.eql('aabbcc'));
            it('setAttributes should build word with isHorizontal as true', () => expect(word.isHorizontal).to.be.false);
            it('setAttributes should build word with correct newLetterCoords', () =>
                expect(word.newLetterCoords).to.eql([
                    { x: 1, y: 3 },
                    { x: 1, y: 5 },
                    { x: 1, y: 7 },
                ]));
            it('setAttributes should build word with correct wordCoords', () =>
                expect(word.wordCoords).to.eql([
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 1, y: 4 },
                    { x: 1, y: 5 },
                    { x: 1, y: 6 },
                    { x: 1, y: 7 },
                ]));
        });
    });

    // TODO
    context('isHorizontal is not specified', () => {});

    // TODO : write more tests for find adjacent words ....
    describe('Find adjacent words', () => {
        it('findAdjacentWords() should return a single word if there are no words adjacent to itself', () => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );
            placeLettersWordTest(word, gameboard);
            const words: Word[] = Word.findAdjacentWords(word, gameboard);

            expect(words).to.have.lengthOf(1);
        });

        it('findAdjacentWords() should return an array of 2 words if there is one adjacent word', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 2, y: 2 }, 'b');
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 2 },
                    isHorizontal: false,
                    letters: ['b', 'c'],
                },
                gameboard,
            );
            placeLettersWordTest(word, gameboard);

            const words: Word[] = Word.findAdjacentWords(word, gameboard);
            const stringList: string[] = words.map((word) => {
                return word.stringFormat;
            });

            expect(words).to.have.lengthOf(2);
            expect(stringList).to.include.members(['abc', 'bb']);
        });

        it('findAdjacentWords() should return an array of 3 words if there is one adjacent word', () => {
            gameboard.placeLetter({ x: 1, y: 2 }, 'b');
            gameboard.placeLetter({ x: 1, y: 3 }, 'c');
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );
            placeLettersWordTest(word, gameboard);

            const words: Word[] = Word.findAdjacentWords(word, gameboard);
            const stringList: string[] = words.map((word) => {
                return word.stringFormat;
            });

            expect(words).to.have.lengthOf(3);
            expect(stringList).to.include.members(['abc', 'abc', 'ca']);
        });

        // TODO
        // it('findAdjacentWords() should return empty array if coordList is empty', () => {
        //     expect(Word.findAdjacentWords({} as Word, gameboard)).to.eql([]);
        // });
    });

    context('Calculate points', () => {
        it('should correctly calculate points if there is no multiplier', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 9, y: 8 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(2);
        });

        it('should correctly calculate points if word is Horizontal and on letterMultiplier by 2', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 4, y: 1 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(3);
        });

        it('should correctly calculate points if word is vertical and on letterMultiplier by 2', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 4, y: 1 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(3);
        });

        it('should correctly calculate points if word is Horizontal and on letterMultiplier by 3', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 6, y: 2 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is vertical and on letterMultiplier by 3', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 6, y: 1 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is Horizontal and on wordMultiplier by 2', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 8, y: 8 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is vertical and on wordMultiplier by 2', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 8, y: 8 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is Horizontal and on wordMultiplier by 3', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 8 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(6);
        });

        it('should correctly calculate points if word is vertical and on wordMultiplier by 3', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 1, y: 8 }, letters: ['a', 'a'] }, gameboard);
            placeLettersWordTest(word, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(6);
        });
    });
});

function placeLettersWordTest(word: Word, gameboard: Gameboard) {
    let stringArray = word.stringFormat.split('');
    word.newLetterCoords.forEach((coord) => {
        gameboard.placeLetter(coord, stringArray[0]);
        stringArray.shift();
    });
}
