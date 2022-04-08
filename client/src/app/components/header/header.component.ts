import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    readonly title: string = "Bienvenue au jeu Scrabble de l'équipe 107";
    readonly scrabbleTitle: string[] = ['A', 'C', 'C', 'E', 'U', 'I', 'L'];
    constructor(private router: Router) {}

    ngOnInit(): void {}

    redirectHome() {
        this.router.navigate(['/home']);
    }
}
