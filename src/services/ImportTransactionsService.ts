import fs from 'fs';
import csv from 'csv-parse';
import TransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import multerConfig from '../config/upload';

const transactions: Transaction[] = [];

interface RequestDTO {
  title: string;
  value: number;
  type: string;
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    // TODO
    const transactionService = new TransactionService();

    fs.createReadStream(`${multerConfig.directory}/${fileName}`)
      .pipe(
        csv({
          trim: true,
          columns: ['title', 'type', 'value', 'category'],
        }),
      )
      .on('data', async ({ title, value, type, category }: RequestDTO) => {
        const rowTransaction = await transactionService.execute({
          title,
          value,
          type,
          category,
        });

        transactions.push(rowTransaction);
      })
      .on('end', () => {
        return transactions;
      });
    return transactions;
  }
}

export default ImportTransactionsService;
