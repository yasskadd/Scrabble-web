import { DictionaryValidationService } from '@app/services/dictionary-validation.service';

export interface BotInformation {
    timer: number;
    roomId: string;
    dictionaryValidation: DictionaryValidationService;
}
