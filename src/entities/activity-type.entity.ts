import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Activity } from "./activity.entity";

@Entity()
export class ActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ default: 10 })
  weight: number; // Points value for this activity type

  @OneToMany(() => Activity, (activity) => activity.activityType)
  activities: Activity[];
}
