import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtGuard } from 'src/@guards/jwt.guards';
import { RolesGuard } from 'src/@guards/roles.guards';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/users/entity/users.entity';
import { CreateProductDto } from './dto/products.dto';
import { Product } from './entity/products.entity';
import { filename, imageFileFilter } from './helpers/storage.helpers';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.Seller)
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'static/products',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async createProduct(
    @Req() req,
    @Body() payload: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    return this.productService.createProduct(req.user, payload, file);
  }

  @Get('/')
  async getProducts(
    @Req() req,
    @Query('page',new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit',new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    return this.productService.getProducts(page, limit);
  }

  @Get('/nearest')
  async getNearestProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit',new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise <any> {
    //Can use when in production
    //const ipAddress = req.socket.remoteAddress;
    //console.log(ipAddress);

       const longitude = 85.323960; //my current long
       const latitude = 27.717245;  // my current lat

    //     const longitude = 84.3542; //Chitwan long
    //      const latitude = 27.5291;  // Chitwan lat

    //const longitude = 85.3059; //Sanepa long
    //const latitude = 27.6844; // Sanepa lat

    return await this.productService.getNearestProducts(longitude, latitude, page, limit);
  }
}
