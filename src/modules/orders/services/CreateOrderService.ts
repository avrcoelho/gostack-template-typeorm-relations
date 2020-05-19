import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomerExists = await this.customersRepository.findById(
      customer_id,
    );

    if (!checkCustomerExists) {
      throw new AppError('Customer not found');
    }

    const productsId = products.map(product => ({ id: product.id }));

    const productsData = await this.productsRepository.findAllById(productsId);

    const productsDUpdatedQuantity = productsData.map(productData => {
      const data = products.find(product => product.id === productData.id);

      const lessQuantity = data ? data.quantity : 0;

      return {
        ...productData,
        quantity: productData.quantity - lessQuantity,
        product_id: productData.id,
      };
    });

    await this.productsRepository.updateQuantity(productsDUpdatedQuantity);

    const productsAddPrice = products.map(product => {
      const data = productsData.find(
        productData => product.id === productData.id,
      );

      const price = data ? data.price : 0;

      return { product_id: product.id, quantity: product.quantity, price };
    });

    const order = await this.ordersRepository.create({
      customer: checkCustomerExists,
      products: productsAddPrice,
    });

    return order;
  }
}

export default CreateProductService;
