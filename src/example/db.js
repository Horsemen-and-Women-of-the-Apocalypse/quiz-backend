
/**
 * Database service (src/services/db/db.js) usage example
 */

const QUIZDB = require("../services/db/db");

const qdb = new QUIZDB();
let collecName = "quizz";

qdb.init().then(() => {
    qdb.getAllDocumentsFromCollection(collecName).then((q) => {
        console.log("quizz :");
        console.log(q);

        qdb.addDocument({ name: "Red", town: "kanto" }, collecName).then((qId) => {
            console.log("add ok : " + qId);

            qdb.getAllDocumentsFromCollection(collecName).then((q) => {
                console.log("quizz :");
                console.log(q);
            });
        });
    });
});