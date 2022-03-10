import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameConfigurationService } from '@app/services/game-configuration.service';

@Component({
    selector: 'app-solo-difficulty-dialog-box',
    templateUrl: './solo-difficulty-dialog-box.component.html',
    styleUrls: ['./solo-difficulty-dialog-box.component.scss'],
})
export class SoloDifficultyDialogBoxComponent {
    constructor(private gameConfiguration: GameConfigurationService, public router: Router) {}

    returnWaiting() {
        this.gameConfiguration.setGameAvailable();
    }

    easySoloMode() {
        this.gameConfiguration.beginScrabbleGame();
        this.router.navigate(['/game']);
    }
}
