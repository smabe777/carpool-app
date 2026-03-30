import mongoose from 'mongoose'

const startingPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  createdAt: { type: Date, default: Date.now },
})

const _model = mongoose.model('StartingPlace', startingPlaceSchema)
export { _model as StartingPlace }
export default _model
