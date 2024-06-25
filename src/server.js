import Hapi from '@hapi/hapi';
import { nanoid } from 'nanoid';
import buku from './buku.js';

const startServer = async () => {
  const app = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  app.route([
    {
      method: 'POST',
      path: '/books',
      handler: (req, h) => {
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = req.payload;

        if (!name) {
          return h
            .response({
              status: 'fail',
              message: 'Gagal menambahkan buku. Mohon isi nama buku',
            })
            .code(400);
        }

        if (readPage > pageCount) {
          return h
            .response({
              status: 'fail',
              message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
            })
            .code(400);
        }

        const id = nanoid(16);
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
          updatedAt: timestamp,
        };

        buku.push(newBook);

        return h
          .response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
              bookId: id,
            },
          })
          .code(201);
      },
    },
    {
      method: 'GET',
      path: '/books',
      handler: (req, h) => {
        const { name, reading, finished } = req.query;
        let filteredBooks = buku;

        if (name) {
          filteredBooks = filteredBooks.filter((b) =>
            b.name.toLowerCase().includes(name.toLowerCase())
          );
        }

        if (reading !== undefined) {
          filteredBooks = filteredBooks.filter(
            (b) => b.reading === !!Number(reading)
          );
        }

        if (finished !== undefined) {
          filteredBooks = filteredBooks.filter(
            (b) => b.finished === !!Number(finished)
          );
        }

        const response = {
          status: 'success',
          data: {
            books: filteredBooks.map((b) => ({
              id: b.id,
              name: b.name,
              publisher: b.publisher,
            })),
          },
        };
        return h.response(response).code(200);
      },
    },
    {
      method: 'GET',
      path: '/books/{bookId}',
      handler: (req, h) => {
        const { bookId } = req.params;
        const book = buku.find((b) => b.id === bookId);

        if (!book) {
          return h
            .response({
              status: 'fail',
              message: 'Buku tidak ditemukan',
            })
            .code(404);
        }

        return h
          .response({
            status: 'success',
            data: {
              book,
            },
          })
          .code(200);
      },
    },
    {
      method: 'PUT',
      path: '/books/{bookId}',
      handler: (req, h) => {
        const { bookId } = req.params;
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = req.payload;
        const timestamp = new Date().toISOString();

        if (!name) {
          return h
            .response({
              status: 'fail',
              message: 'Gagal memperbarui buku. Mohon isi nama buku',
            })
            .code(400);
        }

        if (readPage > pageCount) {
          return h
            .response({
              status: 'fail',
              message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            })
            .code(400);
        }

        const index = buku.findIndex((b) => b.id === bookId);

        if (index === -1) {
          return h
            .response({
              status: 'fail',
              message: 'Gagal memperbarui buku. Id tidak ditemukan',
            })
            .code(404);
        }

        buku[index] = {
          ...buku[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
          finished: pageCount === readPage,
          updatedAt: timestamp,
        };

        return h
          .response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
          })
          .code(200);
      },
    },
    {
      method: 'DELETE',
      path: '/books/{bookId}',
      handler: (req, h) => {
        const { bookId } = req.params;
        const index = buku.findIndex((b) => b.id === bookId);

        if (index === -1) {
          return h
            .response({
              status: 'fail',
              message: 'Buku gagal dihapus. Id tidak ditemukan',
            })
            .code(404);
        }

        buku.splice(index, 1);
        return h
          .response({
            status: 'success',
            message: 'Buku berhasil dihapus',
          })
          .code(200);
      },
    },
  ]);

  await app.start();
  console.log('Server berjalan pada %s', app.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

startServer();
