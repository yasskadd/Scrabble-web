import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { AdminDictionariesComponent } from './components/admin-dictionaries/admin-dictionaries.component';
import { AdminGameHistoryComponent } from './components/admin-game-history/admin-game-history.component';
import { AdminHighScoresComponent } from './components/admin-high-scores/admin-high-scores.component';
import { AdminVirtualPlayersComponent } from './components/admin-virtual-players/admin-virtual-players.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { DialogBoxAbandonGameComponent } from './components/dialog-box-abandon-game/dialog-box-abandon-game.component';
import { DialogBoxGameTypeComponent } from './components/dialog-box-game-type/dialog-box-game-type.component';
import { DialogBoxHighScoresComponent } from './components/dialog-box-high-scores/dialog-box-high-scores.component';
import { DialogBoxNewGameComponent } from './components/dialog-box-new-game-component/dialog-box-new-game.component';
import { DialogGameHelpComponent } from './components/dialog-game-help/dialog-game-help.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { PlayerRackComponent } from './components/player-rack/player-rack.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MultiplayerCreatePageComponent } from './pages/multiplayer-create-page/multiplayer-create-page.component';
import { MultiplayerJoinPageComponent } from './pages/multiplayer-join-page/multiplayer-join-page.component';
import { WaitingOpponentPageComponent } from './pages/waiting-opponent-page/waiting-opponent-page.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        MultiplayerJoinPageComponent,
        MultiplayerCreatePageComponent,
        WaitingOpponentPageComponent,
        ChatboxComponent,
        DialogBoxGameTypeComponent,
        InformationPanelComponent,
        PlayerRackComponent,
        DialogBoxAbandonGameComponent,
        DialogBoxHighScoresComponent,
        AdminPageComponent,
        AdminDictionariesComponent,
        AdminVirtualPlayersComponent,
        AdminGameHistoryComponent,
        AdminHighScoresComponent,
        DialogBoxNewGameComponent,
        HeaderComponent,
        FooterComponent,
        DialogGameHelpComponent,
        HighScoresComponent,
    ],
    imports: [
        CommonModule,
        AppMaterialModule,
        AppRoutingModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatInputModule,
        MatTabsModule,
        MatFormFieldModule,
        MatListModule,
        MatSelectModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatSliderModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatStepperModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
