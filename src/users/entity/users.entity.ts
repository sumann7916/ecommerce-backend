import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from 'bcrypt';
import { Product } from "src/products/entity/products.entity";
import { Geometry, Point } from 'geojson';

export enum Role {
    Customer = 'customer',
    Seller = 'seller',
    Admin = 'admin'
}

@Entity({name:"users"})
export class User extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique:true})
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({default:Role.Customer})
    role: Role;

    @Column({
        type: 'geography',
        nullable: true,
        spatialFeatureType: 'Point',
        srid: 4326,
      })
      location: Point;

    @Column()
    streetAddress: string;

    @Column()
    city: string;

    @Column()
    country: string;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Product, product => product.seller)
    products: Product[];

}

