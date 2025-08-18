import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Activity } from "./activity.entity";

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  propertyName: string;

  @Column()
  address: string;

  @Column("decimal", { precision: 10, scale: 8 })
  latitude: number;

  @Column("decimal", { precision: 11, scale: 8 })
  longitude: number;

  @OneToMany(() => Activity, (activity) => activity.property)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
