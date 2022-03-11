import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HighScoresComponent } from '@app/pages/high-scores/high-scores.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MultiplayerCreatePageComponent } from '@app/pages/multiplayer-create-page/multiplayer-create-page.component';
import { MultiplayerJoinPageComponent } from '@app/pages/multiplayer-join-page/multiplayer-join-page.component';
import { WaitingOpponentPageComponent } from '@app/pages/waiting-opponent-page/waiting-opponent-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'solo/:id', component: MultiplayerCreatePageComponent },
    { path: 'multijoueur/rejoindre/:id', component: MultiplayerJoinPageComponent },
    { path: 'multijoueur/creer/:id', component: MultiplayerCreatePageComponent },
    { path: 'multijoueur/salleAttente/:id', component: WaitingOpponentPageComponent },
    { path: 'highScore', component: HighScoresComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
