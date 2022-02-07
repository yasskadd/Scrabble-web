/* eslint-disable prettier/prettier */

import Container, { Service } from 'typedi';
import { CoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordFinderService } from './word-finder.service';

@Service()
export class LetterPlacementService {
    validateCoordService = Container.get(CoordinateValidationService);
    wordFinderService = Container.get(WordFinderService) ;
    dictionaryService = Container.get(DictionaryValidationService);
    
    placeLetter(player) {
    
        const coords = this.validateCoordService.valideCoordinates()
        if (coords && )
            
    }
    }