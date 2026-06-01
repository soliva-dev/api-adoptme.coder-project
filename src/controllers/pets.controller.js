import PetDTO from '../dto/Pet.dto.js';
import { petsService } from '../services/index.js';
import __dirname from '../utils/index.js';

const getAllPets = async (req, res) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: 'success', payload: pets });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const createPet = async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) return res.status(400).send({ status: 'error', error: 'Incomplete values' });
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const updatePet = async (req, res) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        await petsService.update(petId, petUpdateBody);
        res.send({ status: 'success', message: 'pet updated' });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const deletePet = async (req, res) => {
    try {
        const petId = req.params.pid;
        await petsService.delete(petId);
        res.send({ status: 'success', message: 'pet deleted' });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const createPetWithImage = async (req, res) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) return res.status(400).send({ status: 'error', error: 'Incomplete values' });
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `${__dirname}/../public/img/${file.filename}`
        });
        const result = await petsService.create(pet);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
};
