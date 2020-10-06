import * as mongoose from 'mongoose'

export async function connectMongoose(USER: string, PASS: string, DB: string) {
  console.log(`mongodb+srv://${USER}:${PASS}@cluster0.5ov1b.mongodb.net/${DB}?retryWrites=true&w=majority`)
  await mongoose.connect(`mongodb+srv://${USER}:${PASS}@cluster0.5ov1b.mongodb.net/${DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
}
