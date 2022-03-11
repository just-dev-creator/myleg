import {model, Schema} from "mongoose";

export interface IAbit {
  date: Date,
  groups: Array<String>
}

const abitSchema = new Schema({
  date: {
    required: true,
    unique: true,
    type: Date
  },
  groups: {
    required: true,
    type: Array
  }
},
  {
    collection: 'abit'
})

export default model('Abit', abitSchema)
