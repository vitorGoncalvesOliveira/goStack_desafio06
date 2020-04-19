import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface RequestDTO {
  category: string;
}

class CreateOrReturnCategory {
  public async execute({ category }: RequestDTO): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const categoryExist = await categoryRepository.findOne({
      title: category.trim(),
    });
    if (categoryExist) {
      return categoryExist;
    }

    const categoryInstace = await categoryRepository.create({
      title: category,
    });
    await categoryRepository.save(categoryInstace);

    return categoryInstace;
  }
}

export default CreateOrReturnCategory;
