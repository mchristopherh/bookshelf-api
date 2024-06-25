const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Load books data from JSON file
let books = require('./data.json');

// Helper to save data to JSON file
const saveData = (data) => {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

app.post('/books', (req, res) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.body;
  if (!name) {
    return res.status(400).send({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    });
  }

  if (readPage > pageCount) {
    return res.status(400).send({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    });
  }

  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const isFinished = pageCount === readPage;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: isFinished,
    reading,
    insertedAt: timestamp,
    updatedAt: timestamp
  };

  books.push(newBook);
  saveData(books);

  res.status(201).send({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id
    }
  });
});

app.get('/books', (req, res) => {
  const { name, reading, finished } = req.query;
  let filteredBooks = books;

  if (name) {
    filteredBooks = filteredBooks.filter(b => b.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading !== undefined) {
    filteredBooks = filteredBooks.filter(b => b.reading === !!Number(reading));
  }

  if (finished !== undefined) {
    filteredBooks = filteredBooks.filter(b => b.finished === !!Number(finished));
  }

  res.send({
    status: 'success',
    data: {
      books: filteredBooks.map(b => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher
      }))
    }
  });
});

app.get('/books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).send({
      status: 'fail',
      message: 'Buku tidak ditemukan'
    });
  }

  res.send({
    status: 'success',
    data: {
      book
    }
  });
});

app.put('/books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.body;
  const timestamp = new Date().toISOString();

  if (!name) {
    return res.status(400).send({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    });
  }

  if (readPage > pageCount) {
    return res.status(400).send({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    });
  }

  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) {
    return res.status(404).send({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan'
    });
  }

  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished: pageCount === readPage,
    updatedAt: timestamp
  };

  saveData(books);
  res.send({
    status: 'success',
    message: 'Buku berhasil diperbarui'
  });
});

app.delete('/books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const index = books.findIndex(b => b.id === bookId);

  if (index === -1) {
    return res.status(404).send({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan'
    });
  }

  books.splice(index, 1);
  saveData(books);
  res.send({
    status: 'success',
    message: 'Buku berhasil dihapus'
  });
});

const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
