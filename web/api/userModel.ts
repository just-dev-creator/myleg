import { Schema, model } from "mongoose";

export interface IUser {
  email: string,
  password: string,
  group: string | null,
  messagingToken: string | null,
  messaging: Object,
  verified: boolean
}

const userSchema = new Schema({
  email: {
    required: true,
    type: String,
    unique: true
  },
  password: {
    required: true,
    type: String
  },
  group: {
    required: false,
    type: String
  },
  messagingToken:  {
    required: false,
    type: String
  },
  messaging: {
    required: true,
    type: Object
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'users'
})

export default model('User', userSchema)
