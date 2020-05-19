import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('orders')
class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Customer, {
    cascade: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToMany(() => OrdersProducts, ordersproducts => ordersproducts.product, {
    cascade: ['insert'],
  })
  @JoinTable({ name: 'order_products' })
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Order;
