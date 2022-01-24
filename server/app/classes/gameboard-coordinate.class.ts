/* eslint-disable prettier/prettier */
export class Coordinate {
    private x: number;
    private y: number;

    constructor(posX: number, posY: number) {
        this.x = posX;
        this.y = posY;
    }

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
}
