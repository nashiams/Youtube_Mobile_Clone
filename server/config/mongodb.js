import { MongoClient } from "mongodb";

const uri = process.env.URI;
//   "mongodb+srv://ihsanmuhammadn92:KN9GmtO3wy4hkcwQ@cluster.918ndzw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";

const client = new MongoClient(uri);

const database = client.db("GC01-nashiams");
console.log("Pinged your deployment. You successfully connected to MongoDB!");

export default database;
