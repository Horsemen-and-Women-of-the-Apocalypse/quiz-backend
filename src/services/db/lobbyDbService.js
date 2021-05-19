import { Lobby } from "../../models/lobby";
import { Player } from "../../models/player";

// Nullable<Lobby> findById(ObjectId id);

// Lobby create(string name, Player owner, Quiz quiz);

// // This operation must be atomic and after it, the player should be in the lobby's players
// void join(Lobby lobby, Player player);

// // After this method lobby start and end date should be defined
// void start(Lobby lobby);

// // Save answers of the given player in the lobby
// // This operation must be atomic
// void saveAnswers(Lobby lobby, Player player, object[] answers);

/**
 * Lobby database service
 * Store and restore lobby from the database
 */
class LobbyDbService {
    /**
     * Constructor
     *
     * @param {quizDB} database Object, ref to Mongo database
     * @param {QuizService} quizService Object, ref to Quiz service
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
        for (let i = 0; i < lobbyList.length; i++) {
            const l = lobbyList[i];

            // Get all the parameters
            let quiz = await this.quizService.findById(l.quizId);

            if (!quiz) throw new Error("The quiz saved in the database hasn't been found");

            let owner = new Player(l.ownerName);

            let players = l.otherPlayersName.map(pName => new Player(pName));

            let startDate = l.startDate === undefined ? null : l.startDate;
            let answersByPlayerId = l.answersByPlayerId === undefined ? null : l.answersByPlayerId;
            let endDate = l.endDate === undefined ? null : l.endDate;

            // Create the lobby
            const newLobby = new Lobby(l.name, quiz, owner, players, startDate, answersByPlayerId, endDate);
            newLobby.id = l._id.toString();
            ret.push(newLobby);

        }
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
            ownerName: lobby.owner.name,
            otherPlayersName: lobby._otherPlayers.map(p => p.name),
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
     * Return the correct lobby
     *
     * @param ObjectId Int, integer which point on the chosen lobby, Required
     * @return lobby
     *  */
    async findById(ObjectId) {
        return (await this.database.db.collection(LobbyDbService.getCollection()).findOne({ "_id": ObjectId }));
    }

    /**
     * Return the DB collection of lobby
     *  */
    static getCollection() {
        return "lobby";
    }

    /**
     * Drop the DB collection of lobby
     *
     *  */
    async dropCollection() {
        await this.database.dropCollection(LobbyDbService.getCollection());
    }

}

export default LobbyDbService;
