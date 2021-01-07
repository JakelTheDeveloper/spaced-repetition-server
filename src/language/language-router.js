const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const parser = express.json()
const LinkedList = require('./LinkedList')
const { createArray } = require('./LinkedList')
const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter.get("/head", async (req, res, next) => {
  try {
    const [nextWord] = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    )
    res.json({
      nextWord: nextWord.original,
      totalScore: req.language.total_score,
      wordCorrectCount: nextWord.correct_count,
      wordIncorrectCount: nextWord.incorrect_count,
    })
    next()
  } catch (error) {
    next(error)
  }
})

languageRouter
  .post('/guess', parser, async (req, res, next) => {

    const { guess } = req.body
    let { total_score } = req.language

    if (!guess) {
      res.status(400).json({ error: "Missing 'guess' in request body" })
    }

    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )

      const [{ head }] = await LanguageService.getCurrentHead(
        req.app.get('db'),
        req.language.id
      )

      const list = LanguageService.populateList(words, head)

      const [GuessCheck] = await LanguageService.checkGuess(
        req.app.get('db'),
        req.language.id
      )

      if (GuessCheck.translation === guess.toLowerCase()) {
        let mem_val = list.head.value.memory_value * 2
        list.head.value.memory_value = mem_val
        list.head.value.correct_count++
        answer = list.getAnswer(mem_val)
        correct = true
        total_score++
      } else {
        list.head.value.memory_value = 1
        list.head.value.incorrect_count++
        answer = list.getAnswer(1)
        correct = false
      }

      await LanguageService.updateTables(
        req.app.get('db'),
        createArray(list),
        req.language.id,
        total_score
      )
      res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: total_score,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        answer: answer.value.translation,
        isCorrect: correct,
      })
      next()
    } catch (error) {
      next(error)
    }
  })


module.exports = languageRouter
