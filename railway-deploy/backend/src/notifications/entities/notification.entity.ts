import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    type: string;

    @Column()
    channel: string;

    @Column()
    priority: 'low' | 'normal' | 'high';

    @Column()
    status: 'unread' | 'read' | 'archived';

    @Column({ type: 'json' })
    data: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    readAt: Date;
}