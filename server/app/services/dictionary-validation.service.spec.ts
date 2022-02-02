// describe('Dictionary Validation Service', () => {
//     const dictionaryValidationService = new DictionaryValidationService();

//     it('constructor() should add dictionary words to Set object', () => {
//         expect(dictionaryValidationService.constructor);
//     });

//     it('checkWordInDictionary() should modify boolean isValid to false if word cannot be found in dictionary', () => {
//         dictionaryValidationService.dictionary = new Set<string>(['bonjour', 'merci']);
//         dictionaryValidationService.checkWordInDictionary(validWord);
//     });
//     it('checkWordInDictionary() should modify boolean isValid to true if word exists in dictionary');
//     it('isolateInvalidWords() should return proper array of strings');
//     // Unsure of what I'm supposed to test bellow
//     it('validateWords() should call calculatePoints() if all words are valid', () => {
//         const wordClass = sinon.createStubInstance(Word);
//         const spy = sinon.spy(wordClass, 'calculatePoints');
//         const stub = sinon.stub(dictionaryValidationService, 'validateWords');
//         stub.returns(true);
//     });
//     it('validateWords() should end turn if all words are valid');
//     it('validateWords() should call removeLetters() if at least one word is invalid', () => {
//         const gameBoardClass: GameBoard = sinon.createStubInstance(GameBoard);
//         const spy = sinon.spy(gameBoardClass, 'removeLetters');
//     });
// });
