import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Company } from '../../companies/entities/company.entity'

@Entity('search_history')
@Index(['userId'])
@Index(['createdAt'])
@Index(['keywords'])
@Index(['country'])
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'varchar', length: 255 })
  keywords: string

  @Column({ type: 'varchar', length: 50 })
  country: string

  @Column({ type: 'int', default: 0 })
  resultCount: number

  @Column({ type: 'jsonb', nullable: true })
  searchParams: Record<string, any>

  @OneToMany(() => Company, (company) => company.searchHistory)
  companies: Company[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

