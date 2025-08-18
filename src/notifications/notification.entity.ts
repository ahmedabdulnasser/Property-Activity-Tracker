import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  message: string;

  @Column({ default: "info" })
  type: string;

  @Column({ default: "unread" })
  status: string;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  timestamp: Date;
}
