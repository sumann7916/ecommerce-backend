import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'geojson';
import { User } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/products.dto';
import { Product } from './entity/products.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private userService : UsersService
    ){}

    async createProduct(user: User, payload:CreateProductDto, file: Express.Multer.File):Promise<Product>{
        payload.image = file.path;
        const seller =await this.userService.findById(user.id);
        const location = seller.location
        
        return this.productRepository.save({
            seller:user,
            title: payload.title,
            description: payload.description,
            price : payload.price,
            image: payload.image,
            location
        })
    }

    async getProducts(): Promise <Product[]> {
        return this.productRepository.find();
    }

    async getNearestProducts(latitude: number, longitude: number): Promise<Product[]> {

        //Not working
        // const point: Point = {
        //   type: 'Point',
        //   coordinates: [longitude, latitude],
        // };
        // const nearestProducts = await this.productRepository
        //   .createQueryBuilder('product')
        //   .select('product.*, ST_Distance(product.location, ST_GeomFromGeoJSON(:point)) as distance')
        //   .setParameter('point', JSON.stringify(point))
        //   .orderBy('distance')
        //   .getMany();
        const query = `
        SELECT *, ST_Distance(location, ST_SetSRID(ST_Point($2, $1), 4326)) as distance
        FROM products
        ORDER BY distance ASC
      `;
      const nearestProducts = await this.productRepository.query(query, [longitude, latitude]);
      
      return nearestProducts;
      }
}
