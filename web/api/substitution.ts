import { Schema, model } from "mongoose";

const constitutionSchema = new Schema({
  id: {
    required: true,
    type: Number
  },
  hour: {
    required: true,
    type: String
  },
  group: {
    required: true,
    type: Array
  },
  teacher_old: {
    required: true,
    type: String
  },
  teacher_new: {
    required: true,
    type: String
  },
  topic_old: {
    required: true,
    type: String
  },
  room_old: {
    required: true,
    type: String
  },
  topic_new: {
    required: true,
    type: String
  },
  room_new: {
    required: true,
    type: String
  },
  moved_from: {
    required: true,
    type: String
  },
  info: {
    required: true,
    type: String
  },
  cancelled: {
    required: true,
    type: Boolean
  },
  date: {
    required: true,
    type: Date
  }
},
  {
    collection: 'constitutions'
  })

export default model('Constitution', constitutionSchema)
