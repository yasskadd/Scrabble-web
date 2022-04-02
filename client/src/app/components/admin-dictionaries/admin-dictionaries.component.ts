import { Component, OnInit } from '@angular/core';

interface Dictionary {
    title: string;
    description: string;
}

const defaultDict: Dictionary = {
    title: 'default',
    description: 'Default Dictionary',
};

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent implements OnInit {
    dictionaries: Dictionary[] = [defaultDict, defaultDict, defaultDict, defaultDict];
    constructor() {}

    ngOnInit(): void {}
}
