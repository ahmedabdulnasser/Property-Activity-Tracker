import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Activity } from "./activity.entity";

@Entity()
export class SalesRep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score: number;

  @Column()
  userId: number;

  @OneToOne(() => User, (user) => user.salesRep)
  @JoinColumn()
  user: User;

  @OneToMany(() => Activity, (activity) => activity.salesRep)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
