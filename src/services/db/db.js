const { MongoClient } = require("mongodb");

const url = 'mongodb://localhost:27017'
const dbName = 'quiz';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // auth: {
  //   password: 'root',
  //   user: 'example'
  // }
});

class quizDB {
  async init() {
    await client.connect();
    this.db = client.db(dbName);

    // TODO : add already created quizz from file
  }

  /**
   * Get all quizz
   *
   * @return {Promise<Array<Quiz>>}
   */
  async getQuizz() {
    const quizz = this.db.collection("quizz");
    const cursor = quizz.find();

    let result = []
    await cursor.forEach(q => result.push(q)); // TODO : convert stored Objects to Quiz object
    return result
  }

  /**
   * Insert a quiz
   *
   * @param Quiz Required
   * @return {Promise<QuizId>} The inserted quiz new id
   */
  async addQuiz(quiz) {
    // TODO : Check that the quiz is OK
    const quizz = this.db.collection("quizz");
    const result = await quizz.insertOne(quiz);
    return result.insertedId
  }
}

module.exports = quizDB