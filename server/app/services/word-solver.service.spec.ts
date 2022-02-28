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
        boxMultiplierService = new BoxMultiplierService();
        gameboard = new Gameboard(boxMultiplierService);
        wordSolverService = new WordSolverService(dictionaryValidationService.trie, gameboard);
    });

    it.only('test', () => {
        const rack: string[] = ['b', 'e', 'a', 'l', 'l', 'i', 'o'];
        gameboard.placeLetter(new LetterTile(8, 8, { value: 'l' } as Letter));
        gameboard.placeLetter(new LetterTile(2, 1, { value: 'a' } as Letter));
        wordSolverService.findAllOptions(rack);
    });
});
