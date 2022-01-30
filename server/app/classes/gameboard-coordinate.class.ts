/* eslint-disable prettier/prettier */
export class Coordinate {
    private x: number;
    private y: number;

    constructor(posX: number, posY: number) {
        this.x = posX;
        this.y = posY;
    }

    static checkDirectionWord(coordList: Coordinate[]) {
        const DIRECTIONS = {
            horizontal: 'Horizontal',
            vertical: 'Vertical',
            none: 'None',
        };
        let direction: string = DIRECTIONS.none;
        const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);
        const tempHorizontalCoords: number[] = [];
        const tempVerticalCoord: number[] = [];
        coordList.forEach((coord) => {
            tempHorizontalCoords.push(coord.getX());
            tempVerticalCoord.push(coord.getY());
        });
        if (tempHorizontalCoords.length > 1 && allEqual(tempHorizontalCoords)) {
            direction = DIRECTIONS.horizontal;
            return direction;
        } else if (tempVerticalCoord.length > 1 && allEqual(tempVerticalCoord)) {
            direction = DIRECTIONS.vertical;
            return direction;
        } else {
            return direction;
        } // fix this problem
    }

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }

    setY(value: number) {
        this.y = value;
    }

    setX(value: number) {
        this.x = value;
    }
}
