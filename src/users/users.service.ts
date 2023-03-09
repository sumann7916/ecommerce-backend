import { Body, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto} from './dto/user.dto';
import { Role, User } from './entity/users.entity';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/decorators/roles.decorator';
import { Point } from 'geojson';

@Injectable()
export class UsersService {
    getUserByEmail(email: string) {
        throw new Error('Method not implemented.');
    }
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}
    async doUserRegistration(@Body() payload: CreateUserDto): Promise<any> {
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(payload.password, salt);
        payload.password = hashpassword;
        
        //Save User
        const savedUser = this.userRepository.create(payload);

        //If user is a seller and has given location 
        if(payload.longitude && payload.latitude && payload.role == Role.Seller){
            
            savedUser.location = {
                type: "Point",
                coordinates: [parseFloat(payload.longitude), parseFloat(payload.latitude)],
            };
            const location: Point = savedUser.location;
            console.log(location.coordinates);
            
            
        }
        await savedUser.save()

        const {password, ...others} = savedUser;
        return others;
    }
    
    async findById(id: any): Promise<User> {
        return await this.userRepository.findOneById(id)
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({where:{email: email}})
    }

}
