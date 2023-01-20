import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

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
