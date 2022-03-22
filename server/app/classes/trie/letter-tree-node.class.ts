export class LetterTreeNode {
    letter: string;
    isWord: boolean;
    children: Map<string, LetterTreeNode> = new Map();
    constructor(isWord: boolean) {
        this.isWord = isWord;
    }
}
