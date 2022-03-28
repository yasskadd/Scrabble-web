import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { AbandonGameDialogBoxComponent } from './components/abandon-game-dialog-box/abandon-game-dialog-box.component';
import { AdminDictionariesComponent } from './components/admin-dictionaries/admin-dictionaries.component';
import { AdminGameHistoryComponent } from './components/admin-game-history/admin-game-history.component';
import { AdminVirtualPlayersComponent } from './components/admin-virtual-players/admin-virtual-players.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { DialogBoxAddDictionaryComponent } from './components/dialog-box-add-dictionary/add-dictionary-dialog-box.component';
import { DialogBoxGameTypeComponent } from './components/dialog-box-game-type/dialog-box.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { PlayerRackComponent } from './components/player-rack/player-rack.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MultiplayerCreatePageComponent } from './pages/multiplayer-create-page/multiplayer-create-page.component';
import { MultiplayerJoinPageComponent } from './pages/multiplayer-join-page/multiplayer-join-page.component';
import { WaitingOpponentPageComponent } from './pages/waiting-opponent-page/waiting-opponent-page.component';

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
        AbandonGameDialogBoxComponent,
        HighScoresComponent,
        AdminPageComponent,
        AdminDictionariesComponent,
        AdminVirtualPlayersComponent,
        AdminGameHistoryComponent,
        DialogBoxAddDictionaryComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
