require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./models/person')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT
/*
const url =
  `mongodb+srv://matia:${password}@cluster0.qigyc.mongodb.net/phonebook?retryWrites=true&w=majority`



mongoose.set('strictQuery', false)
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)
*/


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "040-765431"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "040-573457"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "040-8654346775"
    }
]



app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
        result.forEach(person => {
        console.log(person)})
    })
    //response.json(persons)
    
})

app.get('/info', (request, response) => {
    const info = `Phonebook has info for ${persons.length} people`
    response.send(`
        <h1>Phonebook has info for ${persons.length} people
        <h2>${Date()}<h2>
        `)
    
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    //const person = persons.find(person => person.id === id)
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    /*    
    koodi ennen mongodbtä:
    persons = persons.filter(person => person.id !== id) 
    response.status(204).end()
    */
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', req => {
    return JSON.stringify(req.body)
  })

app.put('/api/persons/:id', (request, response, next) => {
    //const body = request.body
    const { name, number } = request.body

  const person = {
    name: name,
    number: number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    console.log('POST request received', request.body);
    const body = request.body
    const nimi = persons.find(person => person.name === body.name)
    
/*
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
*/console.log("nimi", nimi)
    if (nimi) {
        const person = {
            name: body.nimi,
            number: body.number
        }
        const id = request.params.id
        Person.findByIdAndUpdate(id, person, { new: true })
            .then(updatedPerson => {
            response.json(updatedPerson)
            })
            .catch(error => next(error))
        //return response.status(400).json({
          //  error: 'name must be unique'
        //})
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 3000),
    })

    persons = persons.concat(person)
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
    //response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  // olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
      }

    next(error)
}


app.use(errorHandler)
/*
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
    */