/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Gameboard } from '@app/classes/gameboard.class';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { BoxMultiplierService } from './box-multiplier.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordSolverService } from './word-solver.service';

describe.only('Word solver service', () => {
    let wordSolverService: WordSolverService;
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;

    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        dictionaryValidationService.createTrieDictionary();
        wordSolverService = new WordSolverService(dictionaryValidationService.trie);
        boxMultiplierService = new BoxMultiplierService();
        gameboard = new Gameboard(boxMultiplierService);
    });

    it.only('test', () => {
        const rack: string[] = ['n', 'i'];
        gameboard.placeLetter(new LetterTile(8, 7, { value: 'a' } as Letter));
        gameboard.placeLetter(new LetterTile(8, 9, { value: 'e' } as Letter));
        wordSolverService.findAllOptions(gameboard, rack);
    });
});
