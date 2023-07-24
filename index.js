const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose
  .connect(
    "mongodb+srv://siddhantkankaria:sid1034@cluster0.1btt8ah.mongodb.net/todolistdb",
    { useNewUrlParser: true }
  )
  .then(console.log("mongodb connected with server"));
const app = express();

app.set("view engine", "ejs"); // use ejs folder and files // this is line always important to access ejs // inka kaam h html content dynamic
app.use(bodyParser.urlencoded({ extended: true })); // use for passing client request to server
app.use(express.static("public")); // use for using static css html files it instruct express to use those files. basically its a method of using css  through express by making public folder.
const itemSchema = new mongoose.Schema({
  name: { type: String, require: true },
});
const Item = mongoose.model("Item", itemSchema);
const itemOne = new Item({
  name: "welcome todo list",
});
const itemTwo = new Item({
  name: " hit the + add an item",
});
const itemThree = new Item({
  name: "<-- hit to delete an item",
});

const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let itemRead = async () => {
    try {
      const listItems = await Item.find();
      // console.log(listItems);
      if (listItems.length == 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("default list inserted successfully");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", kindofItems: listItems });
      }
    } catch {
      console.log("default list not inserted");
    }
  };
  itemRead();
});

app.post("/", function (req, res) {
  const itemsName = req.body.newItem;
  const ListName = req.body.list;
  console.log(ListName);
  const item = new Item({
    name: itemsName,
  });

  if (ListName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    let checkNames = async () => {
      try {
        let foundList = await List.findOne({ name: ListName });
        console.log(foundList);
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + ListName);
      } catch {
        console.log("error");
      }
    };
    checkNames();
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const list_name = req.body.listName;
  if (list_name === "Today") {
    Item.findByIdAndRemove(checkedItem)
      .then(() => console.log("deleted"))
      .catch((err) => console.log(err));
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: list_name },
      { $pull: { items: { _id: checkedItem } } }
    )
      .then(() => console.log("deleted"))
      .catch((err) => console.log(err));
    res.redirect("/" + list_name);
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  let checkName = async () => {
    try {
      let foundList = await List.findOne({ name: customListName });

      if (foundList === null) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          kindofItems: foundList.items,
        });
      }
    } catch {
      console.log("error");
    }
  };
  checkName();
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(8000, function () {
  console.log("server running at port 8000");
});
