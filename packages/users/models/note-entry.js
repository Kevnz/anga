const Joi = require('joi');
const MongoModels = require('anga-model');
const NewDate = require('joistick/new-date');

const schema = Joi.object({
  adminCreated: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  }).required(),
  data: Joi.string().required(),
  timeCreated: Joi.date().default(NewDate(), 'time of creation')
});

class NoteEntry extends MongoModels {}
NoteEntry.collectionName = 'anga_noteEntry';
NoteEntry.schema = schema;

module.exports = NoteEntry;
