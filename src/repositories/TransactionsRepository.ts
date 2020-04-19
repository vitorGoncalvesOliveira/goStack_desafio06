import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    if (!transactions) {
      throw new AppError('There is not transaction created', 400);
    }

    const income = transactions.filter(transaction => {
      return transaction.type === 'income';
    });

    const outcome = transactions.filter(transaction => {
      return transaction.type === 'outcome';
    });

    const incomeValue = income.reduce((total, _income) => {
      return total + _income.value;
    }, 0);

    const outcomeValue = outcome.reduce((total, _outcome) => {
      return total + _outcome.value;
    }, 0);

    return {
      income: incomeValue,
      outcome: outcomeValue,
      total: incomeValue - outcomeValue,
    };
  }
}

export default TransactionsRepository;
