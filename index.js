const express = require("express");
const cors = require("cors");
const app = express();
let { book } = require("./models/book.model");
let { user } =  require("./models/user.model");
let { like } = require("./models/like.model");
let { Op } = require("@sequelize/core");
const { sequelize } = require("./lib/index");
const { Sequelize } = require("sequelize");

app.use(express.json());
app.use(cors());

let bookData = [
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Fiction',
      year: 1960,
      summary: 'A novel about the serious issues of rape and racial inequality.',
    },
    {
      title: '1984',
      author: 'George Orwell',
      genre: 'Dystopian',
      year: 1949,
      summary: 'A novel presenting a dystopian future under a totalitarian regime.',
    },
    {
      title: 'Moby-Dick',
      author: 'Herman Melville',
      genre: 'Adventure',
      year: 1851,
      summary: 'The narrative of the sailor Ishmael and the obsessive quest of Ahab.',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      genre: 'Romance',
      year: 1813,
      summary: 'A romantic novel that charts the emotional development of the protagonist Elizabeth Bennet.',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      year: 1925,
      summary: 'A novel about the American dream and the roaring twenties.',
    },
  ];

  let userData = {
    username: 'booklover',
    email: 'booklover@gmail.com',
    password: 'password123',
  };

  // Defining a route to seed the database
  app.get("/seed_db", async (req, res) => {
    try{
       await sequelize.sync({ force: true });
       await book.bulkCreate(bookData);
       await user.create({
        username: "booklover",
        email: "booklover@gmail.com",
        password: "password123",
       });

       return res.status(200).json({ message: "Database seeding successful." }); 
    } catch(error){
        return res.status(500).json({ message: "Error seeding the database", error: error.message });
    }
  });

// function to like a book
async function likeBook(data){
  let newLike = await like.create({
    userId: data.userId,
    bookId: data.bookId,
  });

  return { message: "Book liked.", newLike };
};  

// Endpoint to like a book
app.get("/users/:id/like", async (req, res) => {
 try{
  let userId = parseInt(req.params.id);
  let bookId = parseInt(req.query.bookId);
  let response = await likeBook({userId, bookId});

  return res.status(200).json(response);
 } catch(error){
  return res.status(500).json({ message: "Error liking the book", error: error.message });
 }
});  

// function to dislike a book
async function dislikeBook(data){
  let count = await like.destroy({ where: {
   userId: data.userId,
   bookId: data.bookId,
  }});
  
  if(count === 0){
    return {};
  }
   
  return { message: "Book disliked." };
}

// Endpoint to dislike a book 
app.get("/users/:id/dislike", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let bookId = parseInt(req.query.bookId);
    let response = await dislikeBook({ userId, bookId });
    
    if(!response.message){
      return res.status(404).json({ message: "This book is not in your liked list." });
    }

    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Error disliking the book", error: error.message });
  }
});

// function to get all liked books
async function allLikedBooks(userId){
  let bookIds = await like.findAll({
    where: {userId},
    attributes: ["bookId"],
  });
  
  let bookRecords = [];

  for(let i=0; i<bookIds.length; i++){
    bookRecords.push(bookIds[i].bookId);
  }

  let likedBooks = await book.findAll({
   where: { id: { [Op.in] : bookRecords } }
  });

  return { likedBooks };
}

// Endpoint to get all liked books
app.get("/users/:id/liked", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let response = await allLikedBooks(userId);

    if(response.likedBooks.length === 0){
      return res.status(404).json({ message: "No liked books found." });
    }
    
    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Error fetching all liked books", error: error.message });
  }
});

app.listen(3000, () => {
 console.log("Sever is running on Port : 3000");
});
