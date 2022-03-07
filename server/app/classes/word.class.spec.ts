import { CommandInfo } from '@common/command-info';
import { expect } from 'chai';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';

describe('Word', () => {
    let gameboard: Gameboard;
    let word: Word;

    beforeEach(async () => {
        gameboard = new Gameboard();
    });

    context('Constructor tests', () => {
        it('buildWord should build word with string abc if all placedLetters form abc and word is horizontal', () => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );

            expect(word.stringFormat).to.eql('abc');
            expect(word.isHorizontal).to.be.true;
            expect(word.newLetterCoords).to.equal([
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 1 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 1 },
            ]);
        });

        it('buildWord should build word with string abc if all placedLetters form abc and word is vertical', () => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: false,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );

            expect(word.stringFormat).to.eql('abc');
            expect(word.isHorizontal).to.be.true;
            expect(word.newLetterCoords).to.equal([
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
            ]);
        });

        it('buildWord should build string abc if only a,b are the placedLetters and word is horizontal', () => {
            gameboard.placeLetter({ x: 3, y: 1 }, 'c');
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );

            expect(word.stringFormat).to.eql('abc');
            expect(word.isHorizontal).to.be.true;
            expect(word.newLetterCoords).to.equal([
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 1 },
            ]);
        });

        it('buildWord should build string abc if only a,b are the placedLetters and word is vertical', () => {
            gameboard.placeLetter({ x: 3, y: 1 }, 'c');
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: false,
                    letters: ['a', 'b'],
                },
                gameboard,
            );

            expect(word.stringFormat).to.eql('abc');
            expect(word.isHorizontal).to.be.true;
            expect(word.newLetterCoords).to.equal([
                { x: 1, y: 1 },
                { x: 1, y: 2 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
            ]);
        });

        it('buildWord should build string aabbcc if there is already occupied squares between placedLetters and word is horizontal', () => {
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

            expect(word.stringFormat).to.eql('aabbcc');
            expect(word.isHorizontal).to.be.true;
            expect(word.newLetterCoords).to.equal([
                { x: 2, y: 1 },
                { x: 4, y: 1 },
                { x: 6, y: 1 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 2, y: 1 },
                { x: 3, y: 1 },
                { x: 4, y: 1 },
                { x: 5, y: 1 },
                { x: 6, y: 1 },
                { x: 7, y: 1 },
            ]);
        });

        it('buildWord should build string aabbcc if there is already occupied squares between placedLetters and word is vertical', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 1, y: 4 }, 'b');
            gameboard.placeLetter({ x: 1, y: 6 }, 'c');
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 2 },
                    isHorizontal: false,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );
            expect(word.stringFormat).to.eql('aabbcc');
            expect(word.isHorizontal).to.be.false;
            expect(word.newLetterCoords).to.equal([
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 5 },
            ]);
            expect(word.wordCoords).to.equal([
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 4 },
                { x: 1, y: 5 },
                { x: 1, y: 6 },
            ]);
        });

        it('buildWord should return empty word if coordList is empty', () => {
            word = new Word({} as CommandInfo, gameboard);
            expect(word).to.eql({} as Word);
        });
    });

    context('Words near edge of gameboard bounds', () => {
        //TODO : both vertical and horizontal word contexts
    });

    // TODO
    context('isHorizontal is not specified', () => {});

    context('Find adjacent words', () => {
        it('findAdjacentWords() should return a single word if there are no words adjacent to itself', () => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b', 'c'],
                },
                gameboard,
            );
            const words: Word[] = Word.findAdjacentWords(word, gameboard);
            expect(words).to.have.lengthOf(1);
        });

        it('findAdjacentWords() should return an array of 2 words if there is one adjacent word', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 2, y: 1 }, 'b');
            gameboard.placeLetter({ x: 3, y: 1 }, 'c');

            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: false,
                    letters: ['b', 'c'],
                },
                gameboard,
            );
            const words: Word[] = Word.findAdjacentWords(word, gameboard);
            expect(words).to.have.lengthOf(2);

            const stringList: string[] = words.map((word) => {
                return word.stringFormat;
            });
            expect(stringList).to.include.members(['abc', 'abc']);
        });

        it('findAdjacentWords() should return an array of 3 words if there is one adjacent word', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 1, y: 2 }, 'b');
            gameboard.placeLetter({ x: 1, y: 3 }, 'c');
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');

            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['b', 'c'],
                },
                gameboard,
            );
            const words: Word[] = Word.findAdjacentWords(word, gameboard);
            expect(words).to.have.lengthOf(3);

            const stringList: string[] = words.map((word) => {
                return word.stringFormat;
            });
            expect(stringList).to.include.members(['abc', 'abc', 'ca']);
        });

        it('findAdjacentWords() should return empty array if coordList is empty', () => {
            expect(Word.findAdjacentWords({} as Word, gameboard)).to.eql([]);
        });
    });

    context('Calculate points', () => {
        it('should correctly calculate points if there is no multiplier', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 9, y: 8 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(2);
        });

        it('should correctly calculate points if word is Horizontal and on letterMultiplier by 2', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 4, y: 1 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(3);
        });

        it('should correctly calculate points if word is vertical and on letterMultiplier by 2', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 4, y: 1 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(3);
        });

        it('should correctly calculate points if word is Horizontal and on letterMultiplier by 3', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 6, y: 1 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is vertical and on letterMultiplier by 3', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 6, y: 1 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is Horizontal and on wordMultiplier by 2', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 8, y: 8 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is vertical and on wordMultiplier by 2', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 8, y: 8 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(4);
        });

        it('should correctly calculate points if word is Horizontal and on wordMultiplier by 3', () => {
            word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 8 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(6);
        });

        it('should correctly calculate points if word is vertical and on wordMultiplier by 3', () => {
            word = new Word({ isHorizontal: false, firstCoordinate: { x: 1, y: 8 }, letters: ['a', 'a'] }, gameboard);
            expect(word.calculateWordPoints(gameboard)).to.equal(6);
        });
    });

    // context('validateCoordinate() should return empty list if string goes out of bound', () => {
    //     let firstCoord: LetterTile;
    //     let word: string[];
    //     beforeEach(() => {
    //         firstCoord = new LetterTile(14, 14, {} as Letter);
    //         word = ['a', 'a', 'a', 'a'];
    //     });
    //     it('horizontal', () => {
    //         const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
    //     });

    //     it('vertical', () => {
    //         const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
    //     });
    // });

    // context('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
    //     let word: string[];
    //     beforeEach(() => {
    //         gameboard.placeLetter(new LetterTile(14, 11, {} as Letter));
    //         gameboard.placeLetter(new LetterTile(15, 1, {} as Letter));
    //         gameboard.placeLetter(new LetterTile(1, 14, {} as Letter));
    //         gameboard.placeLetter(new LetterTile(1, 15, {} as Letter));
    //         word = ['a', 'a', 'a', 'a'];
    //     });
    //     it('horizontal', () => {
    //         const coord = new LetterTile(13, 1, {} as Letter);
    //         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
    //     });
    //     it('vertical', () => {
    //         const coord = new LetterTile(1, 13, {} as Letter);
    //         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
    //     });
    // });

    // context('validateCoordinate() should return placedLetters array if placement is valid and there is no letters on the gameboard', () => {
    //     let word: string[];
    //     let coord: LetterTile;
    //     beforeEach(() => {
    //         word = ['a', 'a', 'a', 'a'];
    //         coord = new LetterTile(1, 1, letterA);
    //     });
    //     it('horizontal', () => {
    //         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
    //         const expectedCoordList = [
    //             new LetterTile(1, 1, letterA),
    //             new LetterTile(2, 1, letterA),
    //             new LetterTile(3, 1, letterA),
    //             new LetterTile(4, 1, letterA),
    //         ];
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
    //     });

    //     it('vertical', () => {
    //         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
    //         const expectedCoordList = [
    //             new LetterTile(1, 1, letterA),
    //             new LetterTile(1, 2, letterA),
    //             new LetterTile(1, 3, letterA),
    //             new LetterTile(1, 4, letterA),
    //         ];
    //         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
    //     });
    // });

    // it('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
    //     const firstCoord = new LetterTile(5, 6, {} as Letter);
    //     gameboard.placeLetter(new LetterTile(6, 6, {} as Letter));
    //     gameboard.placeLetter(new LetterTile(7, 6, {} as Letter));
    //     gameboard.placeLetter(new LetterTile(8, 6, {} as Letter));
    //     const word: string[] = ['a', 'a', 'b'];
    //     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
    //     const expectedCoordList = [new LetterTile(5, 6, letterA), new LetterTile(9, 6, letterA), new LetterTile(10, 6, letterB)];
    //     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
    // });

    // it('should return correct placedLetters array if placement is valid vertically and there is already letters on the gameboard', () => {
    //     const firstCoord = new LetterTile(5, 6, {} as Letter);
    //     gameboard.placeLetter(new LetterTile(5, 7, {} as Letter));
    //     gameboard.placeLetter(new LetterTile(5, 8, {} as Letter));
    //     gameboard.placeLetter(new LetterTile(5, 9, {} as Letter));
    //     const word: string[] = ['a', 'a', 'b'];
    //     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
    //     const expectedCoordList = [new LetterTile(5, 6, letterA), new LetterTile(5, 10, letterA), new LetterTile(5, 11, letterB)];
    //     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
    // });

    // context('isThereAdjacentLetters() tests', () => {
    //     let testCoordinate: LetterTile;
    //     let upLeftCoord: LetterTile;
    //     let downRightCoord: LetterTile;
    //     beforeEach(() => {
    //         testCoordinate = new LetterTile(8, 8, letterA);
    //         upLeftCoord = new LetterTile(1, 1, letterA);
    //         downRightCoord = new LetterTile(15, 15, letterA);
    //     });

    //     it('should return false if there is no adjacent letters', () => {
    //         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(false);
    //     });

    //     it('should return true if upward tile is occupied', () => {
    //         gameboard.placeLetter(new LetterTile(8, 7, letterA));
    //         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
    //     });

    //     it('should return true if downward tile is occupied', () => {
    //         gameboard.placeLetter(new LetterTile(8, 9, letterA));
    //         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
    //     });

    //     it('should return true if right tile is occupied', () => {
    //         gameboard.placeLetter(new LetterTile(9, 8, letterA));
    //         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
    //     });

    //     it('should return true if left tile is occupied', () => {
    //         gameboard.placeLetter(new LetterTile(7, 8, letterA));
    //         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
    //     });

    // context('verifyLetterContact tests', () => {
    //     let letterCoords: LetterTile[];
    //     beforeEach(() => {
    //         letterCoords = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterA)];
    //     });
    //     it('should return true if gameboard is not occupied by any letters', () => {
    //         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
    //     });

    //     it('should return true if there is a vertically adjacent placed letter on the board', () => {
    //         gameboard.placeLetter(new LetterTile(1, 2, letterA));
    //         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
    //     });

    //     it('should return true if there is a horizontally adjacent placed letter on the board', () => {
    //         gameboard.placeLetter(new LetterTile(4, 1, letterA));
    //         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
    //     });

    //     it('should return false if letter placed on the board is diagonal to coordinate', () => {
    //         gameboard.placeLetter(new LetterTile(4, 2, letterA));
    //         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(false);
    //     });
    // });
});
