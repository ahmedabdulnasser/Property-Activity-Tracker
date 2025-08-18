import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SalesRep } from "./sales-rep.entity";
import { Property } from "./property.entity";
import { ActivityType } from "./activity-type.entity";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  timestamp: Date;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  salesRepId: number;

  @Column({ nullable: true })
  propertyId: number;

  @Column({ nullable: true })
  activityTypeId: number;

  @ManyToOne(() => SalesRep, (salesRep) => salesRep.activities, { eager: true })
  @JoinColumn()
  salesRep: SalesRep;

  @ManyToOne(() => Property, (property) => property.activities, { eager: true })
  @JoinColumn()
  property: Property;

  @ManyToOne(() => ActivityType, (activityType) => activityType.activities, {
    eager: true,
  })
  @JoinColumn()
  activityType: ActivityType;

  @CreateDateColumn()
  createdAt: Date;
}
