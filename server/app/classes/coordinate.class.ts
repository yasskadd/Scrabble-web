/* eslint-disable prettier/prettier */
export class Coordinate {
    private x: number;
    private y: number; // POURQUOI UTILISER DES MEMBRES PRIVES EN TS?

    constructor(posX: number, posY: number) {
        this.x = posX;
        this.y = posY;
    }

    // EST-CE QUE C'EST UTILE?
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
}
