import { Exclude } from 'class-transformer';
import { Report } from '../reports/reports.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  admin: boolean;

  /**
   * `() => Report` tells TypeORM that the attribute is going to be of `Report Entity type
   *                and `() =>` is there to resolve the circular dependency issue
   * `(report) => report.user` this is how TypeORM manage entities
   */
  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  // Hooks only work when save() and remove() is being used
  // hooks doesn't work whe insert, update, or delete is used directly
  @AfterInsert() // using insert hook
  logInsert() {
    console.log('Insert User with id', this.id);
  }

  @AfterUpdate() // using update hook
  logUpdate() {
    console.log('Update User with id', this.id);
  }

  @AfterRemove() // using remove hook
  logRemove() {
    console.log('Remove User with id', this.id);
  }
}
