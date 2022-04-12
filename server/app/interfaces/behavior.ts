import { DictionaryValidationService } from '@app/services/dictionary-validation.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { WordSolverService } from '@app/services/word-solver.service';

export interface Behavior {
    dictionaryValidation: DictionaryValidationService;
    wordSolver: WordSolverService;
    letterPlacement: LetterPlacementService;
}
