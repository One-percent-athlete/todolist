import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true}).then(console.log("alright"));


const  itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);
const item2 = new Item ({
  name: "Welcome to your todo list",
});

const item3 = new Item ({
  name: "Insert your todos below",
});

const defaultItems = [item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  
  Item.find().then((foundItems) => {

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");

    } else {
      res.render("list", {listTitle:"TODAY", newListItems: foundItems}); 
    }
  });
});


app.get("/:customListName", function(req,res){
  const customListName = req.params["customListName"];
        // console.log(customListName);
  List.findOne({name: customListName}).exec().then((foundItem) => {
    if (!foundItem) {
      console.log("does not exist");
      const list = new List({
          name: customListName,
          items: defaultItems
        });
      list.save();
      res.redirect("/" + customListName);

    } else {
      console.log("you found it ")
      res.render("list", {listTitle: customListName.toUpperCase(), newListItems: foundItem.items});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });

  if (listName === "TODAY") {
    item.save();
    res.redirect("/");

  } else {
    List.findOne({name: listName}).then((foundList) => {
      // console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "TODAY") {
    Item.findByIdAndRemove(checkedID).exec();
    res.redirect("/");

  } else { 
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedID}}}).exec();
    res.redirect("/" + listName);
  } 
});





app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.listen(3000, function() {
  console.log("Server started on heroku port");
});
