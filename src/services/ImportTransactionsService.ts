import fs from 'fs';
import csv from 'csv-parse';

import { response } from 'express';
import TransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import multerConfig from '../config/upload';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    // TODO
    const transactionService = new TransactionService();

    const transactions: RequestDTO[] = [];

    const responseTransaction = await new Promise(resolve => {
      fs.createReadStream(`${multerConfig.directory}/${fileName}`)
        .pipe(
          csv({
            trim: true,
            columns: true, // ['title', 'type', 'value', 'category'],
          }),
        )
        .on('data', ({ title, type, value, category }: RequestDTO) => {
          transactions.push({
            title,
            type,
            value,
            category,
          });
        })
        .on('end', async () => {
          const tempTransactions: Transaction[] = [];
          transactions.forEach(
            async (
              { title, value, type, category }: RequestDTO,
              index,
              array,
            ) => {
              const rowTransaction = await transactionService.execute({
                title,
                value,
                type,
                category,
              });
              tempTransactions.push(rowTransaction);
              if (tempTransactions.length === array.length) {
                resolve(tempTransactions);
              }
            },
          );
        });
    });
    await fs.promises.unlink(`${multerConfig.directory}/${fileName}`);

    return responseTransaction as Transaction[];
  }
}

export default ImportTransactionsService;
