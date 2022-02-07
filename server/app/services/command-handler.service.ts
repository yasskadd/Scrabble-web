import { Coordinate } from '@app/coordinate';
import { GameBoard } from 'app/classes/gameboard.class';
import { Service } from 'typedi';

// Source : https://www.codegrepper.com/code-examples/javascript/how+to+assign+alphabet+to+numbers+in+js
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function convertLetterToNumber(str: string) {
    str = str.toUpperCase();
    let out = 0;
    const len = str.length;
    for (let pos = 0; pos < len; pos++) {
        out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
    }
    return out;
}

@Service()
export class CommandHandlerService {
    handleCommand(command : string, gameboard : GameBoard) {
        const splitCommand = this.splitCommand(command);
        const commandType = this.getCommandType(splitCommand);
        if (commandType === 'placer'){
            const coordsAndDirection = this.getCoordsAndDirection(splitCommand);
            const placedLetters : string[] = this.getLetters(splitCommand);
            if (this.isOutOfBounds(gameboard, placedLetters, coordsAndDirection)) 

            // TODO: Assign coordinate to placed Letters if command is valid
        }
        else if (commandType === 'changer')
    }


    private isOutOfBounds(gameBoard: GameBoard, placedLetters: string[], coordsAndDirection : any[]) {
        const isOut : boolean = false;
        const stringLength : number = placedLetters.length;
        const direction : string = coordsAndDirection[1];
        const coord : Coordinate = coordsAndDirection[0];
        // TODO: Call service to validate Placement 

        return isOut;
    }

    private splitCommand(command: string) {
        return command.split(' ');
    }

    private getCommandType(stringArr: string[]) {
        return stringArr[0];
    }

    private getCoordsAndDirection(stringArr: string[]) {
        const placementArray = stringArr[1].split('');
        return [{ x: parseInt(placementArray[0], 10), y: convertLetterToNumber(placementArray[1]) } as Coordinate, placementArray[2] as string];
    }

    private getLetters(stringArr: string[]) {
        return stringArr[2].split('');
    }
}
