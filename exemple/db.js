
/**
 * Database service (src/services/db/db.js) usage example
 */

const QUIZDB = require('../src/services/db/db')

const qdb = new QUIZDB()

qdb.init().then(() => {
  qdb.getQuizz().then((q) => {
    console.log('quizz :');
    console.log(q);

    qdb.addQuiz({ name: "Red", town: "kanto" }).then((qId) => {
      console.log('add ok : ' + qId);

      qdb.getQuizz().then((q) => {
        console.log('quizz :');
        console.log(q);
      })
    })
  })
})