const express = require("express");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const ejs = require("ejs");
const bodyparser = require("body-parser");
PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose
  .connect(
    "mongodb+srv://BobbyKuhikar:thriinone@cluster0.jdtcv.mongodb.net/another?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("connection is succesfull..."))
  .catch((err) => console.log(err));

var dataschema = {
  name: String,
  points: Number,
};

const mongodata = mongoose.model("user", dataschema);
var client = undefined;
async function main() {
  const uri =
    "mongodb+srv://BobbyKuhikar:thriinone@cluster0.jdtcv.mongodb.net/another?retryWrites=true&w=majority";
  client = new MongoClient(uri);

  try {
    await client.connect();

    await getlist(client);
  } catch (e) {
    console.error(e);
  }
}
main().catch(console.error);
var result = [];
var data = undefined;
var i = -1;

async function getlist(client) {
  const agg = [
    {
      $sort: {
        points: -1,
      },
    },
    {
      $limit: 10,
    },
  ];

  var cursor = [];
  cursor = await client.db("another").collection("user").aggregate(agg);
  result = await cursor.toArray();
  data = {
    headers: ["Rank", "Name", "Points"],
    rows: new Array(10).fill(undefined).map(() => {
      i = i + 1;
      return [i + 1, `${result[i].name}`, `${result[i].points}`];
    }),
  };
}

app.get("/", (req, res) => {
  // console.log(data);
  res.render("index", { data });
});

app.post("/update", (req, res) => {
  //   let newdata = new mongodata({
  //     name: req.body.name,
  //     points: req.body.points,
  //   });
  // console.log(newdata);
  const name = req.body.name;
  //console.log(name);
  const point = req.body.points;
  const points = parseInt(point);
  updateDocument(client, name, points);
  async function updateDocument(client, name, points) {
    const fetchdata = await client
      .db("another")
      .collection("user")
      .updateOne(
        { name: name },
        { $set: { points: points } },
        {
          useFindAndModify: false,
        }
      );
  }
  console.log("updated");

  res.redirect("/");
});

app.listen(PORT, function () {
  console.log("server is running");
});
