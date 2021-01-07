const {LinkedList} = require("./LinkedList")

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id })
  },
  getNextWord(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("original", "language_id", "correct_count", "incorrect_count")
      .where({ language_id })
  },
  populateList(words, head) {
    const currentHead = words.find((word) => word.id === head)
    const headId = words.indexOf(currentHead)
    const headNode = words.splice(headId, 1)
    const list = new LinkedList()
    list.insertLast(headNode[0])

    let nextId = headNode[0].next
    let currentWord = words.find((word) => word.id === nextId)
    list.insertLast(currentWord)
    nextId = currentWord.next
    currentWord = words.find((word) => word.id === nextId)

    while (currentWord !== null) {
      list.insertLast(currentWord)
      nextId = currentWord.next
      if (nextId === null) {
        currentWord = null
      } else {
        currentWord = words.find((word) => word.id === nextId)
      }
    }
    return list
  },
  checkGuess(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("*")
      .where({ language_id })
  },

  getCurrentHead(db, language_id) {
    return db
      .from("language")
      .join("word", "word.language_id", "=", "language.id")
      .select("head")
      .where({ language_id })
  },
 
  updateTables(db, words, language_id, total_score) {
    return db.transaction(async (trx) => {
      return Promise.all([
        trx("language")
          .where({ id: language_id })
          .update({ head: words[0].id, total_score }),
        ...words.map((word, i) => {
          if (i + 1 >= words.length) {
            word.next = null
          } else {
            word.next = words[i + 1].id
          }
          return trx("word")
            .where({ id: word.id })
            .update({ ...word })
        }),
      ])
    })
  },
}
module.exports = LanguageService
