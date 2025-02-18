const express = require('express')
const User = require('../models/User')

const router = express.Router()

router.post('/register', async (req, res) => {
    try{
        const user = new User(req.body)
        // console.log(req.body)
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/', async (req, res) => {
    try{
        const users = await User.find()
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/:id', async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.put('/:id', async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router