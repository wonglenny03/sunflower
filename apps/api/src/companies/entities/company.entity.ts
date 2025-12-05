import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { SearchHistory } from '../../search-history/entities/search-history.entity'

@Entity('companies')
@Index(['companyName'])
@Index(['email'])
@Index(['website'])
@Index(['userId'])
@Index(['country'])
@Index(['keywords'])
@Index(['createdAt'])
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  companyName: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string

  @Column({ type: 'varchar', length: 50 })
  country: string

  @Column({ type: 'varchar', length: 255 })
  keywords: string

  @Column({ type: 'boolean', default: false })
  emailSent: boolean

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date

  @Column({
    type: 'varchar',
    length: 20,
    default: 'not_sent',
  })
  emailStatus: 'not_sent' | 'sent' | 'failed'

  @Column({ type: 'uuid' })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'uuid', nullable: true })
  searchHistoryId: string

  @ManyToOne(() => SearchHistory, { nullable: true })
  @JoinColumn({ name: 'searchHistoryId' })
  searchHistory: SearchHistory

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

