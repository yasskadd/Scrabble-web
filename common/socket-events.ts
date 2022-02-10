export enum SocketEvents {
    SendMessage = 'message',
    GameCommand = 'command',
    Disconnect = 'disconnect',
    OpponentDisconnect = 'user disconnect',
    GameMessage = 'gameMessage',
    CreateGame = 'createGame',
    GameCreatedConfirmation = 'gameCreatedConfirmation',
    UpdateRoomJoinable = 'updateListOfRooms',
    PlayerJoinGameAvailable = 'roomJoin',
    JoinValidGame = 'joinValid',
    FoundAnOpponent = 'foundOpponent',
    ErrorJoining = 'joiningError',
    RoomLobby = 'roomLobby',
    RemoveRoom = 'removeRoom',
    RejectOpponent = 'rejectOpponent',
    RejectByOtherPlayer = 'rejectByOtherPlayer',
    JoinRoom = 'joinRoom',
    StartScrabbleGame = 'startScrabbleGame',
    GameAboutToStart = 'gameAboutToStart',
    ExitWaitingRoom = 'exitWaitingRoom',
    OpponentLeave = 'opponentLeave',
}
