import { Lobby } from "../../models/lobby";
import { Player } from "../../models/player";
import { convertMomentToTimestamp, convertTimestampToMoment } from "../../utils/dates";
import { ObjectID } from "mongodb";

const strDateTomoment = (strDate) => {
    return (strDate === null || strDate === undefined) ? null : convertTimestampToMoment(strDate);
};

const objToLobby = async (obj, quizService) => {
    // Get all the parameters
    let quiz = await quizService.findById(obj.quizId);

    if (!quiz) throw new Error("The quiz saved in the database hasn't been found");

    let owner = new Player(obj.owner.name, obj.owner.id);

    let players = obj.otherPlayers.map(p => new Player(p.name, p.id));
    let startDate = strDateTomoment(obj.startDate);
    let answersByPlayerId = obj.answersByPlayerId ? obj.answersByPlayerId : {};
    let endDate = strDateTomoment(obj.endDate);

    // Create the lobby
    const newLobby = new Lobby(obj.name, quiz, owner, players, startDate, answersByPlayerId, endDate);
    newLobby.id = obj._id.toString();
    return newLobby;
};

/**
 * Lobby database service
 * Store and restore lobby from the database
 */
class LobbyDbService {
    /**
     * Constructor
     *
     * @param {DatabaseService} database Object, ref to Mongo database
     * @param {QuizDatabaseService} quizService Object, ref to Quiz service
     */
    constructor(database, quizService) {
        this.database = database;
        this.quizService = quizService;
    }

    /**
     * Retrieve all lobby
     *
     * @returns {Promise<Array<Lobby>>} new lobby id
     *  */
    async getAllLobby() {
        let lobbyList = await this.database.getAllDocumentsFromCollection(LobbyDbService.getCollection());
        let ret = [];
        for (let i = 0; i < lobbyList.length; i++) ret.push(await objToLobby(lobbyList[i], this.quizService));
        return ret;
    }

    /**
     * @param {Lobby} lobby the id will be setted to the given lobby
     * @returns {Promise<string>} new lobby id
     */
    async addLobby(lobby) {
        if (!(lobby instanceof Lobby)) throw new Error("Unexpected type for the lobby");
        if (!lobby.quiz.id) throw new Error("The quiz Id is requiered to insert a lobby");

        let lobbyObjToAdd = {
            name: lobby.name,
            owner: { name: lobby.owner.name, id: lobby.owner.id },
            otherPlayers: lobby.getPlayersToObj(),
            quizId: lobby.quiz.id,
            startDate: lobby.startDate,
            endDate: lobby.endDate,
            answersByPlayerId: lobby.answersByPlayerId
        };

        let lobbyId = await this.database.addDocument(lobbyObjToAdd, LobbyDbService.getCollection());
        lobby.id = lobbyId.toString();
        return lobby.id;
    }


    /**
     * Return a lobby by ID
     *
     * @param {string} lobbyId lobby id
     * @return {Lobby} on null if not found
     *  */
    async findById(lobbyId) {
        let obj = await this.database.db.collection(LobbyDbService.getCollection()).findOne({ "_id": new ObjectID(lobbyId) });

        if (obj === null) return null;
        return await objToLobby(obj, this.quizService);
    }

    /**
     * @param {Lobby} lobby
     *  */
    async updatelobbyStartDate(lobby) {
        if (!(lobby instanceof Lobby)) throw new Error("Unexpected type for the lobby");
        await this.database.updateDocument(
            { startDate: convertMomentToTimestamp(lobby.startDate) },
            lobby.id,
            LobbyDbService.getCollection()
        );
    }
    /**
     * @param {Lobby} lobby
     *  */
    async updatelobbyEndDate(lobby) {
        if (!(lobby instanceof Lobby)) throw new Error("Unexpected type for the lobby");
        await this.database.updateDocument(
            { endDate: convertMomentToTimestamp(lobby.endDate) },
            lobby.id,
            LobbyDbService.getCollection()
        );
    }

    /**
     * @param {Lobby} lobby
     * @param {Player} player
     *  */
    async addPlayersToLobby(lobby, player) {
        if (!(lobby instanceof Lobby)) throw new Error("Unexpected type for the lobby");
        await this.database.pushToDocument("otherPlayers", { name: player.name, id: player.id }, lobby.id, LobbyDbService.getCollection());
    }

    /**
     * @param {Lobby} lobby
     * @param {Player} player
     * @param {Array} answers
     *  */
    async updateLobbyPlayerAnswers(lobby) {
        if (!(lobby instanceof Lobby)) throw new Error("Unexpected type for the lobby");

        await this.database.updateDocument(
            { answersByPlayerId: lobby.answersByPlayerId },
            lobby.id,
            LobbyDbService.getCollection()
        );
    }

    /**
     * Return the DB collection of lobby
     *  */
    static getCollection() { return "lobby"; }

    /**
     * Drop the DB collection of lobby
     *  */
    async dropCollection() { await this.database.dropCollection(LobbyDbService.getCollection()); }

}

export default LobbyDbService;
