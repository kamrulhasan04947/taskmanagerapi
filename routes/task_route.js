const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new task
router.post('/tasks/create', auth,  async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).json({
            status: "Created",
            msg: `new task ${task.taskName} created.`,
            data: task
        });
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }
});

// Get all tasks
router.get('/tasks/all', auth,  async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json({
            status: "ok",
            data: tasks
        });
    } catch (e) {
        res.status(500).send();
    }
});

// Get task by ID
router.get('/tasks/getById/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        console.log(e)
        res.status(500).send();
    }
});

// Update a task
router.patch('/tasks/update/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['taskName', 'description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete a task
router.delete('/tasks/delete/:id',  auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                msg: "Content not found"
            })
        }

        res.status(200).json({
            status: "deleted",
            msg: `${task.taskName} task has deleted successfully`
        });
    } catch (e) {
        res.status(500).send()
    }
});

module.exports = router;