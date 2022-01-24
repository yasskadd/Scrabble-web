//import { HttpClient } from '@angular/common/http';
//import { Injectable, OnInit } from '@angular/core';
import letter-reserve.json from 


export class LetterReserveService {
    lettersReserve: [];
    rack: [];
    constructor() {}


    getLetterReserve(): void { 
        get(letter-reserve.json);
    }

    updateReserve(): void {
        // modify json file with new quantities
        //{  "title": jdhfjgfd, letters; letterReserve}
        //post(lettersReserve);
    }

    addLetter(): void {
        const max = 27; //lettersReserve.length
        const random = Math.floor(Math.random() * max);
        const letter = this.lettersReserve[random];
        //this.lettersReserve.quantity--;
        this.rack.push(letter);
    }

    generateLetters(): void {
        // start of the game
        for (let i = 0; i < 7; i++) {
            this.addLetter();
        }
        this.updateReserve();
    }

    ngOnInit(): void {
        //this.lettersReserve = this.getLetterReserve().letters;
        this.generateLetters();
    }
}
// GENERATE RANDOM ID
const letters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];
