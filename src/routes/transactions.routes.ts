import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import multerConfig from '../config/upload';

const transactionsRouter = Router();

const upload = multer(multerConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = await getCustomRepository(
    TransactionsRepository,
  );

  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, category, type } = request.body;

  const transactionService = new CreateTransactionService();
  const transaction = await transactionService.execute({
    value,
    title,
    category,
    type,
  });

  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);

  return response.status(201).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { originalname } = request.file;
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute(originalname);

    response.json(transactions);
  },
);

export default transactionsRouter;
