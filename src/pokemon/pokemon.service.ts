import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}
  
  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto ); // se envuelve codigo por posibles excepcion

      return pokemon;

    } catch (error){
      this.handleExeptions(error); // muestra el error por consola
    }
  }

  findAll() {
    
    return this.pokemonModel.find();
  }

  //trae o no un pokemon con el termino recibido
  async findOne(term: string) {

    //revisar constantemente si es que se encontro o no un pokemon y guardar el pokemon encontrado
    let pokemon: Pokemon;

    // revisa si term es un numero de num pokemon
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({num:term});

      // revisa si term es un mongo id
    } if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);

      //verificar si no se ha encontrado un Pokemon
    } if (!pokemon) {

      // Convertir el nombre a minúsculas y eliminar los espacios al principio y al final.
      const searchTerm = term.toLowerCase().trim();

      pokemon = await this.pokemonModel.findOne({name: searchTerm});

    } if (!pokemon) {
      throw new NotFoundException(`Pokemon con id, nombre o numero "${term}" no se encuentra o no existe`);
    } 
      
    

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemonUpdate = await this.findOne(term);
    //pasa el nombre del pokemon a minuscula para que siempre se mantenga persistencia en los datos
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    
    try {
      //se ingresan los nuevos datos de la actualizacion a pokemonUpdate
      await pokemonUpdate.updateOne(updatePokemonDto);
      //se convinan los datos el objeto con la informacion del DTO
      return {...pokemonUpdate.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();
    // return { id };
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    //
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
     if (deletedCount == 0){
      throw new BadRequestException(`pokemon con id "${ id }" no existe`);
     }
      

    return "Eliminacion exitosa" ;
  }

 

  handleExeptions(error:any){
    // se manda cuando ocurre ese codigo de error
    if (error.code == 11000) {
      throw new BadRequestException(`pokemon existe en base de datos con ${JSON.stringify(error.keyValue)}`)
      
    }
    //muestra en log el error y manda este mensaje para que se revise el problema 
    console.log(error);
    throw new InternalServerErrorException(`no se puede crear pokemon - comprobar log del servidor`);
  }
}


