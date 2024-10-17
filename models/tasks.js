const mongoose = require('mongoose');
const {Schema} = mongoose;

const taskSchema = new Schema(
    { 
      taskName:{
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
        // reference to another model to create a relationship
      }
    },
    {
      timestamps: true
    }
  )
  
  const Task = mongoose.model('Task', taskSchema)
  
  module.exports = Task