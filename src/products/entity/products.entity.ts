import { Point } from "geojson";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/entity/users.entity';

@Entity("products")
export class Product extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column({type: "text", nullable: true})
    image: string;

    @Column({
        type: 'geography',
        nullable: true,
        spatialFeatureType: 'Point',
        srid: 4326,
      })
      location: Point;

    @ManyToOne(()=> User, user=> user.products)
    @JoinColumn({name: "seller"})
    seller: User;


}