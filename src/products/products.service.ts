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

    async getProducts(page:number, limit: number): Promise <any> {
      const offset = (page - 1) * limit;
      const products = this.productRepository.find({
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });
      const productCount = await this.productRepository.count();
      const lastPage = Math.ceil(productCount / limit);

      return {
        products,
        page,
        lastPage
      };
    }

    async getNearestProducts(latitude: number, longitude: number, page: number, limit: number): Promise<any> {

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
        const offset = (page-1)* limit;
        const query = `
        SELECT *, ST_Distance(location, ST_SetSRID(ST_Point($2, $1), 4326)) as distance
        FROM products
        ORDER BY distance ASC
        LIMIT $3
        OFFSET $4
      `;
      const productCount = await this.productRepository.count()
      const lastPage = Math.ceil(productCount/limit)
      const nearestProducts = await this.productRepository.query(query, [longitude, latitude, limit, offset]);
      
      return {
        nearestProducts,
        page,
        lastPage
    };
      }
}
