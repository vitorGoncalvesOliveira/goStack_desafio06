import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import CreateReturnCategory from './CreateOrReturnCategory';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('There is not enought balance ');
    }

    const createCategory = new CreateReturnCategory();
    const categoryTransaction = await createCategory.execute({ category });

    const transaction = await transactionRepository.create({
      category_id: categoryTransaction.id,
      title,
      value,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
